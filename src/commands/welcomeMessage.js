const { SlashCommandBuilder } = require('discord.js')
const WelcomeMessage = require('../models/WelcomeMessage').default
const { PermissionFlagsBits } = require('discord-api-types/v8')
const Constantes = require("../utils/Constantes");

module.exports = {
    allowedGuildIds: [
        '185464480346537984',   // Discord RP
        '1113468001379962880',  // Discord test
        '641999599099445279'    // Discord Nellonia
    ],
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