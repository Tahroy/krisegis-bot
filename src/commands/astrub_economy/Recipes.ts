import AbstractSubCommand from "../../utils/AbstractSubCommand";
import {CommandInteraction, EmbedBuilder} from "discord.js";
import Job from "../../models/astrub_economy/Job";
import JobUtil from "./JobUtil";

class Recipes extends AbstractSubCommand {
    description: string = 'Les recettes existantes';
    name: string = 'recipes';

    async execute(interaction: CommandInteraction): Promise<void> {
        if (!interaction.isCommand()) {
            return;
        }

        // En-tête du tableau
        const header    = `| Objet               | Ingrédients              |`;
        const separator = `|---------------------|--------------------------|`;

        // Construction des lignes du tableau
        const rows = Object.values(JobUtil.getAllItems())
            .map(ressource => {
                if (!ressource.recipe) return '';

                let ingredients: string[] = [];
                Object.entries(ressource.recipe ?? {}).forEach(([key, value]) => {
                    ingredients.push(`${key} x ${value}`);
                });

                const formattedIngredients = ingredients.join(', ');
                const nameColumn = ressource.name.padEnd(19);
                const maxLineLength = 50;

                // Découpe des lignes si nécessaire
                let lines = [];
                let currentLine = `| ${nameColumn} | `;
                formattedIngredients.split(', ').forEach(ingredient => {
                    if ((currentLine + ingredient).length > maxLineLength) {
                        // Ajout de la ligne actuelle et préparation d'une nouvelle
                        lines.push(currentLine.padEnd(maxLineLength - 1) + '|');
                        currentLine = `| ${' '.repeat(19)} | ${ingredient}`;
                    } else {
                        // Ajout de l'ingrédient à la ligne actuelle
                        currentLine += (currentLine.endsWith('| ') ? '' : ', ') + ingredient;
                    }
                });

                // Ajouter la dernière ligne
                lines.push(currentLine.padEnd(maxLineLength - 1) + '|');

                return lines.join('\n');
            })
            .filter(Boolean);

        // Retourner le tableau formaté
        const table = `\`\`\`\n${header}\n${separator}\n${rows.join('\n')}\n\`\`\``;

        const embed = new EmbedBuilder()
            .setTitle("Tableau des recettes")
            .setColor("#0099ff")
            .setDescription(table)
            .setTimestamp()

        await interaction.reply({embeds: [embed]})
    }
}

export default Recipes;