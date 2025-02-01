import { readdirSync } from 'fs';
import path from 'path';
import {Client, Collection, CommandInteraction} from 'discord.js';
import AstrubEconomy from './../commands/astrub_economy/AstrubEconomy';
import Inventory from './../commands/Inventory';
import AbstractCommand from "./AbstractCommand";
import Command from "../models/OldCommand";
import KrisegisClient from "../models/KrisegisClient";
import Say from "../commands/Say";
import Pray from "../commands/astrub_economy/Pray";
import Meteo from '../commands/astrub_economy/Meteo';


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

    const astrubEconomy = new AstrubEconomy();
    typedCommands.set(astrubEconomy.name, astrubEconomy)

    const inventory = new Inventory();
    typedCommands.set(inventory.name, inventory)

    const say = new Say();
    typedCommands.set(say.name, say)

    const pray = new Pray();
    typedCommands.set(pray.name, pray)

    const meteo = new Meteo();
    typedCommands.set(meteo.name, meteo)

    client.typedCommands = typedCommands;
}
