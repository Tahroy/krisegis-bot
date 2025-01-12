import AbstractSubCommand from "../../utils/AbstractSubCommand";
import {AutocompleteInteraction, CommandInteraction, CommandInteractionOptionResolver, User} from "discord.js";
import {Op} from "sequelize";
import {SlashCommandSubcommandBuilder} from "@discordjs/builders";
import JobUtil from "./JobUtil";
import PlayerItem from "../../models/PlayerItem";
import {Ressources} from "../../models/astrub_economy/Ressource";
import {Crafts} from "../../models/astrub_economy/Craft";
import {ItemType, PlayerService} from "../../services/playerItemService";
import BaseItem from "../../models/astrub_economy/BaseItem";

class Give extends AbstractSubCommand {
    description: string = "Donner des ressources";
    name: string = "give";

    async execute(interaction: CommandInteraction): Promise<void> {
        if (!interaction.isCommand() || !(interaction.options instanceof CommandInteractionOptionResolver)) {
            return;
        }

        const user = interaction.user
        const cible = interaction.options.getUser('user')
        const itemName = interaction.options.getString('item')
        const quantity = interaction.options.getInteger('quantity')

        if (!cible || !itemName || !quantity) {
            await interaction.reply({content: "Commande incorrecte", ephemeral: true})
            return;
        }

        let playerItem = await PlayerItem.findOne({where: {name: itemName, user_id: user.id,},});

        if (!playerItem || playerItem.get('quantity') < quantity) {
            await interaction.reply({content: "Vous n'avez pas la quantité nécessaire", ephemeral: true})
            return;
        }

        if (![ItemType.RESSOURCE, ItemType.FABRICATION, ItemType.OUTIL].includes(playerItem.type as ItemType)) {

            console.log('bad type')
            console.log(playerItem)
            await interaction.reply({content: "Cet objet ne peut pas être donné", ephemeral: true})
            return
        }

        let item: BaseItem | undefined = undefined;
        if (itemName === 'Kamas') {
            item = {name: 'Kamas', type: ItemType.RESSOURCE}
        } else {
            item = JobUtil.getItem(itemName);
        }

        if (!item) {
            console.log('no item')
            await interaction.reply({content: "Cet objet ne peut pas être donné", ephemeral: true})
            return
        }

        await PlayerService.addPlayerItem(user, itemName, item.type, -quantity)
        await PlayerService.addPlayerItem(cible, itemName, item.type, quantity)

        const guild = interaction.guild
        const memberCatch = await guild?.members.fetch(user.id)
        const userName = memberCatch?.nickname ?? (user.globalName ? user.globalName : user.username)


        const memberCible = await guild?.members.fetch(cible.id)
        const cibleName = memberCible?.nickname ? memberCible.nickname :(cible.globalName ? cible.globalName : cible.username)

        await interaction.reply({content: `${userName} donné ${quantity} x ${item.name} à ${cibleName}`})
    }

    protected addOptions(builder: SlashCommandSubcommandBuilder) {
        builder.addUserOption(
            option => option.setName('user').setDescription("Utilisateur").setRequired(true)
        )

        builder.addStringOption(
            option => option.setName('item').setDescription("Objet").setRequired(true).setAutocomplete(true)
        )

        builder.addIntegerOption(
            option => option.setName('quantity').setDescription("Quantité").setRequired(true)
        )
    }

    async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
        const options = interaction.options
        const focused = options.getFocused(true)
        const search = focused.value

        const retour = [];
        switch (focused.name) {
            case 'item':
                const items = await this.getUserItems(interaction.user, search)

                for (let item of items) {
                    const price = JobUtil.getItem(item.name)?.sell ?? 0;
                    if (price === 0) continue;
                    if (retour.length >= 19) {
                        break;
                    }
                    retour.push({
                        name: `${item.name}`,
                        value: item.name
                    })
                }

                if (!search || "Kamas".includes(search)) {
                    retour.push({
                        name: "Kamas",
                        value: "Kamas"
                    })
                }

                break;
        }

        await interaction.respond(retour)
    }

    private async getUserItems(user: User, search: string): Promise<PlayerItem[]> {
        const items = JobUtil.getAllItems()

        let sellablesItems: string [] = []

        for (let item of items) {
            if (!item.sell) {
                continue
            }
            if (item.name.toLowerCase().includes(search.toLowerCase()) || !search) {
                sellablesItems.push(item.name)
            }
        }

        return await PlayerItem.findAll({
            where: {
                user_id: user.id,
                name: {[Op.in]: sellablesItems,}
            }
        });
    }
}

export default Give
