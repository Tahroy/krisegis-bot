const { SlashCommandBuilder } = require('discord.js')
const WelcomeMessage = require('../models/WelcomeMessage').default
const { PermissionFlagsBits } = require('discord-api-types/v8')
const Constantes = require("../utils/Constantes");

module.exports = {
    allowedGuildIds: Constantes.allowedGuildIds,
    opts: {
        admin: true
    },
    data: new SlashCommandBuilder()
        .setName('welcomemessage')
        .setDescription('Ajoute un message d\'accueil - Discord RP')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false)
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Le message d\'accueil')
                .setRequired(true)
        )
    ,

    async execute (interaction) {
        const message = interaction.options.getString('message')

        if (!message.includes('[nom]')) {
            interaction.reply({
                content: 'Le message d\'accueil doit contenir \'[nom]\'',
                ephemeral: true
            })
        }
        const champs = {
            message: message,
            guild: interaction.guild.id
        }

        await WelcomeMessage.create(champs)
        interaction.reply({
            content: 'Le message d\'accueil a été ajouté',
            ephemeral: true
        })
    },
}