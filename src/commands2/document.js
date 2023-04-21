const { SlashCommandBuilder } = require('discord.js')
const { PermissionFlagsBits } = require('discord-api-types/v8')
const { autocompleteLore, executeLore } = require('../utils/Utils')
module.exports = {
    opts: {},
    data: new SlashCommandBuilder()
        .setName('document')
        .setDescription('Rechercher un document')
        .addStringOption(option =>
            option
                .setName('query')
                .setDescription("Recherche un nom de document")
                .setRequired(true)
                .setAutocomplete(true)
        ),
    async execute (interaction) {
        return executeLore(interaction, 'document');
    },
    async autocomplete (interaction) {
        return autocompleteLore(interaction, "document");
    }
}