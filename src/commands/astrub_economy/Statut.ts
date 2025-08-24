import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    Guild,
    MessageFlags,
    SendableChannels,
    SlashCommandSubcommandBuilder
} from "discord.js";
import AbstractSubCommand from "../../utils/AbstractSubCommand";
import {QuestService} from "../../services/QuestService";
import {QuestEnum, QuestTemplates} from "../../models/astrub_economy/QuestTemplate";
import JobUtil from "../../services/JobUtil";
import {Buildings} from "../../models/astrub_economy/Building";
import BuildingGuild from "../../models/astrub_economy/BuildingGuild";
import {ReserveService} from "../../services/ReserveService";
import {PopulationService} from "../../services/PopulationService";
import Job from "../../models/astrub_economy/Job";
import {Op} from "sequelize";
import {JobEnum} from "../../models/astrub_economy/Enums";
import {Meteos} from "../../models/astrub_economy/Meteo";
import {MeteoService} from "../../services/MeteoService";
import {PlayerService} from "../../services/PlayerService";
import Player from "../../models/astrub_economy/Player";

export default class Statut extends AbstractSubCommand {
    name: string = 'statut';
    description: string = "Voir l'état d'Astrub (quêtes, bâtiments, réserve)";

    readonly OPTION_TYPE = 'type';
    readonly TYPE_QUESTS = 'quetes';
    readonly TYPE_BUILDINGS = 'batiments';
    readonly TYPE_RESERVE = 'reserve';
    readonly TYPE_POPULATION = 'population'
    readonly TYPE_RECOLTEURS = 'recolteurs';
    readonly TYPE_METEO = 'meteo';

    protected addOptions(builder: SlashCommandSubcommandBuilder) {
        builder.addStringOption(option => option
            .setName(this.OPTION_TYPE)
            .setDescription('Type d\'information à afficher')
            .setRequired(true)
            .addChoices({name: 'Quêtes en cours', value: this.TYPE_QUESTS}, {
                name: 'Bâtiments',
                value: this.TYPE_BUILDINGS
            }, {name: 'Réserve communautaire', value: this.TYPE_RESERVE}, {
                name: 'Population',
                value: this.TYPE_POPULATION
            }, {name: 'Récolteurs', value: this.TYPE_RECOLTEURS}, {name: 'Météo', value: this.TYPE_METEO}));
    }

    public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const type = interaction.options.getString(this.OPTION_TYPE);

