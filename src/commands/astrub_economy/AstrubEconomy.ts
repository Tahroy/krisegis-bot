import AbstractCommand from "../../utils/AbstractCommand";
import {CommandInteraction} from "discord.js";
import Recolte from "./Recolte";

class AstrubEconomy extends AbstractCommand {
    description: string = "Jeu d'économie via Krisegis";
    name: string = "astrub_economie";

    constructor() {
        super();
        this.subCommands.set("recolte", Recolte);
    }
}

export default AstrubEconomy;