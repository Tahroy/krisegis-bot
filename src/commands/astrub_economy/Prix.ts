import AbstractSubCommand from "../../utils/AbstractSubCommand";
import {
    ActionRowBuilder, BaseMessageOptions,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    CommandInteraction,
    EmbedBuilder, MessageEditOptions
} from "discord.js";
import JobUtil from "../../services/JobUtil";
import ItemService from "../../services/ItemService";
import EconomyService from "../../services/EconomyService";

class Prix extends AbstractSubCommand {
    description: string = "Voir le tableau des prix";
    name: string = "prix";

    private limit = 15;

    async execute(interaction: CommandInteraction): Promise<void> {
        if (!interaction.isCommand()) {
            return;
        }

        const message = this.getMessage(1);
        await interaction.reply(message);
    }

    async executeButton(interaction: ButtonInteraction): Promise<void> {
        const customId = interaction.customId;
        const pageIndex = parseInt(customId.split('-')[1]);

        const message = this.getMessage(pageIndex);

        await interaction.deferUpdate();
        await interaction.message.edit(message);
    }

    private getHeader() {
        const header = `Nom                       | Prix de vente | Prix d'achat`;
        const separator = `--------------------------|---------------|-------------`;

        return `${header}\n${separator}`;
    }

    private getAllRows() {
        const table = Object.values(ItemService.getAllItems())
            .filter(ressource => !!ressource.name)
            .map(ressource => {
                const name = ressource.name as string;
                const sell = EconomyService.calculSell(ressource);
                const buy = EconomyService.calculBuy(ressource);
                return { name, sell, buy };
            });

        table.sort((a, b) => {
            if (b.sell !== a.sell) return a.sell - b.sell;
            return a.name.localeCompare(b.name);
        });

        return table.map(({ name, sell, buy }) => {
            const sellStr = String(sell);
            const buyStr = String(buy);
            return `${name.padEnd(25)} | ${sellStr.padStart(13)} | ${buyStr.padStart(12)}`;
        });
    }

    private getMessage(pageIndex: number): BaseMessageOptions {

        const header = this.getHeader();
        const allRows = this.getAllRows();

        const maxPages = Math.ceil(allRows.length / this.limit);

        let currentPage = pageIndex;
        if (currentPage < 1) {
            currentPage = 1;
        } else if (currentPage > maxPages) {
            currentPage = maxPages;
        }

        const startIndex = (currentPage - 1) * this.limit;
        const endIndex = startIndex + this.limit;

        const rows = allRows.slice(startIndex, endIndex);

        const table = `\`\`\`\n${header}\n${rows.join('\n')}\n\`\`\``;

        const embed = new EmbedBuilder()
            .setTitle("Tableau des prix")
            .setColor("#0099ff")
            .setDescription(table)
            .setTimestamp()
            .setFooter({text: `Page ${currentPage}/${maxPages}`});

        const pagePrevious = currentPage - 1;
        const pageNext = currentPage + 1;

        const updatedRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`astrub_economie|prix-${pagePrevious}`)
                    .setLabel('◀️ Précédent')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(pagePrevious < 1),
                new ButtonBuilder()
                    .setCustomId(`astrub_economie|prix-${pageNext}`)
                    .setLabel('▶️ Suivant')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(pageNext > maxPages)
            );

        console.log(updatedRow)

        return {embeds: [embed], components: [updatedRow]};
    }
}

export default Prix;
