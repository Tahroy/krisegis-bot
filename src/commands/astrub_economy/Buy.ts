import AbstractSubCommand from "../../utils/AbstractSubCommand";
import {AutocompleteInteraction, CommandInteraction, MessageFlags} from "discord.js";
import PlayerItem from "../../models/PlayerItem";
import JobUtil from "./JobUtil";
import {ItemType, PlayerService} from "../../services/playerItemService";
import {SlashCommandSubcommandBuilder} from "@discordjs/builders";
import {Ressources} from "../../models/astrub_economy/Ressource";
import {Tools} from "../../models/astrub_economy/Tool";

class Sale extends AbstractSubCommand {
    description: string = 'Acheter un objet';
    name: string = 'buy';

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

        const item: string | null = options.getString('item');
        const quantity: number | null = options.getInteger('quantity');

        if (!item || !quantity) {
            await interaction.reply({content: "Commande incorrecte", ephemeral: true})
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
        const price = baseItem?.buy ?? 0

        if (!price || !baseItem) {
            await interaction.reply({content: "Cet objet ne peut pas être acheté", flags: MessageFlags.Ephemeral})
            return
        }

        if (!playerItem || playerItem.get('quantity') < quantity * price) {
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
            content: `${userName} a acheté ${quantity} x ${item} pour ${price * quantity} kamas`
        })

        await PlayerService.addPlayerItem(interaction.user, item, baseItem.type, quantity, guildId)
        await PlayerService.addPlayerItem(interaction.user, "Kamas", ItemType.RESSOURCE, -price * quantity, guildId)
    }

    protected addOptions(builder: SlashCommandSubcommandBuilder) {
        builder.addStringOption(
            option => option
                .setName('item')
                .setAutocomplete(true)
                .setRequired(true)
                .setDescription("Objet à acheter")
        )

        builder.addIntegerOption(
            option => option
                .setName('quantity')
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
            case 'item':
                const ressources = Object.values(Ressources);
                const tools = Object.values(Tools)

                for (let ressource of ressources) {
                    if (retour.length >= 20) break;
                    if (ressource.buy === 0) continue;
                    if (ressource.name.toLowerCase().includes(search.toLowerCase()) || !search) {
                        retour.push({
                            name: `${ressource.name} (${ressource.buy} kamas)`,
                            value: ressource.name
                        })
                    }
                }

                for (let tool of tools) {
                    if (retour.length >= 20) break;
                    if (tool.buy === 0) continue;
                    if (tool.name.toLowerCase().includes(search.toLowerCase()) || !search) {
                        retour.push({
                            name: `${tool.name} (${tool.buy} kamas)`,
                            value: tool.name
                        })
                    }
                }
        }

        await interaction.respond(retour)
    }
}

export default Sale;