        switch (type) {
            case this.TYPE_QUESTS:
                await this.showQuests(interaction);
                break;
            case this.TYPE_BUILDINGS:
                await this.showBuildings(interaction);
                break;
            case this.TYPE_RESERVE:
                await this.showReserve(interaction);
                break;
            case this.TYPE_POPULATION:
                await this.showPopulation(interaction);
                break;
            case this.TYPE_RECOLTEURS:
                await this.showRecolteurs(interaction);
                break;
            case this.TYPE_METEO:
                await this.showMeteo(interaction);
                break;
            default:
                await interaction.reply({
                    content: 'Type d\'information non reconnu.', flags: MessageFlags.Ephemeral
                });
        }
    }

    private async showQuests(interaction: ChatInputCommandInteraction): Promise<void> {
        const quests = await QuestService.getActiveQuests(interaction.guildId as string);

        if (quests.length === 0) {
            await interaction.reply({
                content: 'Aucune quête disponible actuellement.', flags: MessageFlags.Ephemeral
            });
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle('Quêtes disponibles')
            .setColor('#0099ff')

        for (const quest of quests) {
            const questTemplate = QuestTemplates[quest.name as QuestEnum];

            if (!questTemplate) {
                continue;
            }

            // Construire la liste des objets requis avec pourcentage
            const requiredItemsText = Object.entries(questTemplate.requiredItems)
                .map(([itemName, requiredQuantity]) => {
                    const providedQuantity = quest.itemsProvided[itemName] || 0;
                    const progressPercent = Math.min(100, Math.round((providedQuantity / requiredQuantity) * 100));
                    return `- ${itemName} : ${providedQuantity}/${requiredQuantity} (${progressPercent} %)`;
                })
                .join('\n');

            const rewardAmount = QuestService.calculReward(questTemplate)
            const rewardType = questTemplate.rewardType === 'kamas' ? 'kamas' : 'joie';

            // Calcul du temps restant
            const duration = 24 * 60 * 60 * 1000;
            const remainingTime = duration - (Date.now() - quest.createdAt.getTime());

            let timeString = "";
            const remainingHours = Math.floor(remainingTime / (60 * 60 * 1000));
            const remainingMinutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));

            if (remainingHours) {
                timeString = `${remainingHours}h ${remainingMinutes}min`;
            } else {
                timeString = `${remainingMinutes}min`;
            }

            embed.addFields({
                name: `${quest.name}`,
                value: `${questTemplate.description}\n\n**Objets requis : **\n${requiredItemsText}\n\n**Récompense : ** ${rewardAmount} ${rewardType}\n\n**Temps restant : ** ${timeString}`
            });
        }

        await interaction.reply({embeds: [embed]});
    }

    private async showBuildings(interaction: ChatInputCommandInteraction): Promise<void> {
        const guildId = interaction.guild?.id;
        if (!guildId) {
            return;
        }

        const buildings = Object.values(Buildings);
        const completedBuildingNames = await JobUtil.getBuildingsGuild(interaction.guild);

        const embed = new EmbedBuilder()
            .setTitle('Bâtiments d\'Astrub')
            .setColor("#0099ff")
            .setTimestamp();

        if (completedBuildingNames.length > 0) {
            embed.addFields({name: 'Bâtiments constuits', value: `${completedBuildingNames.length}`});

            for (const buildingName of completedBuildingNames) {
                const building = JobUtil.getBuilding(buildingName);
                if (building) {
                    embed.addFields({
                        name: building.name, value: building.description
                    });
                }
            }
        }

        const buildingsInProgress = await BuildingGuild.findAll({
            where: {
                guildId: guildId, status: "in_progress"
            }
        });

        if (buildingsInProgress.length > 0) {
            embed.addFields({name: 'Bâtiments en construction', value: `${buildingsInProgress.length}`});

            for (const buildingGuild of buildingsInProgress) {
                const building = JobUtil.getBuilding(buildingGuild.name);
                if (building) {
                    embed.addFields({
                        name: building.name, value: building.description
                    });
                }
            }
        }

        const notStartedBuildings = buildings.filter(building => !completedBuildingNames.includes(building.name) && !buildingsInProgress.some(bg => bg.name === building.name));

        if (notStartedBuildings.length > 0) {
            embed.addFields({name: 'Bâtiments à construire', value: `${notStartedBuildings.length}`});

            for (const building of notStartedBuildings) {
                embed.addFields({
                    name: building.name, value: building.description
                });
            }
        }

        await interaction.reply({embeds: [embed]});
    }

    private async showReserve(interaction: ChatInputCommandInteraction): Promise<void> {
        if (!interaction.guild) {
            return;
        }

        const reserveItems = await ReserveService.getReserveItems(interaction.guild);

        if (reserveItems.length === 0) {
            await interaction.reply({
                content: 'La réserve est vide.', flags: MessageFlags.Ephemeral
            });
            return;
        }

        const table = this.formatReserveTable(reserveItems);

        const embed = new EmbedBuilder()
            .setTitle('Contenu de la Réserve Communautaire')
            .setDescription(table)
            .setColor('#0099ff')
            .setTimestamp();

        await interaction.reply({embeds: [embed]});
    }

    private formatReserveTable(items: any[]): string {
        const header = `| Nom                    | Quantité |`;
        const separator = `|------------------------|----------|`;

        const rows = items.map(item => {
            return `| ${item.name.padEnd(22)} | ${item.quantity.toString().padStart(8)} |`;
        });

        return `\`\`\`\n${header}\n${separator}\n${rows.join('\n')}\n\`\`\``;
    }

    private async showPopulation(interaction: ChatInputCommandInteraction) {
        const guildId = interaction.guild?.id;
        if (!guildId) {
            await interaction.reply({
                content: 'Cette commande ne peut être utilisée que dans un serveur', flags: MessageFlags.Ephemeral
            });
            return;
        }

        const embed = await PopulationService.getEmbedPopulation(guildId);

        await interaction.reply({embeds: [embed]});
    }

    private async showRecolteurs(interaction: ChatInputCommandInteraction) {

        await interaction.reply({content: "Voici les récolteurs !", flags: MessageFlags.Ephemeral});

        // Actifs depuis 72 heures
        for (const [key, jobName] of Object.entries(JobEnum)) {
            const jobs = await Job.findAll({
                where: {
                    guildId: interaction.guild?.id, name: jobName,
                }, order: [['experience', 'DESC']]
            });

            if (!jobs.length) {
                continue
            }

            const textJob = []
            for (const index in jobs) {
                const playerId = jobs[index].userId;

                const player = await Player.findOne({
                    where: {
                        id: playerId, guildId: interaction.guild?.id, lastHarvest: {
                            [Op.gte]: new Date(Date.now() - 72 * 60 * 60 * 1000)
                        }
                    }
                })

                if (!player) {
                    continue
                }

                const username = await JobUtil.getUsername(playerId, interaction.guild as Guild);

                let first = ''
                if (index === '0') {
                    first = '👑 '
                }

                textJob.push(`**${first}${username}** - Niveau ${jobs[index].level}`);
            }

            const emoji = Job.getEmoji(jobName);

            const embed = new EmbedBuilder()
                .setTitle(`${emoji} ${jobName}`)
                .setDescription(textJob.join(`\n`))
                .setColor('#0099ff')
                .setTimestamp();

            const channel: SendableChannels = interaction.channel as SendableChannels;
            await channel.send({embeds: [embed]});
        }
    }

    private async showMeteo(interaction: ChatInputCommandInteraction): Promise<void> {
        const guildId = interaction.guild?.id;
        if (!guildId) {
            await interaction.reply({
                content: 'Cette commande ne peut être utilisée que dans un serveur', flags: MessageFlags.Ephemeral
            });
            return;
        }

        let meteoName = await MeteoService.chargerMeteo(guildId);

        if (!meteoName) {
            await MeteoService.updateMeteo(guildId);
            meteoName = await MeteoService.chargerMeteo(guildId);
        }

        if (!meteoName) {
            await interaction.reply({content: 'Aucune météo actuellement', flags: MessageFlags.Ephemeral});
            return;
        }

        const meteo = Object.values(Meteos).find(r => r.name === meteoName) ?? null;

        if (!meteo) {
            await interaction.reply({content: 'Aucune météo actuellement', flags: MessageFlags.Ephemeral});
            return;
        }

        await interaction.reply({content: meteo.getText()});
    }
}