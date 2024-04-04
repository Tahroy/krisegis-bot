const {SlashCommandBuilder} = require("discord.js");
const WelcomeMessage = require("../database/WelcomeMessage");
const {PermissionFlagsBits} = require("discord-api-types/v8");

module.exports = {
    opts: {
        admin: true
    },
    data: new SlashCommandBuilder()
        .setName('welcomemessage')
        .setDescription("Ajoute un message d'accueil")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false)
        .addStringOption(option =>
            option.setName('message')
                .setDescription("Le message d'accueil")
                .setRequired(true)
        )
    ,

    async execute(interaction) {
        const message = interaction.options.getString('message');

        const champs = {
            message: message
        };

        await WelcomeMessage.create(champs);
        interaction.reply(`Message ajouté !`, {ephemeral: true});
    },
};