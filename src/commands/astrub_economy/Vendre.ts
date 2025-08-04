import AbstractSubCommand from "../../utils/AbstractSubCommand";
import {
    AutocompleteInteraction,
    CommandInteraction,
    CommandInteractionOptionResolver, Guild,
    MessageFlags,
    User
} from "discord.js";
import PlayerItem from "../../models/PlayerItem";
import JobUtil from "../../services/JobUtil";
import {SlashCommandSubcommandBuilder} from "@discordjs/builders";
import {ItemType, PlayerService} from "../../services/PlayerService";
import BaseItem from "../../models/astrub_economy/BaseItem";

class Vendre extends AbstractSubCommand {
    description: string = 'Vendre un objet';
    name: string = 'vendre';

    private static readonly OPTION_ITEM = 'objet'
    private static readonly OPTION_QUANTITY = 'quantite'

    async execute(interaction: CommandInteraction): Promise<void> {
        if (!interaction.isChatInputCommand()) {
            return;
        }

        const guild = interaction.guild
        if (!guild) {
            await interaction.reply({
                content: 'Cette commande ne peut être utilisée que dans un serveur',
                flags: MessageFlags.Ephemeral
            })
            return;
        }

        const guildId = guild.id;
        const options = interaction.options;

        const item = options.getString(Vendre.OPTION_ITEM, true);
        const quantity = options.getInteger(Vendre.OPTION_QUANTITY, true);

        if (!item || !quantity) {
            await interaction.reply({content: "Commande incorrecte", flags: MessageFlags.Ephemeral})
            return;
        }

        const user = interaction.user;

        // On vérifie si la personne a le bon nombre d'objets
        let playerItem = await PlayerItem.findOne({where: {name: item, userId: user.id, guildId: guildId}});

        if (!playerItem || playerItem.get('quantity') < quantity) {
            await interaction.reply({content: "Vous n'avez pas la quantité nécessaire pour vendre", flags: MessageFlags.Ephemeral})
            return;
        }

        const itemBase = JobUtil.getItem(item);
        if (!itemBase) {
            await interaction.reply({content: "Cet objet ne peut pas être vendu", flags: MessageFlags.Ephemeral})
            return
        }

        const price = JobUtil.calculSell(itemBase)

        if (!price) {
            await interaction.reply({content: "Cet objet ne peut pas être vendu", flags: MessageFlags.Ephemeral})
            return
        }

        const userName = JobUtil.getUsername(user.id, guild)

        const totalPrice = Math.floor(price * quantity);

        await interaction.reply({
            content: `**${userName}** a vendu ${quantity} x ${item} pour ${totalPrice} kamas`,
            flags: MessageFlags.Ephemeral
        })

        await PlayerService.addPlayerItem(interaction.user, item, itemBase.type, -quantity, guildId)
        await PlayerService.addPlayerItem(interaction.user, "Kamas", ItemType.RESSOURCE, totalPrice, guildId)
    }

    protected addOptions(builder: SlashCommandSubcommandBuilder) {
        builder.addStringOption(
            option => option
                .setName(Vendre.OPTION_ITEM)
                .setAutocomplete(true)
                .setRequired(true)
                .setDescription("Objet à vendre")
        )

        builder.addIntegerOption(
            option => option
                .setName(Vendre.OPTION_QUANTITY)
                .setRequired(true)
                .setDescription("Quantité")
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
            case Vendre.OPTION_ITEM:
                const items = await this.getUserItems(interaction.user, search, interaction.guild)
                items.sort((a, b) => a.name.localeCompare(b.name));

                for (let item of items) {
                    const price = JobUtil.calculSell(JobUtil.getItem(item.name) as BaseItem)

                    if (retour.length >= 20) {
                        break;
                    }
                    retour.push({
                        name: `${item.name} - ${price} kamas (${item.quantity} maximum)`,
                        value: item.name
                    })
                }

                break;
        }

        await interaction.respond(retour)
    }

    private async getUserItems(user: User, search: string, guild: Guild): Promise<PlayerItem[]> {
        const items = JobUtil.getAllItems();

        const sellablesItems: string [] = []

        for (let item of items) {
            if (item.name === 'kamas') {
                continue
            }

            const price = JobUtil.calculSell(item);
            if (!price) {
                continue;
            }

            if (item.name.toLowerCase().includes(search.toLowerCase()) || !search) {
                sellablesItems.push(item.name)
            }
        }

        const playerItems = await PlayerService.getItems(user, [ItemType.RESSOURCE, ItemType.FABRICATION], guild);

        return playerItems.filter(item => sellablesItems.includes(item.name))
    }
}

export default Vendre;
