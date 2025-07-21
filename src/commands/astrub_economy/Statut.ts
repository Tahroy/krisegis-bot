import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    MessageFlags,
    SlashCommandSubcommandBuilder
} from "discord.js";
import AbstractSubCommand from "../../utils/AbstractSubCommand";
import {QuestService} from "../../services/questService";
import {QuestEnum, QuestTemplates} from "../../models/astrub_economy/QuestTemplate";
import JobUtil from "../../services/JobUtil";
import {Buildings} from "../../models/astrub_economy/Building";
import BuildingGuild from "../../models/astrub_economy/BuildingGuild";
import {ReserveService} from "../../services/reserveService";
import {PopulationService} from "../../services/populationService";

export default class Statut extends AbstractSubCommand {
    name: string = 'statut';
    description: string = "Voir l'état d'Astrub (quêtes, bâtiments, réserve)";

    readonly OPTION_TYPE = 'type';
    readonly TYPE_QUESTS = 'quetes';
    readonly TYPE_BUILDINGS = 'batiments';
    readonly TYPE_RESERVE = 'reserve';
    readonly TYPE_POPULATION = 'population'

    protected addOptions(builder: SlashCommandSubcommandBuilder) {
        builder.addStringOption(option => option
            .setName(this.OPTION_TYPE)
            .setDescription('Type d\'information à afficher')
            .setRequired(true)
            .addChoices(
                {name: 'Quêtes en cours', value: this.TYPE_QUESTS},
                {name: 'Bâtiments', value: this.TYPE_BUILDINGS},
                {name: 'Réserve communautaire', value: this.TYPE_RESERVE},
                {name: 'Population', value: this.TYPE_POPULATION}
            ));
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
            default:
                await interaction.reply({
                    content: 'Type d\'information non reconnu.',
                    flags: MessageFlags.Ephemeral
                });
        }
    }

    private async showQuests(interaction: ChatInputCommandInteraction): Promise<void> {
        const quests = await QuestService.getActiveQuests(interaction.guildId as string);

        if (quests.length === 0) {
            await interaction.reply({
                content: 'Aucune quête disponible actuellement.',
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle('Quêtes disponibles')
            .setColor('#0099ff')
            .setDescription('Voici les quêtes actuellement disponibles à Astrub:');

        for (const quest of quests) {
            const questTemplate = QuestTemplates[quest.name as QuestEnum];

            if (!questTemplate) {
                continue;
            }

            // Construire la liste des objets requis avec progression
            const requiredItemsText = Object.entries(questTemplate.requiredItems)
                .map(([itemName, requiredQuantity]) => {
                    const providedQuantity = quest.itemsProvided[itemName] || 0;
                    const progressPercent = Math.min(100, Math.round((providedQuantity / requiredQuantity) * 100));
                    return `- ${itemName}: ${providedQuantity}/${requiredQuantity} (${progressPercent} %)`;
                })
                .join('\n');

            const rewardAmount = QuestService.calculReward(questTemplate)
            const rewardType = questTemplate.rewardType === 'kamas' ? 'kamas' : 'joie';

            embed.addFields({
                name: `${quest.name} (ID: ${quest.id})`,
                value: `${questTemplate.description}\n\n**Objets requis : **\n${requiredItemsText}\n\n**Récompense : ** ${rewardAmount} ${rewardType}`
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
            embed.addFields({name: 'Bâtiments', value: "construits"});

            for (const buildingName of completedBuildingNames) {
                const building = JobUtil.getBuilding(buildingName);
                if (building) {
                    embed.addFields({
                        name: building.name,
                        value: building.description
                    });
                }
            }
        } else {
            embed.addFields({name: 'Bâtiments construits', value: "Aucun bâtiment n'a encore été construit."});
        }

        const buildingsInProgress = await BuildingGuild.findAll({
            where: {
                guildId: guildId, status: "in_progress"
            }
        });

        if (buildingsInProgress.length > 0) {
            embed.addFields({name: 'Bâtiments', value: 'en construction'});

            for (const buildingGuild of buildingsInProgress) {
                const building = JobUtil.getBuilding(buildingGuild.name);
                if (building) {
                    embed.addFields({
                        name: building.name,
                        value: building.description
                    });
                }
            }
        }

        const notStartedBuildings = buildings.filter(building => 
            !completedBuildingNames.includes(building.name) && 
            !buildingsInProgress.some(bg => bg.name === building.name)
        );

        if (notStartedBuildings.length > 0) {
            embed.addFields({name: 'Bâtiments', value: "à construire"});

            for (const building of notStartedBuildings) {
                embed.addFields({
                    name: building.name,
                    value: building.description
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
                content: 'La réserve est vide.',
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        const table = this.formatReserveTable(reserveItems);

        const embed = new EmbedBuilder()
            .setTitle('Contenu de la Réserve Communautaire')
            .setDescription(table)
            .setColor('#0099ff')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
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
                content: 'Cette commande ne peut être utilisée que dans un serveur',
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        const embed = await PopulationService.getEmbedPopulation(guildId);

        await interaction.reply({embeds: [embed]});
    }
}