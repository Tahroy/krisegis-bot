/* Configuration du bot */
const {Client, Intents} = require('discord.js');

const {token, test_token} = require('./config/config.json');
const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS]});
/* Configuration du player */
const {Player} = require("discord-player");
// Create a new Player (you don't need any API Key)
const player = new Player(client);
// To easily access the player
client.player = player;

const music = require('./src/utils/music.js');
music.execute(client);

/* Configuration des commandes */
client.commands = require('./src/utils/commandsAdd');

/* Lancement du bot */

require('./src/events/ready')(client);
require('./src/events/messageCreate')(client);

client.login(test_token).then(r => '');