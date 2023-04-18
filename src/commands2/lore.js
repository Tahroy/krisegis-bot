const {SlashCommandBuilder} = require("discord.js");

module.exports = {
    opts: {},
    data: new SlashCommandBuilder()
        .setName('lore')
        .setDescription('Cherche des objets, articles ou dialogues de PNJ')
        .addStringOption(option =>
            option.setName('recherche')
                .setRequired(true))
    ,
    async execute(interaction) {
    },
};