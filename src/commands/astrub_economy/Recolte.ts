import {AutocompleteInteraction, CommandInteraction, MessageFlags, User} from "discord.js";
import AbstractSubCommand from "../../utils/AbstractSubCommand";
import {SlashCommandSubcommandBuilder} from "@discordjs/builders";
import Job from '../../models/astrub_economy/Job'
import Player from "../../models/astrub_economy/Player";
import {ItemType, PlayerService} from "../../services/PlayerService";
import Ressource, {Ressources} from "../../models/astrub_economy/Ressource";
import {Meteos} from "../../models/astrub_economy/Meteo";
import JobUtil from "../../services/JobUtil";
import {MeteoService} from "../../services/MeteoService";
import ItemService from "../../services/ItemService";

class Recolte extends AbstractSubCommand {
    description: string = "Récolter des ressources (toutes les 15 minutes)";
    name: string = "recolte";
    private static readonly OPTION_RESSOURCE = 'ressource';

    public async execute(interaction: CommandInteraction): Promise<void> {
        if (!interaction.isChatInputCommand()) {
            return;
        }

        const guildId = interaction.guild?.id;
        if (!guildId) {
            await interaction.reply({
                content: 'Cette commande ne peut être utilisée que dans un serveur',
                flags: MessageFlags.Ephemeral
            })
            return;
        }

        const options = interaction.options;
        const ressourceChoice = options.getString(Recolte.OPTION_RESSOURCE);

        if (!ressourceChoice) {
            await interaction.reply({content: "Vous devez choisir une ressource !", flags: MessageFlags.Ephemeral})
            return;
        }

        const item = ItemService.getResource(ressourceChoice);
        if (!item) {
            await interaction.reply({content: "Cette ressource n'existe pas !", flags: MessageFlags.Ephemeral})
            return
        }

        const emoji = await JobUtil.getEmoji(item, interaction.client) + ' '

        const player: Player = await JobUtil.getPlayer(interaction.user, guildId);
        const job: Job = await player.getJob(item.job ?? '');

        // Si la dernière récolte était il y a moins de 15 min, on refuse
        if (player.lastHarvest && JobUtil.isLessThanXMinutesAgo(player.lastHarvest, 15)) {
            const timeBeforeNext = JobUtil.getTimeBeforeNextHarvest(player.lastHarvest, 15)

            const minutes = Math.floor((timeBeforeNext % 3600000) / 60000)
            const seconds = Math.floor((timeBeforeNext % 60000) / 1000)

            const pluralM = minutes <= 1 ? '' : 's'
            const pluralS = seconds <= 1 ? '' : 's'

            await interaction.reply({
                content: `Vous pourrez récolter dans ${minutes} minute${pluralM} et ${seconds} seconde${pluralS}.`,
                flags: MessageFlags.Ephemeral
            })
            return;
        }

        const ressource = ressourceChoice;

        if (item && item.level > job.level) {
            await interaction.reply({
                content: `Vous devez avoir un niveau ${item.level} pour récolter ${ressource} !`,
                flags: MessageFlags.Ephemeral
            })
            return
        }

        const {quantity, isJackpot} = await this.getQuantity(job, item?.level ?? 1, guildId);
        const xp: number = await this.getExperience(job, item, guildId);
        job.experience += xp;

        await PlayerService.addPlayerItem(interaction.user, ressource, ItemType.RESSOURCE, quantity, guildId)

        await Player.update({lastHarvest: new Date()}, {
            where: {userId: interaction.user.id, guildId: guildId}
        })

        const user = interaction.user;

        const guild = interaction.guild
        const memberCatch = await guild?.members.fetch(user.id)
        const userName = memberCatch?.nickname ?? user.globalName
        const level = PlayerService.getLevelFromXP(job.experience)

        let text = `**${userName}** a récolté ${quantity} x ${emoji ? emoji : ressource} !`;

        if (isJackpot) {
            text += `\n 🎉 Dégoulinant.e de sueur, **${userName}** revient avec une récolte exceptionnelle !`;
        }

        if (level != job.level) {
            text += `\n**${userName}** passe ${job.name} niveau ${level} !`
        }

        await job.update({experience: job.experience, level: level});

        await interaction.reply({content: text,});
    }

    protected addOptions(builder: SlashCommandSubcommandBuilder) {
        builder.addStringOption(
            option => option.setName(Recolte.OPTION_RESSOURCE).setRequired(true).setDescription("Ressource à récolter").setAutocomplete(true)
        )
    }

    async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
        const guildId = interaction.guild?.id;
        if (!guildId) {
            await interaction.respond([]);
            return;
        }
        const ressources: Ressource[] = Object.values(Ressources).sort((a, b) => a.name.localeCompare(b.name))

        const responses = [];
        for (const ressource of ressources) {
            if (!ressource.job) {
                continue;
            }

            const player: Player = await JobUtil.getPlayer(interaction.user, guildId);
            const job: Job = await player.getJob(ressource.job ?? '');

            // Si au-dessus du level 1, on vérifie
            if (ressource.level > 0) {
                if (!job || job.level < ressource.level) {
                    continue
                }
            }

            const xp = await this.getExperience(job, ressource, interaction.guildId ?? '')

            responses.push({name: `${Job.getEmoji(ressource.job)} ${ressource.name} - ${xp} xp`, value: ressource.name})
        }

        await interaction.respond(responses)
    }

    /**
     * Calcule la quantité de ressources récoltées
     */
    private async getQuantity(job: Job, itemLevel: number, guildId: string): Promise<{
        quantity: number,
        isJackpot: boolean
    }> {
        let percent = 100;

        const jobLevel = job.level;
        const meteoName = await MeteoService.chargerMeteo(guildId);
        if (meteoName) {
            const meteo = Object.values(Meteos).find(r => r.name === meteoName) ?? null
            if (meteo !== null) {
                const effect = meteo.effects.find(e => e.job === job.name) ?? null

                if (effect !== null) {
                    percent += effect.value
                }
            }
        }

        // On prend la base : job.level - ressource.level
        const baseAmount = jobLevel - itemLevel + 1;

        // 5% de chance de jackpot (x2)
        if (Math.random() < 0.05) {
            const jackpot = baseAmount * 2;
            const final = Math.floor(jackpot * (percent / 100));
            return {
                quantity: Math.max(final, 1),
                isJackpot: true
            };
        }

        const minValue = 0.7
        const maxValue = 1.4;

        const random = Math.random() * (maxValue - minValue) + minValue

        const quantity = baseAmount * random;
        const final = Math.floor(quantity * (percent / 100));

        return {
            quantity: Math.max(final, 1),
            isJackpot: false
        };
    }

    /**
     * Calcule l'expérience gagnée pour une récolte
     */
    private async getExperience(job: Job, item: Ressource, guildId: string): Promise<number> {
        let percent = 100;

        const meteoName = await MeteoService.chargerMeteo(guildId);
        if (meteoName) {
            const meteo = Object.values(Meteos).find(r => r.name === meteoName) ?? null
            if (meteo !== null) {
                const effect = meteo.effects.find(e => e.job === job.name) ?? null

                if (effect !== null) {
                    percent -= effect.value
                }
            }
        }


        const experienceBase = JobUtil.getExperienceByLevel(item.level)

        return Math.floor(experienceBase * (percent / 100));
    }
}

export default Recolte;
