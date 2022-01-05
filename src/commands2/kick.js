const {SlashCommandBuilder} = require('@discordjs/builders');

module.exports = {
    opts: {
        admin: true
    },
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick une personne')
        .addUserOption(option => option
            .setName("victime")
            .setDescription("Choisir la victime")
            .setRequired(true)),
    async execute(interaction) {
        const victime = interaction.options.getUser('victime');
        const member = interaction.guild.members.cache.get(victime.id);
        await member.kick();
        return await interaction.reply(`Tu as kick ${member.user.username} du serveur !`);
    },
};