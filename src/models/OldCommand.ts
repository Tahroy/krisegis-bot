import {CommandInteraction} from "discord.js";

interface Command {
    data: {
        name: string;
    };
    execute: (interaction: CommandInteraction) => Promise<void>;
    [key: string]: any; // Pour des propriétés supplémentaires comme admin, cooldown, etc.
}

export default Command;