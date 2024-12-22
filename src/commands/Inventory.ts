import AbstractCommand from "../utils/AbstractCommand";
import {ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, CommandInteraction} from "discord.js";
import playerItem from "../models/PlayerItem";
import embedData from "../utils/embed";

class Inventory extends AbstractCommand {
    description: string = 'Permet de consulter son inventaire';
    name: string = 'inventory';

    private limit = 20;

    async execute(interaction: CommandInteraction): Promise<void> {
        const guild = interaction.guild;
        const user = interaction.user
        const member = await guild?.members.fetch(user.id)
        const memberName = member?.nickname ?? user.globalName

        const playerItems = await playerItem.findAll({
            where: {user_id: user.id},
            order: [['type', 'ASC'], ['name', 'ASC']],
            limit: this.limit + 1
        })

        if (playerItems.length === 0) {
            await interaction.reply({content: "Votre inventaire est vide", ephemeral: true})
            return
        }

        let items = [];
        let typeActuel = null;
        for (const playerItem of playerItems) {
            if (items.length === this.limit) break;

            if (playerItem.get('type') !== typeActuel) {
                items.push(`**${this.capitalizeFirstLetter(playerItem.get('type'))}**`)
                typeActuel = playerItem.get('type')
            }
            items.push(`${playerItem.get('quantity')} x ${playerItem.get('name')}`)
        }

        const embed = embedData.createEmbed([], {
            title: `Inventaire de ${memberName}`,
            description: items.join('\n')
        })

        if (playerItems.length > this.limit) {
            const updatedRow = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`inventory-${user.id}_0`)
                        .setLabel('◀️ Précédent')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId(`inventory-${user.id}_2`)
                        .setLabel('▶️ Suivant')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(false)
                );

            await interaction.reply({
                embeds: embed.embeds,
                files: embed.files,
                components: [updatedRow]
            })
            return;
        }

        await interaction.reply({
            embeds: embed.embeds,
            files: embed.files
        })
    }

    async executeButton(interaction: ButtonInteraction): Promise<void> {
        const customId = interaction.customId;

        const [, userIdAndPage] = customId.split('-');
        const [userId, pageIndex] = userIdAndPage.split('_');

        const guild = interaction.guild;
        const member = await guild?.members.fetch(userId)
        const memberName = member?.nickname ?? member?.user.globalName

        const playerItems = await playerItem.findAll({
            where: {user_id: userId},
            order: [['type', 'ASC'], ['name', 'ASC']],
        })

        const page = parseInt(pageIndex);
        const counter = page - 1

        const items = [];
        let typeActuel = null;
        for (const [index, playerItem] of playerItems.entries()) {
            if (index < counter * this.limit) continue;
            if (items.length === this.limit * (counter + 1)) break;

            if (playerItem.get('type') !== typeActuel) {
                items.push(`**${this.capitalizeFirstLetter(playerItem.get('type'))}**`)
                typeActuel = playerItem.get('type')
            }
            items.push(`${playerItem.get('quantity')} x ${playerItem.get('name')}`)
        }

        const maxPages = Math.ceil(playerItems.length / this.limit);
        console.log(maxPages);

        const embed = embedData.createEmbed([], {
            title: `Inventaire de ${memberName}`,
            description: items.join('\n')
        })

        const message = interaction.message;

        const pagePrevious = page - 1;
        const pageNext = page + 1;

        console.log(`maxPages: ${maxPages} page: ${page} pageNext: ${pageNext} pagePrevious: ${pagePrevious}`)

        const updatedRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`inventory-${userId}_${pagePrevious}`)
                    .setLabel('◀️ Précédent')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(pagePrevious === 0),
                new ButtonBuilder()
                    .setCustomId(`inventory-${userId}_${pageNext}`)
                    .setLabel('▶️ Suivant')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page === maxPages)
            );

        await interaction.deferUpdate()
        await message.edit({
            embeds: embed.embeds,
            files: embed.files,
            components: [updatedRow]
        })

    }

    private capitalizeFirstLetter(string: String) {
        if (!string) return ''; // Vérifie si la chaîne est vide ou nulle
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

}

export default Inventory;