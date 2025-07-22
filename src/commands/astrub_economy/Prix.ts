import AbstractSubCommand from "../../utils/AbstractSubCommand";
import {CommandInteraction, EmbedBuilder} from "discord.js";
import {Ressources} from "../../models/astrub_economy/Ressource";
import JobUtil from "../../services/JobUtil";
import {RessourcesEnum} from "../../models/astrub_economy/Enums";

class Prix extends AbstractSubCommand {
    description: string = "Voir le tableau des prix";
    name: string = "prix";

    async execute(interaction: CommandInteraction): Promise<void> {
        if (!interaction.isCommand()) {
            return;
        }

        // En-tête du tableau
        const header    = `Nom                     | Prix de vente | Prix d'achat`;
        const separator = `------------------------|---------------|-------------`;

        // Construction des lignes du tableau
        const rows = Object.values(JobUtil.getAllItems()).map(ressource => {
            if (!ressource.name) {
                return ''
            }

            const name = ressource.name;
            const sell = String(JobUtil.calculSell(ressource));
            const buy = String(JobUtil.calculBuy(ressource))

            return `${name.padEnd(23)} | ${sell.padStart(13)} | ${buy.padStart(12)}`;}).filter(row => row !== '');

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

export default Prix;
