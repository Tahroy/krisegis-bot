import AbstractCommand from "../utils/AbstractCommand";
import { AutocompleteInteraction, CommandInteraction, MessageFlags, SlashCommandBuilder } from "discord.js";
import Constantes from "../utils/Constantes";

class Document extends AbstractCommand {
    description: string = 'Rechercher un document';
    name: string = 'document';

    async execute(interaction: CommandInteraction): Promise<void> {
        if (!interaction.isChatInputCommand()) {
            return;
        }
        try {
            const { executeLore } = require('../utils/Utils.js');
            await executeLore(interaction, 'document');
        } catch (e) {
            console.error(e);
            await interaction.reply({ content: `Une erreur est survenue`, flags: MessageFlags.Ephemeral });
        }
    }

    async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
        try {
            const { autocompleteLore } = require('../utils/Utils.js');
            await autocompleteLore(interaction, 'document');
        } catch (e) {
            console.error(e);
            try {
                await interaction.respond([]);
            } catch {}
        }
    }

    protected addOptions(builder: SlashCommandBuilder) {
        builder.addStringOption(option =>
            option
                .setName('query')
                .setDescription("Recherche un nom de document")
                .setRequired(true)
                .setAutocomplete(true)
        );
    }
}

export default Document;
