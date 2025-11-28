import { readdirSync } from 'fs';
import path from 'path';
import {Client, Collection, CommandInteraction} from 'discord.js';
import AstrubEconomie from '../commands/astrub_economy/AstrubEconomie';
import Inventaire from './../commands/Inventaire';
import AbstractCommand from "./AbstractCommand";
import Command from "../models/OldCommand";
import KrisegisClient from "../models/KrisegisClient";
import Dire from "../commands/Dire";
import Article from "../commands/Article";
import Document from "../commands/Document";
import Objet from "../commands/Objet";
import Pnj from "../commands/Pnj";
import Wiki from "../commands/Wiki";
import Nowel from '../commands/nowel/Nowel';
import Kouinkouin from "../commands/kouinkouin";

// Fonction pour charger les commandes
export default function loadCommands(client: KrisegisClient): void {
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

    const typedCommands: Collection<string, AbstractCommand> = new Collection();

    const commands = [
        new AstrubEconomie(),
        new Inventaire(),
        new Dire(),
        new Article(),
        new Document(),
        new Objet(),
        new Pnj(),
        new Wiki(),
        new Nowel(),
        new Kouinkouin()
    ];

    for (const command of commands) {
        typedCommands.set(command.name, command);
    }

    client.typedCommands = typedCommands;
}
