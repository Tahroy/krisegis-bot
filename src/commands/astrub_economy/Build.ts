import AbstractSubCommand from "../../utils/AbstractSubCommand";
import {AutocompleteInteraction, CommandInteraction, EmbedBuilder, MessageFlags, TextChannel} from "discord.js";
import {Buildings} from "../../models/astrub_economy/Building";
import JobUtil from "./JobUtil";
import {SlashCommandSubcommandBuilder} from "@discordjs/builders";
import {ApplicationCommandOptionChoiceData} from "discord.js/typings";
import BuildingGuild from "../../models/astrub_economy/BuildingGuild";
import jobUtil from "./JobUtil";
import {ItemType, PlayerService} from "../../services/playerItemService";
import PlayerItem from "../../models/PlayerItem";
import {join} from "path";

class Build extends AbstractSubCommand {
    name = 'build';
    description = 'Aider à la construction de bâtiments';

    async execute(interaction: CommandInteraction): Promise<void> {
        if (!interaction.isChatInputCommand()) {
            return;
        }


        const buildOption = interaction.options.getString('build');
        const ressource = interaction.options.getString('item');
        const quantity = interaction.options.getInteger('quantity');

        if (!buildOption || !ressource || !quantity) {
            await interaction.reply({content: 'Veuillez choisir une construction', flags: MessageFlags.Ephemeral})
            return
        }

        const building = JobUtil.getBuilding(buildOption);

        if (!building) {
            await interaction.reply({content: 'Veuillez choisir une construction', flags: MessageFlags.Ephemeral})
            return
        }

        let buildingGuild = await BuildingGuild.findOne({
            where: {guildId: interaction.guild?.id ?? '0', name: building.name}
        })

        if (!buildingGuild) {
            const emptyRecipe = jobUtil.getEmptyRecipe(building)
            buildingGuild = await BuildingGuild.create({
                guildId: interaction.guild?.id ?? '0',
                name: building.name,
                status: "in_progress",
                resourcesContributed: emptyRecipe
            })
        }

        if (buildingGuild.status !== "in_progress") {
            await interaction.reply({content: 'La construction est terminée !', flags: MessageFlags.Ephemeral})
            return
        }

        // Check si le joueur a la quantité nécessaire
        const playerItem = await PlayerItem.findOne({where: {user_id: interaction.user.id, name: ressource}})

        if (!playerItem || playerItem.get('quantity') < quantity) {
            await interaction.reply({
                content: "Vous n'avez pas la quantité nécessaire pour construire",
                flags: MessageFlags.Ephemeral
            })
            return;
        }

        const contributionActuelle = buildingGuild.resourcesContributed[ressource]
        const contributionNecessaire = building.recipe[ressource]

        const restant = contributionNecessaire - contributionActuelle

        const finalQuantity = Math.min(quantity, restant)

        const updatedResources = {...buildingGuild.resourcesContributed}; // Clone l'objet
        updatedResources[ressource] += finalQuantity; // Mets à jour la valeur

        buildingGuild.set('resourcesContributed', updatedResources); // Mets à jour explicitement
        await PlayerService.addPlayerItem(interaction.user, ressource, ItemType.RESSOURCE, -finalQuantity)
        await buildingGuild.save();

        const user = interaction.user;
        const memberCatch = await interaction.guild?.members.fetch(user.id)
        const userName = memberCatch?.nickname ?? user.globalName

        await interaction.reply({
            content: `${userName} a ajouté ${finalQuantity} x ${ressource} à la construction de ${building.name}`,
        })

        await this.checkBuildingGuild(buildingGuild, interaction);
    }

    protected addOptions(builder: SlashCommandSubcommandBuilder) {
        builder.addStringOption(
            option => option.setName('build').setDescription("Bâtiment à construire").setRequired(true).setAutocomplete(true)
        ).addStringOption(
            option => option.setName('item').setDescription("Objet de construction").setRequired(true).setAutocomplete(true)
        ).addIntegerOption(
            option => option.setName('quantity').setDescription("Quantité").setRequired(true)
        )
    }

    async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
        const options = interaction.options
        const focused = options.getFocused(true)

        let retour: any = []
        switch (focused.name) {
            case 'build':
                retour = await this.getBuildsAutocomplete(interaction)
                break;
            case 'item':
                retour = await this.getBuildingItemsAvailable(interaction)
                break;
        }

        console.log(retour);


        await interaction.respond(retour);
    }

    private async getBuildsAutocomplete(interaction: AutocompleteInteraction): Promise<ApplicationCommandOptionChoiceData[]> {
        const options = interaction.options
        const focused = options.getFocused(true)
        const search = focused.value

        const buildings = Object.values(Buildings)

        const alreadyBuilt = await JobUtil.getBuildingsGuild(interaction.guild)

        const retour = [];

        for (const building of buildings) {
            if (retour.length >= 20) {
                break;
            }

            if (alreadyBuilt.includes(building.name)) {
                continue;
            }

            if (building.name.toLowerCase().startsWith(search.toLowerCase()) || !search) {
                let recipe = "";

                for (const [ingredient, quantity] of Object.entries(building.recipe)) {
                    recipe += `${ingredient} x ${quantity} `;
                }

                retour.push({
                    name: `${building.name} (${recipe})`,
                    value: building.name,
                });
            }
        }

        return retour;
    }

    private async getBuildingItemsAvailable(interaction: AutocompleteInteraction): Promise<ApplicationCommandOptionChoiceData[]> {
        const options = interaction.options
        const focused = options.getFocused(true)
        const search = focused.value

        const buildName = interaction.options.get('build');

        const building = JobUtil.getBuilding(buildName?.value as string);

        if (!building) {
            return [];
        }

        const retour = [];

        for (const [ingredient, quantity] of Object.entries(building.recipe)) {

            let buildingGuild = await BuildingGuild.findOne({
                where: {guildId: interaction.guild?.id ?? '0', name: building.name}
            })

            let restant = quantity;
            if (buildingGuild) {
                const contributionActuelle = buildingGuild.resourcesContributed[ingredient]
                const contributionNecessaire = building.recipe[ingredient]
                restant = contributionNecessaire - contributionActuelle
            }

            if (retour.length >= 20) {
                break;
            }

            if (ingredient.toLowerCase().startsWith(search.toLowerCase()) || !search) {
                retour.push({
                    name: `${ingredient}: ${restant} / ${quantity} `,
                    value: ingredient,
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

        const building = JobUtil.getBuilding(buildingGuild.name)

        if (!building) {
            return;
        }

        let completed = true;
        for (const [ingredient, quantity] of Object.entries(buildingGuild.resourcesContributed)) {
            const contributionNecessaire = building.recipe[ingredient]
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

                const build = JobUtil.getBuilding(buildingGuild.name)
                if (!build) {
                    return
                }

                const image = join(__dirname, '..', '..', '..', 'assets', 'buildings', `${build?.image}`)

                const embed = new EmbedBuilder()
                    .setTitle(`La construction de ${building.name} est terminée, bravo à vous !`)
                    .setColor("#0099ff")
                    .setImage(`attachment://${build.image}`)

                await myChannel.send({
                    embeds: [embed],
                    files: [image]
                })
            }
        }
    }
}

export default Build