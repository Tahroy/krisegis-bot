const {SlashCommandBuilder} = require("discord.js");
const {PermissionFlagsBits} = require("discord-api-types/v8");

module.exports = {
	opts: {
		admin: true
	}, data: new SlashCommandBuilder()
		.setName('kick')
		.setDescription('Kick une personne')
		.addUserOption(option => option
			.setName("victime")
			.setDescription("Choisir la victime")
			.setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
		const victime = interaction.options.getUser('victime');
		const member = interaction.guild.members.cache.get(victime.id);
		await member.kick();
		return await interaction.reply(`Tu as kick ${member.user.username} du serveur !`);
	},
};