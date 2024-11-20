"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = loadCommands;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
// Fonction pour charger les commandes
function loadCommands(client) {
    const commandsPath = path_1.default.join(__dirname, '../commands');
    const commandFiles = (0, fs_1.readdirSync)(commandsPath).filter((file) => file.endsWith('.js') || file.endsWith('.ts'));
    for (const file of commandFiles) {
        const command = require(`${commandsPath}/${file}`).default || require(`${commandsPath}/${file}`);
        // Validation basique de la commande
        if (!command.data || !command.execute) {
            console.warn(`La commande dans le fichier ${file} est invalide et sera ignorée.`);
            continue;
        }
        // Vérifier si la commande existe déjà dans la collection
        if (client.commands.has(command.data.name)) {
            console.warn(`La commande "${command.data.name}" existe déjà et sera ignorée.`);
            continue;
        }
        // Ajouter la commande à la collection
        client.commands.set(command.data.name, command);
        console.log(`Commande chargée : ${command.data.name}`);
    }
}
