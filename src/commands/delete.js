const {SlashCommandBuilder, PermissionsBitField} = require("discord.js");
const {PermissionFlagsBits} = require("discord-api-types/v8");
module.exports = {
    opts: {
        admin:true
    },
    data: new SlashCommandBuilder()
        .setName('delete')
        .setDescription('Supprime X message(s) - Discord RP')
        .addIntegerOption(option =>
            option.setName('nb')
                  .setDescription('Nombre de messages à supprimer')
                  .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false)
    ,
    async execute(interaction) {

        const nombre = interaction.options.getInteger('nb');
        const channel = interaction.channel;

        if (nombre > 50 || nombre < 1 || !Number.isInteger(nombre)) {
            return await interaction.reply('Vous devez mettre un nombre entre 1 et 50.');
        }

        try {
            await channel.bulkDelete(nombre);
            return await interaction.reply(`${nombre} messages supprimés !`, {ephemeral: true});
        } catch (error) {
            return await interaction.reply(`Erreur : ${error.message}`, {ephemeral: true});
        }
    },
};