import AbstractSubCommand from "../../utils/AbstractSubCommand";
import {
    AutocompleteInteraction,
    CommandInteraction,
    MessageFlags,
    User
} from "discord.js";
import {Op} from "sequelize";
import {SlashCommandSubcommandBuilder} from "@discordjs/builders";
import PlayerItem from "../../models/PlayerItem";
import {ItemType, PlayerService} from "../../services/playerItemService";
import BaseItem from "../../models/astrub_economy/BaseItem";
import JobUtil from "../../services/JobUtil";

class Donner extends AbstractSubCommand {
    description: string = "Donner des ressources";
    name: string = "donner";

    OPTION_USER: string = 'joueur'
    OPTION_ITEM: string = 'objet'
    OPTION_QUANTITE: string = 'quantite'

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
        const cible = interaction.options.getUser(this.OPTION_USER)
        const itemName = interaction.options.getString(this.OPTION_ITEM)
        const quantity = interaction.options.getInteger(this.OPTION_QUANTITE)

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

        let item: BaseItem | undefined = JobUtil.getItem(itemName);

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

        await interaction.reply({content: `${userName} donné ${quantity} x ${item.name} à ${cibleName}`})
    }

    protected addOptions(builder: SlashCommandSubcommandBuilder) {
        builder.addUserOption(
            option => option.setName(this.OPTION_USER)
                .setDescription("Utilisateur")
                .setRequired(true)
        )

        builder.addStringOption(
            option => option.setName(this.OPTION_ITEM)
                .setDescription("Objet")
                .setRequired(true)
                .setAutocomplete(true)
        )

        builder.addIntegerOption(
            option => option.setName(this.OPTION_QUANTITE)
                .setDescription("Quantité")
                .setRequired(true)
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
            case this.OPTION_ITEM:
                const items = await this.getUserItems(interaction.user, search, guildId)

                for (let item of items) {
                    if (retour.length >= 20) {
                        break;
                    }
                    retour.push({
                        name: `${item.name}`,
                        value: item.name
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

export default Donner
