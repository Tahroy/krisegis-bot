const appRoot = require('app-root-path');
const Discord = require('discord.js');

module.exports = {
    name: 'tofu',
    description: 'Invoque un super tofu !',
    execute(message, args) {
        const file = new Discord.MessageAttachment(`${appRoot}/assets/tofu.png`);
        message.channel.send({ files: [file] });
    }
};