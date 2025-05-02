import {AutocompleteInteraction, CommandInteraction, MessageFlags, User} from "discord.js";
import AbstractSubCommand from "../../utils/AbstractSubCommand";
import {SlashCommandSubcommandBuilder} from "@discordjs/builders";
import Job from '../../models/astrub_economy/Job'
import Player from "../../models/astrub_economy/Player";
import {ItemType, PlayerService} from "../../services/playerItemService";
import JobUtil from "./JobUtil";
import Ressource, {Ressources} from "../../models/astrub_economy/Ressource";
import {Meteos} from "../../models/astrub_economy/Meteo";

class Recolte extends AbstractSubCommand {
    description: string = "Récolter des ressources (toutes les 15 minutes)";
    name: string = "recolte";

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
        const ressourceChoice = options.getString('ressource');

        if (!ressourceChoice) {
            await interaction.reply({content: "Vous devez choisir une ressource !", flags: MessageFlags.Ephemeral})
            return;
        }

        const item = JobUtil.getRessource(ressourceChoice);
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
        const level = JobUtil.getLevelFromXP(job.experience)

        let text = `**${userName}** a récolté ${quantity} x ${emoji ? emoji : ressource} !`;

        if (isJackpot) {
            text += `\n 🎉 Dégoulinant.e de sueur, **${userName}** revient avec une récolte exceptionnelle ! :tada:`;
        }

        if (level != job.level) {
            text += `\n**${userName}** passe ${job.name} niveau ${level} !`
        }

        await job.update({experience: job.experience, level: level});

        await interaction.reply({content: text,});
    }

    protected addOptions(builder: SlashCommandSubcommandBuilder) {
        builder.addStringOption(
            option => option.setName("ressource").setRequired(true).setDescription("Ressource à récolter").setAutocomplete(true)
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
            // Si au-dessus du level 1, on vérifie
            if (ressource.level > 1) {
                const job = await Job.findOne({
                    where: {
                        userId: interaction.user.id,
                        name: ressource.job,
                        guildId: guildId
                    }
                })

                if (!job || job.level < ressource.level) {
                    continue
                }
            }

            responses.push({name: ressource.name, value: ressource.name})
        }

        await interaction.respond(responses)
    }

    getRandomInt(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
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
        const meteoName = await JobUtil.chargerMeteo(guildId);
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
        const baseAmount = Math.ceil((jobLevel - itemLevel) / 2);

        // 5% de chance de jackpot (x2)
        if (Math.random() < 0.05) {
            const jackpot = Math.floor(baseAmount * 2);
            const final = Math.ceil(jackpot * (percent / 100));
            return {
                quantity: Math.max(final, 1),
                isJackpot: true
            };
        }

        const minValue = 0.7
        const maxValue = 1.4;

        const random = Math.random() * (maxValue - minValue) + minValue

        const quantity = Math.ceil(Math.floor(baseAmount * random));
        const final = Math.ceil(quantity * (percent / 100));

        return {
            quantity: Math.max(final, 1),
            isJackpot: false
        };
    }

    /**
     * Calcule l'expérience gagnée pour une récolte
     */
    private async getExperience(job: Job, item: Ressource, guildId: string) {
        let percent = 100;

        const meteoName = await JobUtil.chargerMeteo(guildId);
        if (meteoName) {
            const meteo = Object.values(Meteos).find(r => r.name === meteoName) ?? null
            if (meteo !== null) {
                const effect = meteo.effects.find(e => e.job === job.name) ?? null

                if (effect !== null) {
                    percent -= effect.value
                }
            }
        }

        const experienceBase = item.level === 10 ? 40 : 10;

        return Math.ceil(experienceBase * (percent / 100));
    }
}

export default Recolte;