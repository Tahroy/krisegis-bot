const {MessageActionRow, MessageButton, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder} = require("discord.js");
const {ButtonStyle} = require("discord-api-types/v8");

module.exports = {
    opts: {}, data: new SlashCommandBuilder()
        .setName('button')
        .setDescription('Des boutons pour tous.'),
    async execute(interaction) {
        const row = new ActionRowBuilder()
            .addComponents(new ButtonBuilder()
                .setCustomId('button-primary')
                .setLabel('PRIMAIRE')
                .setStyle(ButtonStyle.Primary),)
            .addComponents(new ButtonBuilder()
                .setCustomId('button-danger')
                .setLabel('DANGER')
                .setStyle(ButtonStyle.Danger),)
            .addComponents(new ButtonBuilder()
                .setCustomId('button-success')
                .setLabel('SUCCES')
                .setStyle(ButtonStyle.Success),)
            .addComponents(new ButtonBuilder()
                .setCustomId('button-secondary')
                .setLabel('SECONDAIRE')
                .setStyle(ButtonStyle.Secondary),)
            .addComponents(new ButtonBuilder()
                .setLabel('SURPRISE')
                .setStyle(ButtonStyle.Link)
                .setURL('https://www.youtube.com/watch?v=E6jbBLrxY1U')
            )

        ;

        await interaction.reply({content: 'I think you should,', components: [row]});
    },
    async executeButton(interaction, buttonName)
    {
        console.log(buttonName);
        await interaction.reply(interaction.user.username + ' a cliqué sur ' + buttonName);
    }
};