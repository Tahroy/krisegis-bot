const { SlashCommandBuilder } = require('discord.js')
const { PermissionFlagsBits } = require('discord-api-types/v8')
const { autocompleteLore, executeLore } = require('../utils/Utils')
module.exports = {
    opts: {
        admin: true
    }, data: new SlashCommandBuilder()
        .setName('npc')
        .setDescription('Rechercher un PNJ')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option
                .setName('query')
                .setDescription("Recherche un nom de PNJ>")
                .setRequired(true)
                .setAutocomplete(true)
        ),
    async execute (interaction) {
        return executeLore(interaction, 'npc');
    },
    async autocomplete (interaction) {
        return autocompleteLore(interaction, "npc");
    }
}