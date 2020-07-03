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

// Exemple de logs
/*
logger.log('info', 'Voici un log simple');
logger.info('Voici un log avec des métadonnées', {
    color: 'blue'
});
logger.error('ALERTE, ALERTE');
*/

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

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    switch (command) {
        case 'ping':
            client.commands.get('ping').execute(message, args);
            break;
        case 'infos':
            client.commands.get('infos').execute(message, args);
            break;
        case 'delete':
            client.commands.get('delete').execute(message, args);
    }
});

client.login(token);