import { readdirSync } from 'fs';
import path from 'path';
import {Client, Collection, CommandInteraction} from 'discord.js';

interface Command {
    data: {
        name: string;
    };
    execute: (interaction: CommandInteraction) => Promise<void>;
    [key: string]: any; // Pour des propriétés supplémentaires comme admin, cooldown, etc.
}

// Fonction pour charger les commandes
export default function loadCommands(client: Client & { commands: Collection<string, Command> }) {
    const commandsPath = path.join(__dirname, '../commands');
    const commandFiles = readdirSync(commandsPath).filter((file) => file.endsWith('.js') || file.endsWith('.ts'));

    for (const file of commandFiles) {
        const command: Command = require(`${commandsPath}/${file}`).default || require(`${commandsPath}/${file}`);

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
