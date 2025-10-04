const {SlashCommandBuilder, PermissionsBitField} = require("discord.js");
const {PermissionFlagsBits} = require("discord-api-types/v8");
const { checkTags } = require('../utils/Utils')
const Constantes = require("../utils/Constantes");
module.exports = {
public: false,
    data: new SlashCommandBuilder()
        .setName('rename')
        .setDescription('Permet de se renommer')
        .addStringOption(option =>
            option.setName('pseudo')
                  .setDescription('Votre pseudonyme')
                  .setRequired(true))
        .setDMPermission(false)
    ,
    async execute(interaction) {
        const pseudo = interaction.options.getString('pseudo');

        if (pseudo.length < 3) {
            return await interaction.reply('Votre pseudo doit contenir au moins 3 caractères !', {ephemeral: true});
        }

        const member = interaction.member;

        try {
            await member.setNickname(pseudo);
            await checkTags(member);
            await interaction.reply({ content: 'Votre pseudo a été modifié', ephemeral: true })
        } catch (error) {
            await interaction.reply({ content: 'Erreur, contactez Tahroy !', ephemeral: true })
        }
    },
};