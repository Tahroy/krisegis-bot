/* Configuration du bot */
const Discord = require('discord.js');
const {Client, Intents, Permissions} = require('discord.js');

const {
    prefix,
    token,
    version,
    owner,
    test_token
} = require('./config/config.json');
const client = new Discord.Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS]});
/* Configuration du player */
const {Player} = require("discord-player");
// Create a new Player (you don't need any API Key)
const player = new Player(client);
// To easily access the player
client.player = player;

const music = require('./src/utils/music.js');
music.execute(client);

/* Configuration des commandes */
const fs = require('fs');
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./src/commands/${file}`);
    client.commands.set(command.name, command);
}

/* Lancement du bot */

client.once('ready', () => {
    console.log(`Krisegis V${version} prêt !`);
});

client.on('messageCreate', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;


    // On récupère les arguments et le nom de la commande.
    const args = message.content.slice(prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();

    // On récupère la commande par son nom ou un de ses alias.
    const command = client.commands.get(commandName) ||
        client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    // On vérifie que la commande existe bien.
    if (!command) return;

    // On refuse l'utilisation s'il n'y a pas accès d'arguments.
    if (command.args > 0 && args.length < command.args) {
        let reply = `Vous devez indiquer des arguments (${command.args}) pour utiliser cette commande !`;

        // On en profite pour indiquer comment utiliser la commande.
        if (command.usage) {
            reply += `\nLa commande demande l'usage suivant : « ${prefix}${command.name} ${command.usage} »`;
        }

        return message.reply(reply);
    }

    // On refuse les commandes de serveur en MP.
    if (command.guildOnly && message.channel.type !== 'text') {
        return message.reply('Cette commande est indisponible en MP. :(');
    }

    // On refuse les commandes dans le cas où l'utilisateur n'a pas les droits nécessaires
    if (command.admin && message.author.id !== owner) {
        return message.reply('Tu n\'as pas l\'autorisation pour cette commande !');
    }

    try {
        command.execute(message, args);
    } catch (error) {
        console.log(error);
    }
});

client.login(test_token);