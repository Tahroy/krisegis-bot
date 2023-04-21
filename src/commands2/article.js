const { SlashCommandBuilder } = require('discord.js')
const { PermissionFlagsBits } = require('discord-api-types/v8')
const { autocompleteLore, executeLore } = require('../utils/Utils')
module.exports = {
    opts: {
        admin: true
    }, data: new SlashCommandBuilder()
        .setName('article')
        .setDescription('Rechercher un article')
        .addStringOption(option =>
            option
                .setName('query')
                .setDescription("Recherche un nom d'article")
                .setRequired(true)
                .setAutocomplete(true)
        ),
    async execute (interaction) {
        return executeLore(interaction, 'article');
    },
    async autocomplete (interaction) {
        return autocompleteLore(interaction, "article");
    }
}