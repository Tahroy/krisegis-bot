import AbstractCommand from "../../utils/AbstractCommand";
import Recolte from "./Recolte";
import Sell from "./Sell";
import Prices from "./Prices";
import Profil from "./Profil";
import Buy from "./Buy";
import Craft from "./Craft";
import Inventory from "./Inventory";

class AstrubEconomy extends AbstractCommand {
    description: string = "Jeu d'économie via Krisegis";
    name: string = "astrub_economie";

    constructor() {
        super();
        this.subCommands.set("recolte", Recolte);
        this.subCommands.set('sell', Sell);
        this.subCommands.set('buy', Buy)
        this.subCommands.set("prices", Prices)
        this.subCommands.set("profil", Profil)
        this.subCommands.set('craft', Craft)
        this.subCommands.set('inventory', Inventory)
    }
}

export default AstrubEconomy;