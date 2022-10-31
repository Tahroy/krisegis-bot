const {
    MessageActionRow, MessageButton, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder
} = require("discord.js");

module.exports = {
    opts: {
        admin: true
    }, data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Choisir son serveur Dofus.'), async execute(interaction) {
        const row = new ActionRowBuilder()
            .addComponents(new SelectMenuBuilder()
                .setCustomId('select-server')
                .setPlaceholder('Serveur à ajouter ou retirer')
                .addOptions({
                    label: 'Brumen', value: 'brumen',
                }, {
                    label: 'Agride', value: 'agride',
                }, {
                    label: 'Ush', value: 'ush',
                }, {
                    label: 'Nidas', value: 'nidas',
                }),);

        await interaction.reply({
            content: 'Tu peux désormais choisir un serveur à ajouter ou retirer à tes rôles !',
            components: [row]
        });
    }
};