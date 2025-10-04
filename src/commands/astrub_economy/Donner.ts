import AbstractSubCommand from "../../utils/AbstractSubCommand";
import {
    ApplicationCommandOptionChoiceData,
    AutocompleteInteraction,
    CommandInteraction,
    MessageFlags,
    User
} from "discord.js";
import {Op} from "sequelize";
import {SlashCommandSubcommandBuilder} from "@discordjs/builders";
import PlayerItem from "../../models/PlayerItem";
import {PlayerService} from "../../services/PlayerService";
import BaseItem from "../../models/astrub_economy/BaseItem";
import JobUtil from "../../services/JobUtil";
import ItemService from "../../services/ItemService";
import {ItemType} from "../../utils/Enums";

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

        let item: BaseItem | undefined = ItemService.getItem(itemName);

        if (!item) {
            await interaction.reply({content: "Cet objet ne peut pas être donné", flags: MessageFlags.Ephemeral})
            return
        }

        await PlayerService.addPlayerItem(user, itemName, item.type, -quantity, guildId)
        await PlayerService.addPlayerItem(cible, itemName, item.type, quantity, guildId)

        const guild = interaction.guild
        const userName = await JobUtil.getUsername(user.id, guild)
        const cibleName = await JobUtil.getUsername(cible.id, guild)
        await interaction.reply({content: `**${userName}** donné ${quantity} x ${item.name} à **${cibleName}**`})
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
        const options = interaction.options
        const guildId = interaction.guild?.id;
        if (!guildId) {
            await interaction.respond([]);
            return;
        }

        const focused = options.getFocused(true)
        const search = focused.value

        const choices: ApplicationCommandOptionChoiceData[] = [];

        const user = interaction.user;
        const guild = interaction.guild;
        const types = [ItemType.RESSOURCE, ItemType.FABRICATION, ItemType.OUTIL];

        const items = await PlayerService.getItems(user, types, guild, search);

        for (let item of items) {
            if (item.quantity < 1) {
                continue;
            }
            if (choices.length >= 20) {
                break;
            }

            choices.push({
                name: `${item.name} (${item.quantity} maximum)`,
                value: item.name
            })
        }

        await interaction.respond(choices)
    }
}

export default Donner
