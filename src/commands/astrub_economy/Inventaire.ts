import AbstractSubCommand from "../../utils/AbstractSubCommand";
import {CommandInteraction, EmbedBuilder, Guild, MessageFlags, User} from "discord.js";
import PlayerItem from "../../models/PlayerItem";
import {PlayerService} from "../../services/PlayerService";
import ItemService from "../../services/ItemService";
import {ItemType} from "../../utils/Enums";

class Inventaire extends AbstractSubCommand {
    description: string = 'Permet de consulter son inventaire'
    name: string = 'inventaire'

    async execute(interaction: CommandInteraction): Promise<void> {
        const user = interaction.user;

        const guild = interaction.guild

        if (!guild) {
            await interaction.reply({
                content: 'Cette commande ne peut être utilisée que dans un serveur',
                flags: MessageFlags.Ephemeral
            })
            return;
        }

        const memberCatch = await guild?.members.fetch(user.id)
        const userName = memberCatch?.nickname ?? user.globalName

        const table = await this.getInventoryTable(user, guild);
        const embed = new EmbedBuilder()
            .setTitle(`Inventaire de ${userName}`)
            .setColor("#0099ff")
            .setDescription(table)
            .setTimestamp()

        await interaction.reply({embeds: [embed]})
    }

    private async getInventoryTable(user: User, guild: Guild): Promise<string> {
        const header    = `| Nom                        | Quantité |`;
        const separator = `|----------------------------|----------|`;

        const types = [ItemType.RESSOURCE, ItemType.FABRICATION, ItemType.OUTIL];

        const items = await PlayerService.getItems(user, types, guild);

        const rows = items.map(item => {
            const hasDurability = item.durability ?? null;

            let displayName: string;
            if (hasDurability) {
                const itemData = ItemService.getCraft(item.name)
                const maxDurability = ItemService.getToolMaxDurability(itemData?.level ?? 0);
                const durability = item.durability;
                displayName = `${item.name} (${durability}/${maxDurability})`;
            } else {
                displayName = item.name;
            }

            return `| ${displayName.padEnd(26)} | ${item.quantity.toString().padStart(8)} |`;
        });

        return `\`\`\`\n${header}\n${separator}\n${rows.join('\n')}\n\`\`\``
    }
}

export default Inventaire;
