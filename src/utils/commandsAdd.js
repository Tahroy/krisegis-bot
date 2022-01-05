const fs = require('fs');
const Discord = require("discord.js");
let commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./src/commands2').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./../commands2/${file}`);
    commands.set(command.data.name, command);
}

module.exports = commands;