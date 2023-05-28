/* Configuration du bot */
const { token, client_id } = require('./config/config.json')

const { Client, GatewayIntentBits, Partials } = require('discord.js')
const fs = require('fs')

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildScheduledEvents,
        GatewayIntentBits.DirectMessages
    ], partials: [
        Partials.Channel,
        Partials.User,
        Partials.GuildScheduledEvent,
    ]
})

/* Configuration des commandes */
client.commands = require('./src/utils/commandsAdd')
/* Lancement du bot */

const commandFiles = fs.readdirSync('./src/events').filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
    require(`./src/events/${file}`)(client)
}

client.login(token).then(r => function () {})