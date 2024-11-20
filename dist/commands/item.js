"use strict";
const { SlashCommandBuilder } = require('discord.js');
const { PermissionFlagsBits } = require('discord-api-types/v8');
const { autocompleteLore, executeLore } = require('../utils/Utils');
module.exports = {
    opts: {},
    data: new SlashCommandBuilder()
        .setName('item')
        .setDescription('Rechercher un objet')
        .addStringOption(option => option
        .setName('query')
        .setDescription('Recherche par nom d\'objet')
        .setRequired(true)
        .setAutocomplete(true)),
    async execute(interaction) {
        return executeLore(interaction, 'item');
    },
    async autocomplete(interaction) {
        return autocompleteLore(interaction, "item");
    }
};
