"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_bot_json_1 = require("./../config/config_bot.json"); // Import du token
const discord_js_1 = require("discord.js");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const commandsLoader_1 = __importDefault(require("./utils/commandsLoader"));
// Étendre le client pour inclure les commandes
class ExtendedClient extends discord_js_1.Client {
    constructor() {
        super({
            intents: [discord_js_1.GatewayIntentBits.Guilds, discord_js_1.GatewayIntentBits.GuildVoiceStates, discord_js_1.GatewayIntentBits.GuildMessages, discord_js_1.GatewayIntentBits.GuildMembers, discord_js_1.GatewayIntentBits.GuildEmojisAndStickers, discord_js_1.GatewayIntentBits.GuildScheduledEvents, discord_js_1.GatewayIntentBits.DirectMessages],
            partials: [discord_js_1.Partials.Channel, discord_js_1.Partials.User]
        });
        this.commands = new discord_js_1.Collection();
    }
}
const client = new ExtendedClient();
(0, commandsLoader_1.default)(client);
// Chargement dynamique des événements
const eventsPath = path_1.default.join(__dirname, './events');
const eventFiles = (0, fs_1.readdirSync)(eventsPath).filter((file) => file.endsWith('.ts') || file.endsWith('.js'));
for (const file of eventFiles) {
    try {
        const event = require(`${eventsPath}/${file}`);
        if (typeof event === 'function') {
            event(client); // Appelle la fonction dans chaque fichier d'événement
            console.log(`Événement chargé : ${file}`);
        }
        else {
            console.warn(`Le fichier ${file} ne semble pas être un événement valide.`);
        }
    }
    catch (error) {
        console.error(`Erreur lors du chargement de l'événement ${file}:`, error);
    }
}
// Lancement du bot
client.login(config_bot_json_1.token).catch((err) => console.error('Erreur de connexion:', err));
