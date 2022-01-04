const {MessageEmbed, MessageAttachment} = require("discord.js");
const appRoot = require('app-root-path');
const {version} = require(`${appRoot}/config/config.json`);

module.exports = {
    /*
    const { MessageAttachment, MessageEmbed } = require('discord.js');
// ...
const file = new MessageAttachment('../assets/discordjs.png');
const exampleEmbed = new MessageEmbed()
	.setTitle('Some title')
	.setImage('attachment://discordjs.png');

channel.send({ embeds: [exampleEmbed], files: [file] });

     */
    get(fields, options) {
        const embed = {
            color: 'YELLOW',
            url: 'https://krisegis.fr/',
            author: { icon_url: 'attachment://krisegis-point.png'},
            thumbnail: {},
            fields: fields,
            image: {},
            timestamp: new Date(),
            footer: {
                text: `Krisegis V${version}`,
                icon_url: 'attachment://krisegis.png',
            },
        };

        if (options) {
            if (options.author) {
                embed.author.name = options.author;
            }
            if (options.title) {
                embed.title = options.title;
            }
            if (options.url) {
                embed.url = options.url;
            }
            if (options.description) {
                embed.description = options.description;
            }
        }


        const krisegisLogo = new MessageAttachment(`${appRoot}/assets/krisegis.png`);
        const krisegisPoint = new MessageAttachment(`${appRoot}/assets/krisegis-point.png`);
        const files = [krisegisLogo, krisegisPoint];

        return {embeds: [embed], files: files};
    }
};