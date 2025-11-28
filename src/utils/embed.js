const {AttachmentBuilder, EmbedBuilder, Colors} = require("discord.js");
const appRoot = require('app-root-path');

module.exports = {
	createEmbed(fields, options) {

//		console.log("On fait un embed");
//		console.log(fields);
		const builder = new EmbedBuilder()
			.setColor(Colors.Yellow)
			//.setURL('https://krisegis.fr')
			.setAuthor({name: 'Krisegis', iconURL: 'attachment://krisegis-point.png', url: 'https://krisegis.fr'})
			.addFields(fields)
			.setTimestamp(new Date())
			.setFooter({text: `Krisegis`, iconURL: 'attachment://krisegis.png'});

		if (options) {
			if (options.title) {
				builder.setTitle(options.title);
			}
			if (options.url) {
				builder.setURL(options.url);
			}
			if (options.description) {
				builder.setDescription(options.description);
			}
		}

		const krisegisLogo = new AttachmentBuilder(`${appRoot}/assets/krisegis.png`);
		const krisegisPoint = new AttachmentBuilder(`${appRoot}/assets/krisegis-point.png`);
		const files = [krisegisLogo, krisegisPoint];

		return {embeds: [builder], files: files};
	}
};