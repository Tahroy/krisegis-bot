import AbstractSubCommand from "../../utils/AbstractSubCommand";
import {
    ApplicationCommandOptionChoiceData,
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    CommandInteraction,
    EmbedBuilder,
    MessageFlags,
    TextChannel
} from "discord.js";
import {Building as BuildingModel, Buildings} from "../../models/astrub_economy/Building";
import JobUtil from "./JobUtil";
import jobUtil from "./JobUtil";
import {SlashCommandSubcommandBuilder} from "@discordjs/builders";
import BuildingGuild from "../../models/astrub_economy/BuildingGuild";
import {ItemType, PlayerService} from "../../services/playerItemService";
import PlayerItem from "../../models/PlayerItem";

class Building extends AbstractSubCommand {
    name = 'building';
    description = "Gérer les bâtiments d'Astrub";

    static readonly ACTION_BUILD = 'build';
    static readonly ACTION_VIEW = 'view';

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const guildId = interaction.guild?.id;
        if (!guildId) {
            await interaction.reply({
                content: 'Cette commande ne peut être utilisée que dans un serveur', flags: MessageFlags.Ephemeral
            })
            return;
        }

        const action = interaction.options.getString('action');

        switch (action) {
            case Building.ACTION_BUILD:
                await this.executeBuild(interaction);
                break;
            case Building.ACTION_VIEW:
                await this.executeView(interaction);
                break;
            default:
                await interaction.reply({
                    content: 'Action non reconnue', flags: MessageFlags.Ephemeral
                });
        }
    }

    protected addOptions(builder: SlashCommandSubcommandBuilder) {
        builder.addStringOption(option => option.setName('action')
            .setDescription('Action à effectuer')
            .setRequired(true)
            .addChoices({name: 'Construire un bâtiment', value: Building.ACTION_BUILD}, {
                name: 'Voir les bâtiments', value: Building.ACTION_VIEW
            }));

        // Options for build action
        builder.addStringOption(option => option.setName('build')
            .setDescription("Bâtiment à construire")
            .setRequired(false)
            .setAutocomplete(true));

        builder.addStringOption(option => option.setName('item')
            .setDescription("Objet de construction")
            .setRequired(false)
            .setAutocomplete(true));

        builder.addIntegerOption(option => option.setName('quantity')
            .setDescription("Quantité")
            .setRequired(false));
    }

    async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
        const guildId = interaction.guild?.id;
        if (!guildId) {
            await interaction.respond([]);
            return;
        }

        const options = interaction.options;
        const focused = options.getFocused(true);
        const action = options.getString('action');

        // Only provide autocomplete for build action
        if (action !== Building.ACTION_BUILD) {
            await interaction.respond([]);
            return;
        }

        let retour: ApplicationCommandOptionChoiceData[] = [];
        switch (focused.name) {
            case 'build':
                retour = await this.getBuildsAutocomplete(interaction);
                break;
            case 'item':
                retour = await this.getBuildingItemsAvailable(interaction, guildId);
                break;
        }

        await interaction.respond(retour);
    }

    private async executeBuild(interaction: ChatInputCommandInteraction): Promise<void> {
        const guildId = interaction.guild?.id;
        if (!guildId) {
            return;
        }

        const buildOption = interaction.options.getString('build');
        const ressource = interaction.options.getString('item');
        const quantity = interaction.options.getInteger('quantity');

        if (!buildOption || !ressource || !quantity) {
            await interaction.reply({
                content: 'Veuillez choisir une construction, une ressource et une quantité',
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        const building = JobUtil.getBuilding(buildOption);

        if (!building) {
            await interaction.reply({
                content: 'Veuillez choisir une construction valide', flags: MessageFlags.Ephemeral
            });
            return;
        }

        let buildingGuild = await BuildingGuild.findOne({
            where: {
                guildId: guildId, name: building.name
            }
        });

        if (!buildingGuild) {
            const emptyRecipe = jobUtil.getEmptyRecipe(building);
            buildingGuild = await BuildingGuild.create({
                guildId: guildId, name: building.name, status: "in_progress", resourcesContributed: emptyRecipe
            });
        }

        if (buildingGuild.status !== "in_progress") {
            await interaction.reply({
                content: 'La construction est terminée !', flags: MessageFlags.Ephemeral
            });
            return;
        }

        // Check si le joueur a la quantité nécessaire
        const playerItem = await PlayerItem.findOne({
            where: {
                userId: interaction.user.id, name: ressource, guildId: guildId
            }
        });

        if (!playerItem || playerItem.get('quantity') < quantity) {
            await interaction.reply({
                content: "Vous n'avez pas la quantité nécessaire pour construire", flags: MessageFlags.Ephemeral
            });
            return;
        }

        const contributionActuelle = buildingGuild.resourcesContributed[ressource];
        const contributionNecessaire = building.recipe[ressource];

        const restant = contributionNecessaire - contributionActuelle;
        const finalQuantity = Math.min(quantity, restant);

        const updatedResources = buildingGuild.resourcesContributed;
        updatedResources[ressource] = contributionActuelle + finalQuantity;

        await BuildingGuild.update({
            resourcesContributed: updatedResources
        }, {
            where: {
                guildId: guildId, name: building.name
            }
        });

        await PlayerService.addPlayerItem(interaction.user, ressource, ItemType.RESSOURCE, -finalQuantity, guildId);
        await buildingGuild.save();

        const user = interaction.user;
        const memberCatch = await interaction.guild?.members.fetch(user.id);
        const userName = memberCatch?.nickname ?? user.globalName ?? user.username;

        await interaction.reply({
            content: `${userName} a ajouté ${finalQuantity} x ${ressource} à la construction de ${building.name}`,
        });

        await this.checkBuildingGuild(buildingGuild, interaction);
    }

    private async executeView(interaction: CommandInteraction): Promise<void> {
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
            embed.addFields({name: 'Bâtiments construits', value: ""});

            for (const buildingName of completedBuildingNames) {
                const building = JobUtil.getBuilding(buildingName);
                if (building) {
                    const buildingInfo = this.getBuildingInfos(building);
                    embed.addFields({name: '\u200B', value: buildingInfo});
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
            embed.addFields({name: 'Bâtiments en construction', value: ''});

            for (const buildingGuild of buildingsInProgress) {
                const building = JobUtil.getBuilding(buildingGuild.name);
                if (building) {
                    const buildingInfo = this.getBuildingInfos(building);
                    embed.addFields({name: '\u200B', value: buildingInfo});
                }
            }
        }

        const notStartedBuildings = buildings.filter(building => !completedBuildingNames.includes(building.name) && !buildingsInProgress.some(bg => bg.name === building.name));

        if (notStartedBuildings.length > 0) {
            embed.addFields({name: 'Bâtiments à construire', value: ""});

            for (const building of notStartedBuildings) {
                const buildingInfo = this.getBuildingInfos(building);
                embed.addFields({name: '\u200B', value: buildingInfo});
            }
        }

        await interaction.reply({embeds: [embed]});
    }

    private async getBuildsAutocomplete(interaction: AutocompleteInteraction): Promise<ApplicationCommandOptionChoiceData[]> {
        const options = interaction.options;
        const focused = options.getFocused(true);
        const search = focused.value;

        const buildings = Object.values(Buildings);
        const alreadyBuilt = await JobUtil.getBuildingsGuild(interaction.guild);
        const retour = [];

        for (const building of buildings) {
            if (retour.length >= 20) {
                break;
            }

            if (alreadyBuilt.includes(building.name)) {
                continue;
            }

            if (building.name.toLowerCase().startsWith(search.toLowerCase()) || !search) {
                let recipe = [];

                for (const [ingredient, quantity] of Object.entries(building.recipe)) {
                    recipe.push(`${ingredient} x ${quantity}`);
                }

                const label = `${building.name} (${recipe.join(' / ')})`.substring(0, 100);

                retour.push({
                    name: label, value: building.name,
                });
            }
        }

        return retour;
    }

    private async getBuildingItemsAvailable(interaction: AutocompleteInteraction, guildId: string): Promise<ApplicationCommandOptionChoiceData[]> {
        const options = interaction.options;
        const focused = options.getFocused(true);
        const search = focused.value;

        const buildName = interaction.options.get('build');
        const building = JobUtil.getBuilding(buildName?.value as string);

        if (!building) {
            return [];
        }

        const retour = [];

        for (const [ingredient, quantity] of Object.entries(building.recipe)) {
            let buildingGuild = await BuildingGuild.findOne({
                where: {
                    guildId: guildId, name: building.name
                }
            });

            let contributionActuelle = 0;
            if (buildingGuild) {
                contributionActuelle = buildingGuild.resourcesContributed[ingredient] ?? 0;
            }

            if (contributionActuelle >= quantity) {
                continue;
            }

            if (retour.length >= 20) {
                break;
            }

            if (ingredient.toLowerCase().startsWith(search.toLowerCase()) || !search) {
                retour.push({
                    name: `${ingredient}: ${contributionActuelle ?? 0} / ${quantity} `, value: ingredient,
                });
            }
        }

        return retour;
    }

    private async checkBuildingGuild(buildingGuild: BuildingGuild, interaction: CommandInteraction): Promise<void> {
        if (!interaction.isChatInputCommand()) {
            return;
        }
        if (buildingGuild.status !== "in_progress") {
            return;
        }

        const building = JobUtil.getBuilding(buildingGuild.name);

        if (!building) {
            return;
        }

        let completed = true;
        for (const [ingredient, quantity] of Object.entries(buildingGuild.resourcesContributed)) {
            const contributionNecessaire = building.recipe[ingredient];
            if (quantity < contributionNecessaire) {
                completed = false;
                break;
            }
        }

        if (completed) {
            buildingGuild.set('status', "completed");
            await buildingGuild.save();

            if (interaction.channel) {
                const myChannel = interaction.channel as TextChannel;

                const build = JobUtil.getBuilding(buildingGuild.name);
                if (!build) {
                    return;
                }

                const embed = new EmbedBuilder()
                    .setTitle(`La construction de ${building.name} est terminée, bravo à vous !`)
                    .setColor("#0099ff");

                await myChannel.send({embeds: [embed]});
            }
        }
    }

    private getBuildingInfos(building: BuildingModel) {
        return `- **${building.name}** : ${building.shortDescription} - *${building.description}*`
    }
}

export default Building;
