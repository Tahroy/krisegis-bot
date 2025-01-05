import AbstractSubCommand from "../../utils/AbstractSubCommand";
import {CommandInteraction, EmbedBuilder, User} from "discord.js";
import PlayerItem from "../../models/PlayerItem";
import {ItemType, PlayerService} from "../../services/playerItemService";

class Inventory extends AbstractSubCommand {
    description: string = 'Permet de consulter son inventaire'
    name: string = 'inventory'

    async execute(interaction: CommandInteraction): Promise<void> {
        const user = interaction.user;

        const guild = interaction.guild
        const memberCatch = await guild?.members.fetch(user.id)
        const userName = memberCatch?.nickname ?? user.globalName

        const table = await this.getInventoryTable(user);
        const embed = new EmbedBuilder()
            .setTitle(`Inventaire de ${userName}`)
            .setColor("#0099ff")
            .setDescription(table)
            .setTimestamp()

        await interaction.reply({embeds: [embed]})
    }

    private async getInventoryTable(user: User): Promise<string> {
        const header = `| Nom                 | Quantité |`;
        const separator = `|---------------------|----------|`;

        const items: PlayerItem[] = await PlayerService.getItems(user, [ItemType.RESSOURCE, ItemType.OUTIL, ItemType.FABRICATION]);

        const rows = items.map(item => {
            return `| ${item.name.padEnd(19)} | ${item.quantity.toString().padStart(8)} |`;
        });

        return `\`\`\`\n${header}\n${separator}\n${rows.join('\n')}\n\`\`\``
    }
}

export default Inventory;