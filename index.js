/* Configuration du bot */
const {token, client_id, guilds} = require('./config/config.json');

const { Client, GatewayIntentBits, Partials } = require('discord.js');

const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildEmojisAndStickers
    ], partials: [Partials.Channel] });

/* Configuration du player */
const {Player} = require("discord-player");
// Create a new Player (you don't need any API Key)
const player = new Player(client, {
    ytdlOptions: {
        filter: "audioonly",
        quality:"highestaudio",
        highWaterMark: 1024 * 1024 * 10
    }
});

// To easily access the player
client.player = player;

const music = require('./src/utils/music.js');
const {REST} = require('@discordjs/rest');
const {Routes} = require('discord-api-types/v9');
music.execute(client);

/* Configuration des commandes */
client.commands = require('./src/utils/commandsAdd');
/* Lancement du bot */
require('./src/events/ready')(client);
require('./src/events/interactionCreate')(client);

client.login(token).then(r => function() {});


const rest = new REST({version: '9'}).setToken(token);

let slashCommands = [];

for (const command of client.commands) {
    const commandData = command[1];

    if (!commandData.description) {
        commandData.description = "- Sans description";
    }
    let slashCommand = commandData.data;
    slashCommands.push(slashCommand);
}
slashCommands = slashCommands.map(command => command.toJSON());

rest.put(
    Routes.applicationCommands(client_id),
    { body: slashCommands },
);