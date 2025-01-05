import AbstractSubCommand from "../../utils/AbstractSubCommand";
import {AutocompleteInteraction, CommandInteraction, CommandInteractionOptionResolver} from "discord.js";
import {SlashCommandSubcommandBuilder} from "@discordjs/builders";
import {Tools} from "../../models/astrub_economy/Tool";
import JobUtil from "./JobUtil";
import PlayerItem from "../../models/PlayerItem";
import player from "../../models/astrub_economy/Player";
import playerItem from "../../models/PlayerItem";
import {ItemType, PlayerService} from "../../services/playerItemService";
import craft from "../../models/astrub_economy/Craft";

class Craft extends AbstractSubCommand {
    description: string = 'Créer un object';
    name: string = 'craft';

    async execute(interaction: CommandInteraction): Promise<void> {
        if (!interaction.isCommand() || !(interaction.options instanceof CommandInteractionOptionResolver)) {
            return;
        }

        const options: CommandInteractionOptionResolver = interaction.options;

        const itemName: string | null = options.getString('name');

        console.log(itemName);
        if (!itemName) {
            await interaction.reply({content: "Commande incorrecte", ephemeral: true})
            return;
        }

        const item = JobUtil.getItem(itemName);

        if (!item) {
            await interaction.reply({content: "Cet objet ne peut pas être fabriqué", ephemeral: true})
            return
        }

        if (typeof item.recipe !== 'object' || item.recipe === null) {
            await interaction.reply({content: "Commande incorrecte", ephemeral: true})
            return;
        }

        // Check des ingrédients
        for (let [ingredient, quantity] of Object.entries(item.recipe)) {
            const playerItem = await PlayerItem.findOne({where: {user_id: interaction.user.id, name: ingredient}})

            if (!playerItem || playerItem.quantity < quantity) {
                await interaction.reply({
                    content: `Vous n'avez pas la quantité de ${ingredient} nécessaire pour fabriquer ${itemName}`,
                    ephemeral: true
                })
                return
            }
        }

        // S'il y a un objet nécessaire, on vérifie que l'utilisateur l'a bien
        if (item.tool) {
            const playerTool = await PlayerItem.findOne({where: {
                user_id: interaction.user.id, name: item.tool
            }})
            if (!playerTool || playerTool.quantity < 1) {
                await interaction.reply({
                    content: `Vous devez avoir un ${item.tool} pour fabriquer ${itemName}`,
                    ephemeral: true
                })
                return
            }
        }

        // Retrait des ingrédients
        for (let [ingredient, quantity] of Object.entries(item.recipe)) {
            await PlayerService.addPlayerItem(interaction.user, ingredient, ItemType.RESSOURCE, -quantity)
        }

        // Ajout de l'item
        await PlayerService.addPlayerItem(interaction.user, itemName, ItemType.OUTIL, 1)

        const user = interaction.user;
        const guild = interaction.guild
        const memberCatch = await guild?.members.fetch(user.id)
        const userName = memberCatch?.nickname ?? user.globalName

        await interaction.reply({
            content: `${userName} a fabriqué ${itemName}`
        })

    }

    protected addOptions(builder: SlashCommandSubcommandBuilder) {
        builder.addStringOption(option => option.setName('name').setDescription("Objet").setRequired(true).setAutocomplete(true));
    }

    async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
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
                    name: `${item.name} (${recipe})`,
                    value: item.name
                })
            }
        }

        await interaction.respond(retour)
    }
}

export default Craft;