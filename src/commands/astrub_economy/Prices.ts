import AbstractSubCommand from "../../utils/AbstractSubCommand";
import {CommandInteraction, EmbedBuilder} from "discord.js";
import {Ressources} from "../../models/astrub_economy/Ressource";

class Prices extends AbstractSubCommand {
    description: string = "Voir le tableau des prix";
    name: string = "prices";

    async execute(interaction: CommandInteraction): Promise<void> {
        if (!interaction.isCommand()) {
            return;
        }

        // En-tête du tableau
        const header    = `| Nom        | Prix de vente | Prix d'achat |`;
        const separator = `|------------|---------------|--------------|`;

        // Construction des lignes du tableau
        const rows = Object.values(Ressources).map(ressource => {
            return `| ${ressource.name.padEnd(10)} | ${String(ressource.sell).padStart(13)} | ${String(ressource.buy).padStart(12)} |`;
        });

        // Retourner le tableau formaté
        const table = `\`\`\`\n${header}\n${separator}\n${rows.join('\n')}\n\`\`\``;

        const embed = new EmbedBuilder()
            .setTitle("Tableau des prix")
            .setColor("#0099ff")
            .setDescription(table)
            .setTimestamp()

        await interaction.reply({embeds: [embed]})
    }
}

export default Prices;