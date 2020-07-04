/* Configuration des logs */
const appRoot = require('app-root-path');
const {
    createLogger,
    format,
    transports
} = require('winston');

const logger = createLogger({
    level: 'info',
    exitOnError: false,
    format: format.json(),
    transports: [
        new transports.File({
            filename: `${appRoot}/logs/logs.log`
        }),
    ],
});

module.exports = logger;

/* Configuration du bot */

const Discord = require('discord.js');
const {
    prefix,
    token,
    version
} = require('./config/config.json');
const client = new Discord.Client();

/* Configuration des commandes */
const fs = require('fs');
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

/* Lancement du bot */

client.once('ready', () => {
    console.log(`Krisegis V${version} prêt !`);
});

client.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    // On récupère les arguments et le nom de la commande.
    const args = message.content.slice(prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();

    // On vérifie que la commande existe bien.
    if (!client.commands.has(commandName)) return;

    const command = client.commands.get(commandName);

    if (command.args > 0 && !args.length) {
        let reply = `Vous devez indiquer des arguments (${command.args}) pour utiliser cette commande !`;

        if (command.usage) {
            reply += `\nLa commande demande l'usage suivant : « ${command.usage} »`;
        }

        return message.reply(reply);
    }

    if (command.guildOnly && message.channel.type !== 'test') {
        return message.reply('Cette commande est indisponible en MP. :(');
    }

    try {
        command.execute(message, args);
    } catch (error) {
        logger.error(error);
        logger.error(`Message : ${message.content}`, { 'timestamp': Date.now() });
    }
});

client.login(token);