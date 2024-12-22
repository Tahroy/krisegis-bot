import {token} from './../config/config_bot.json'; // Import du token
import {readdirSync} from 'fs';
import path from 'path';
import loadCommands from './utils/commandsLoader';
import KrisegisClient from "./models/KrisegisClient";

// Définir une interface pour les commandes

const client = new KrisegisClient();

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
