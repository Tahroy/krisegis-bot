import AbstractSubCommand from "../../utils/AbstractSubCommand";
import {
    AutocompleteInteraction,
    CommandInteraction,
    MessageFlags,
    User
} from "discord.js";
import {Op} from "sequelize";
import {SlashCommandSubcommandBuilder} from "@discordjs/builders";
import JobUtil from "./JobUtil";
import PlayerItem from "../../models/PlayerItem";
import {ItemType, PlayerService} from "../../services/playerItemService";
import BaseItem from "../../models/astrub_economy/BaseItem";

class Give extends AbstractSubCommand {
    description: string = "Donner des ressources";
    name: string = "give";

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

        const user = interaction.user
        const cible = interaction.options.getUser('user')
        const itemName = interaction.options.getString('item')
        const quantity = interaction.options.getInteger('quantity')

        if (!cible || !itemName || !quantity) {
            await interaction.reply({content: "Commande incorrecte", flags: MessageFlags.Ephemeral})
            return;
        }

        let playerItem = await PlayerItem.findOne({where: {name: itemName, userId: user.id, guildId: guildId}});

        if (!playerItem || playerItem.get('quantity') < quantity) {
            await interaction.reply({content: "Vous n'avez pas la quantité nécessaire", flags: MessageFlags.Ephemeral})
            return;
        }

        if (![ItemType.RESSOURCE, ItemType.FABRICATION, ItemType.OUTIL].includes(playerItem.type as ItemType)) {
            await interaction.reply({content: "Cet objet ne peut pas être donné", flags: MessageFlags.Ephemeral})
            return
        }

        let item: BaseItem | undefined = undefined;
        if (itemName === 'Kamas') {
            item = {name: 'Kamas', type: ItemType.RESSOURCE}
        } else {
            item = JobUtil.getItem(itemName);
        }

        if (!item) {
            await interaction.reply({content: "Cet objet ne peut pas être donné", flags: MessageFlags.Ephemeral})
            return
        }

        await PlayerService.addPlayerItem(user, itemName, item.type, -quantity, guildId)
        await PlayerService.addPlayerItem(cible, itemName, item.type, quantity, guildId)

        const guild = interaction.guild
        const memberCatch = await guild?.members.fetch(user.id)
        const userName = memberCatch?.nickname ?? (user.globalName ? user.globalName : user.username)


        const memberCible = await guild?.members.fetch(cible.id)
        const cibleName = memberCible?.nickname ? memberCible.nickname :(cible.globalName ? cible.globalName : cible.username)

        await interaction.reply({content: `${userName} donné ${quantity} x ${item.name} à ${cibleName}`, flags: MessageFlags.Ephemeral})
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
        const guildId = interaction.guild?.id;
        if (!guildId) {
            await interaction.respond([]);
            return;
        }
        const options = interaction.options
        const focused = options.getFocused(true)
        const search = focused.value

        const retour = [];
        switch (focused.name) {
            case 'item':
                const items = await this.getUserItems(interaction.user, search, guildId)

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

    private async getUserItems(user: User, search: string, guildId: string): Promise<PlayerItem[]> {
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
                userId: user.id,
                name: {[Op.in]: sellablesItems,},
                guildId: guildId
            }
        });
    }
}

export default Give