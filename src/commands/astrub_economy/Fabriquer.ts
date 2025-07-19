import AbstractSubCommand from "../../utils/AbstractSubCommand";
import {AutocompleteInteraction, CommandInteraction, MessageFlags} from "discord.js";
import {SlashCommandSubcommandBuilder} from "@discordjs/builders";
import JobUtil from "../../services/JobUtil";
import PlayerItem from "../../models/PlayerItem";
import {ItemType, PlayerService} from "../../services/playerItemService";
import Job from "../../models/astrub_economy/Job";
import BuildingGuild from "../../models/astrub_economy/BuildingGuild";

class Fabriquer extends AbstractSubCommand {
    description: string = 'Créer un object';
    name: string = 'fabriquer';

    OPTION_NAME = 'produit'
    OPTION_QUANTITY = 'quantite';

    async execute(interaction: CommandInteraction): Promise<void> {
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

        const itemName: string | null = options.getString(this.OPTION_NAME);
        const craftQuantity = options.getInteger(this.OPTION_QUANTITY);

        if (!itemName || !craftQuantity) {
            await interaction.reply({
                content: "Commande incorrecte",
                flags: MessageFlags.Ephemeral
            })
            return;
        }

        const item = JobUtil.getItem(itemName);

        if (!item) {
            await interaction.reply({
                content: "Cet objet ne peut pas être fabriqué",
                flags: MessageFlags.Ephemeral
            })
            return
        }

        if (typeof item.recipe !== 'object' || item.recipe === null) {
            await interaction.reply({content: "Commande incorrecte", flags: MessageFlags.Ephemeral})
            return;
        }

        // Check des ingrédients
        for (let [ingredient, quantity] of Object.entries(item.recipe)) {
            const playerItem = await PlayerItem.findOne({
                where: {
                    userId: interaction.user.id,
                    name: ingredient,
                    guildId: guildId
                }
            })

            if (!playerItem || playerItem.quantity < (quantity * craftQuantity)) {
                await interaction.reply({
                    content: `Vous n'avez pas la quantité de ${ingredient} nécessaire pour fabriquer ${itemName}`,
                    flags: MessageFlags.Ephemeral
                })
                return
            }
        }

        // S'il y a un objet nécessaire, on vérifie que l'utilisateur l'a bien
        if (item.tool) {
            const playerTool = await PlayerItem.findOne({
                where: {
                    userId: interaction.user.id,
                    name: item.tool,
                    guildId: guildId
                }
            })

            if (!playerTool || playerTool.quantity < 1) {
                await interaction.reply({
                    content: `Vous devez avoir un ${item.tool} pour fabriquer ${itemName}`,
                    flags: MessageFlags.Ephemeral
                })
                return
            }
        }

        // S'il y a un bâtiment nécessaire, on vérifie que la guilde le possède
        if (item.buildings) {
            for (let building of item.buildings) {
                const buildingGuild = await BuildingGuild.findOne({
                    where: {
                        guildId: guildId,
                        name: building,
                        status: "completed"
                    }
                })
                if (!buildingGuild) {
                    await interaction.reply({
                        content: `Vous devez avoir ${building} pour fabriquer ${itemName}`,
                        flags: MessageFlags.Ephemeral
                    })
                    return
                }
            }
        }

        // Retrait des ingrédients
        for (let [ingredient, quantity] of Object.entries(item.recipe)) {
            await PlayerService.addPlayerItem(interaction.user, ingredient, ItemType.RESSOURCE, -quantity * craftQuantity, guildId)
        }

        // Ajout de l'item
        await PlayerService.addPlayerItem(interaction.user, itemName, item.type, craftQuantity, guildId)

        const user = interaction.user;
        const guild = interaction.guild
        const memberCatch = await guild?.members.fetch(user.id)
        const userName = memberCatch?.nickname ?? user.globalName

        let textUp = '';
        // Expérience
        if (item.experience && item.jobs) {
            const experience = item.experience / item.jobs.length * craftQuantity;

            for (let job of item.jobs) {
                let myJob = await Job.findOne({
                    where: {
                        name: job,
                        userId: interaction.user.id,
                        guildId: guildId
                    }
                })

                if (!myJob) {
                    myJob = await Job.create({name: job, userId: interaction.user.id, level: 1, experience: 0, guildId: guildId})
                    continue
                }

                myJob.experience += experience

                const level = JobUtil.getLevelFromXP(myJob.experience)

                if (level != myJob.level) {
                    textUp += `\n**${userName}** passe ${myJob.name} niveau ${level} !`
                }

                await myJob.update({experience: myJob.experience, level: level});
            }

        }

        await interaction.reply({
            content: `${userName} a fabriqué ${craftQuantity} x ${itemName}` + (textUp ? `\n${textUp}` : '')
        })

    }

    protected addOptions(builder: SlashCommandSubcommandBuilder) {
        builder.addStringOption(option => option.setName(this.OPTION_NAME).setDescription("Objet").setRequired(true).setAutocomplete(true));
        builder.addIntegerOption(option => option.setName(this.OPTION_QUANTITY).setDescription("Quantité").setRequired(true));
    }

    async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
        const guildId = interaction.guild?.id;
        if (!guildId) {
            await interaction.respond([]);
            return;
        }
        const options = interaction.options;
        const focused = options.getFocused(true);
        const search = focused.value;

        const items = JobUtil.getAllItems()

        const retour = [];

        for (let item of items) {
            if (retour.length >= 20) break;
            if (item.name.toLowerCase().includes(search.toLowerCase()) || !search) {
                let recipe = "";
                if (typeof item.recipe === 'object' && item.recipe !== null) {
                    for (let [ingredient, quantity] of Object.entries(item.recipe)) {
                        recipe += `${ingredient} x ${quantity} `
                    }
                } else {
                    continue;
                }
                retour.push({
                    name: `${item.name} (${recipe}) - ${item.experience} xp`,
                    value: item.name
                })
            }
        }

        await interaction.respond(retour)
    }
}

export default Fabriquer;
