import {readdirSync} from 'fs';
import path from 'path';
import loadCommands from './utils/commandsLoader';
import KrisegisClient from "./models/KrisegisClient";
import dotenv from 'dotenv';

dotenv.config();

// Gestionnaires d'erreurs globaux
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
});

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

const token = process.env.TOKEN;
// Lancement du bot
client.login(token).catch((err) => console.error('Erreur de connexion:', err));
