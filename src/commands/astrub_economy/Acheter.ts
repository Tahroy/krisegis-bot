import AbstractSubCommand from "../../utils/AbstractSubCommand";
import {AutocompleteInteraction, CommandInteraction, MessageFlags} from "discord.js";
import PlayerItem from "../../models/PlayerItem";
import {PlayerService} from "../../services/PlayerService";
import {SlashCommandSubcommandBuilder} from "@discordjs/builders";
import JobUtil from "../../services/JobUtil";
import ItemService from "../../services/ItemService";
import EconomyService from "../../services/EconomyService";
import {ItemType} from "../../utils/Enums";

class Acheter extends AbstractSubCommand {
    description: string = 'Acheter un objet';
    name: string = 'acheter';

    OPTION_ITEM = 'objet'
    OPTION_QUANTITY = 'quantity'

    async execute(interaction: CommandInteraction): Promise<void> {
        if (!interaction.isChatInputCommand()) {
            return;
        }

        const guildId = interaction.guild?.id;
        if (!guildId) {
            await interaction.reply({ content: "This command can only be used in a server.", ephemeral: true });
            return;
        }

        const options = interaction.options;

        const item: string | null = options.getString(this.OPTION_ITEM);
        const quantity: number | null = options.getInteger(this.OPTION_QUANTITY);

        if (!item || !quantity) {
            await interaction.reply({content: "Commande incorrecte", flags: MessageFlags.Ephemeral})
            return;
        }
        const user = interaction.user;

        // On vérifie si la personne a le bon nombre d'objets
        let playerItem = await PlayerItem.findOne({
            where: {
                name: 'Kamas',
                userId: user.id,
                guildId: guildId
            }
        });

        const baseItem = ItemService.getResource(item);

        if (!baseItem) {
            await interaction.reply({content: "Cet objet ne peut pas être acheté", flags: MessageFlags.Ephemeral})
            return
        }

        const price = EconomyService.calculBuy(baseItem)

        if (!price) {
            await interaction.reply({content: "Cet objet ne peut pas être acheté", flags: MessageFlags.Ephemeral})
            return
        }

        const totalPrice = price * quantity;

        if (!playerItem || playerItem.get('quantity') < totalPrice) {
            await interaction.reply({
                content: "Vous n'avez pas la quantité nécessaire de kamas pour acheter",
                flags: MessageFlags.Ephemeral
            })
            return;
        }

        const guild = interaction.guild
        const userName = await JobUtil.getUsername(user.id, guild)

        await interaction.reply({
            content: `**${userName}** a acheté ${quantity} x ${item} pour ${totalPrice} kamas`,
            flags: MessageFlags.Ephemeral
        })

        await PlayerService.addPlayerItem(interaction.user, item, baseItem.type, quantity, guildId)
        await PlayerService.addPlayerItem(interaction.user, "Kamas", ItemType.RESSOURCE, -totalPrice, guildId)
    }

    protected addOptions(builder: SlashCommandSubcommandBuilder) {
        builder.addStringOption(
            option => option
                .setName(this.OPTION_ITEM)
                .setAutocomplete(true)
                .setRequired(true)
                .setDescription("Objet à acheter")
        )

        builder.addIntegerOption(
            option => option
                .setName(this.OPTION_QUANTITY)
                .setRequired(true)
                .setDescription("Quantité")
        )
    }

    async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
        const options = interaction.options
        const focused = options.getFocused(true)
        const search = focused.value

        const guild = interaction.guild
        if (!guild) {
            await interaction.respond([]);
            return;
        }

        const retour = []

        const kamasItem = await PlayerService.getItem(interaction.user, 'Kamas', guild);
        const KamasQuantity = kamasItem?.quantity || 0

        switch (focused.name) {
            case this.OPTION_ITEM:
                const items = ItemService.getAllResources()

                for (let item of items) {
                    if (retour.length >= 20) {
                        break;
                    }

                    if (item.name === 'kamas') {
                        continue;
                    }

                    if (item.name.toLowerCase().includes(search.toLowerCase()) || !search) {
                        const price = EconomyService.calculBuy(item);

                        if (!price) {
                            continue;
                        }

                        const max = Math.floor(KamasQuantity/price);

                        retour.push({
                            name: `${item.name} - ${price} kamas (${max} maximum)`,
                            value: item.name
                        })
                    }
                }
        }

        await interaction.respond(retour)
    }
}

export default Acheter;
