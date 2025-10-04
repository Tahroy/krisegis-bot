import {AutocompleteInteraction, CommandInteraction, Guild, MessageFlags, User} from "discord.js";
import AbstractSubCommand from "../../utils/AbstractSubCommand";
import {SlashCommandSubcommandBuilder} from "@discordjs/builders";
import Job from '../../models/astrub_economy/Job'
import Player from "../../models/astrub_economy/Player";
import {PlayerService} from "../../services/PlayerService";
import Resource, {Ressources} from "../../models/astrub_economy/Resource";
import {Meteos, MeteosEnum} from "../../models/astrub_economy/Meteo";
import JobUtil from "../../services/JobUtil";
import {MeteoService} from "../../services/MeteoService";
import ItemService from "../../services/ItemService";
import {LevelEnum} from "../../models/astrub_economy/Enums";
import PlayerItem from "../../models/PlayerItem";
import {ItemType} from "../../utils/Enums";

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
                content: 'Cette commande ne peut être utilisée que dans un serveur', flags: MessageFlags.Ephemeral
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

        // On calcule le délai entre 2 récoltes (par défaut 15 min)
        const meteoName = await MeteoService.chargerMeteo(guildId);
        let cooldownMinutes = 15;
        if (meteoName === MeteosEnum.IRE_DJAUL) {
            // +10% => 16 minutes 30 secondes
            cooldownMinutes = 16.5;
        }

        // Si la dernière récolte est trop récente, on refuse
        if (player.lastHarvest && JobUtil.isLessThanXMinutesAgo(player.lastHarvest, cooldownMinutes)) {
            const timeBeforeNext = JobUtil.getTimeBeforeNextHarvest(player.lastHarvest, cooldownMinutes)

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

        const user = interaction.user;
        const guild = interaction.guild

        const {quantity, isJackpot, usedTool} = await this.getQuantity(job, item?.level ?? 1, user, guild);
        const xp: number = await this.getExperience(job, item, guildId);
        job.experience += xp;

        await PlayerService.addPlayerItem(interaction.user, ressource, ItemType.RESSOURCE, quantity, guildId)

        // On retire 1 de durabilité à l'outil s'il y en a un
        if (usedTool) {
            const current = usedTool.durability ?? 1
            usedTool.durability = Math.max((current ?? 0) - 1, 0);
            await usedTool.save();
        }

        await Player.update({lastHarvest: new Date()}, {
            where: {userId: interaction.user.id, guildId: guildId}
        })

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
        builder.addStringOption(option => option.setName(Recolte.OPTION_RESSOURCE).setRequired(true).setDescription("Ressource à récolter").setAutocomplete(true))
    }

    async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
        const options = interaction.options
        const focused = options.getFocused(true)
        const search = focused.value
        const guildId = interaction.guild?.id;
        if (!guildId) {
            await interaction.respond([]);
            return;
        }
        const ressources: Resource[] = Object.values(Ressources).sort((a, b) => {
            const jobA  = a.job ?? "";
            const jobB = b.job ?? "";

            return jobA.localeCompare(jobB);
        })

        const responses = [];
        for (const ressource of ressources) {
            if (!ressource.job) {
                continue;
            }

            if (search && !ressource.name.toLowerCase().includes(search.toLowerCase())) {
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
    private async getQuantity(job: Job, itemLevel: number, user: User, guild: Guild): Promise<{
        quantity: number, isJackpot: boolean, usedTool?: PlayerItem
    }> {
        let percent = 100;

        const jobLevel = job.level;
        const meteoName = await MeteoService.chargerMeteo(guild.id);
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
        const { bonus: extra, usedTool } = await this.getToolBonus(job.name, user, guild);

        // 5% de chance de jackpot (x2)
        if (Math.random() < 0.05) {
            const jackpot = baseAmount * 2;
            const final = Math.floor(jackpot * (percent / 100));

            return {
                quantity: Math.max(final + extra, 1), isJackpot: true, usedTool
            };
        }

        const minValue = 0.7
        const maxValue = 1.4;

        const random = Math.random() * (maxValue - minValue) + minValue

        const quantity = baseAmount * random;
        const final = Math.floor(quantity * (percent / 100));

        return {
            quantity: Math.max(final + extra, 1),
            isJackpot: false,
            usedTool: usedTool
        };
    }

    private async getToolBonus(jobName: string, user: User, guild: Guild): Promise<{ bonus: number, usedTool?: PlayerItem }> {
        try {
            const tools = await PlayerService.getItems(user, [ItemType.OUTIL], guild);
            if (!tools || tools.length === 0) {
                return {bonus: 0};
            }

            let best: { level: number, item: PlayerItem } | null = null;

            for (const item of tools) {
                const craft = ItemService.getCraft(item.name);
                if (!craft) {
                    continue;
                }
                const targetsJob = (craft.jobs || []).some(j => j === jobName);
                if (!targetsJob) {
                    continue;
                }

                if ((item.durability ?? 0) <= 0) {
                    continue;
                }

                const level = craft.level ?? 0;
                if (!best || level > best.level) {
                    best = {
                        level: level,
                        item: item
                    };
                }
            }

            if (!best) {
                return {bonus: 0};
            }

            switch (best.level) {
                default:
                case LevelEnum.LEVEL_0:
                    return { bonus: 1, usedTool: best.item };
                case LevelEnum.LEVEL_10:
                    return { bonus: 1 + (Math.random() < 0.25 ? 1 : 0), usedTool: best.item };
                case LevelEnum.LEVEL_20:
                    return { bonus: 1 + (Math.random() < 0.5 ? 1 : 0), usedTool: best.item };
            }
        } catch (e) {
            console.error(e)
            return { bonus: 0 };
        }
    }

    /**
     * Calcule l'expérience gagnée pour une récolte
     */
    private async getExperience(job: Job, item: Resource, guildId: string): Promise<number> {
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
