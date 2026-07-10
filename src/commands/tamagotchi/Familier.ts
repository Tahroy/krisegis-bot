import AbstractCommand from "../../utils/AbstractCommand";
import {SlashCommandBuilder} from "discord.js";
import Adopter from "./Adopter";

class Familier extends AbstractCommand {
    description: string = "S'occuper de son familier (Tamagotchi)";
    name: string = "familier";
    public: boolean = false;

    constructor() {
        super();
        this.subCommands.set("adopter", Adopter);
    }

    protected addOptions(builder: SlashCommandBuilder) {
        builder.setContexts(0);
    }
}

export default Familier;
