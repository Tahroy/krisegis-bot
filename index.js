/* Configuration du bot */
const {token, client_id} = require('./config/config.json');

const { Client, GatewayIntentBits, Partials } = require('discord.js');

const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildEmojisAndStickers
    ], partials: [Partials.Channel] });

/* Configuration des commandes */
client.commands = require('./src/utils/commandsAdd');
/* Lancement du bot */
require('./src/events/ready')(client);
require('./src/events/interactionCreate')(client);
require('./src/events/guildMemberAdd')(client);
require('./src/events/guildMemberRemove')(client);

client.login(token).then(r => function() {});