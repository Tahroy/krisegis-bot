import AbstractSubCommand from "../../utils/AbstractSubCommand";
import {AutocompleteInteraction, CommandInteraction, MessageFlags} from "discord.js";
import PlayerItem from "../../models/PlayerItem";
import {ItemType, PlayerService} from "../../services/playerItemService";
import {SlashCommandSubcommandBuilder} from "@discordjs/builders";
import {Ressources} from "../../models/astrub_economy/Ressource";
import {Tools} from "../../models/astrub_economy/Tool";
import JobUtil from "../../services/JobUtil";

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

        const baseItem = JobUtil.getItem(item);
        const price = Math.floor(baseItem?.buy ?? 0);

        if (!price || !baseItem) {
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
        const memberCatch = await guild?.members.fetch(user.id)
        const userName = memberCatch?.nickname ?? user.globalName

        await interaction.reply({
            content: `${userName} a acheté ${quantity} x ${item} pour ${totalPrice} kamas`
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
        const guildId = interaction.guild?.id;
        if (!guildId) {
            await interaction.respond([]);
            return;
        }
        const options = interaction.options
        const focused = options.getFocused(true)
        const search = focused.value

        const retour = []

        switch (focused.name) {
            case this.OPTION_ITEM:
                const ressources = Object.values(Ressources);
                const tools = Object.values(Tools)

                for (let ressource of ressources) {
                    if (retour.length >= 20) break;
                    if (ressource.buy === 0) continue;
                    if (ressource.name.toLowerCase().includes(search.toLowerCase()) || !search) {
                        retour.push({
                            name: `${ressource.name} (${Math.floor(ressource.buy)} kamas)`,
                            value: ressource.name
                        })
                    }
                }

                for (let tool of tools) {
                    if (retour.length >= 20) break;
                    if (tool.buy === 0) continue;
                    if (tool.name.toLowerCase().includes(search.toLowerCase()) || !search) {
                        retour.push({
                            name: `${tool.name} (${Math.floor(tool.buy)} kamas)`,
                            value: tool.name
                        })
                    }
                }
        }

        await interaction.respond(retour)
    }
}

export default Acheter;
