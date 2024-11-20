import {token} from './../config/config_bot.json'; // Import du token
import {Client, Collection, GatewayIntentBits, Partials} from 'discord.js';
import {readdirSync} from 'fs';
import path from 'path';
import loadCommands from './utils/commandsLoader';

// Définir une interface pour les commandes
interface Command {
    data: {
        name: string;
    };
    execute: (interaction: any) => Promise<void>;

    [key: string]: any; // Pour les options supplémentaires
}

// Étendre le client pour inclure les commandes
class ExtendedClient extends Client {
    commands: Collection<string, Command>;

    constructor() {
        super({
            intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildEmojisAndStickers, GatewayIntentBits.GuildScheduledEvents, GatewayIntentBits.DirectMessages],
            partials: [Partials.Channel, Partials.User]
        });
        this.commands = new Collection();
    }
}

const client = new ExtendedClient();

loadCommands(client);

// Chargement dynamique des événements
const eventsPath = path.join(__dirname, './events');
const eventFiles = readdirSync(eventsPath).filter((file) => file.endsWith('.ts') || file.endsWith('.js'));

for (const file of eventFiles) {
    try {
        const event = require(`${eventsPath}/${file}`);
        if (typeof event === 'function') {
            event(client); // Appelle la fonction dans chaque fichier d'événement
            console.log(`Événement chargé : ${file}`);
        } else {
            console.warn(`Le fichier ${file} ne semble pas être un événement valide.`);
        }
    } catch (error) {
        console.error(`Erreur lors du chargement de l'événement ${file}:`, error);
    }
}

// Lancement du bot
client.login(token).catch((err) => console.error('Erreur de connexion:', err));
