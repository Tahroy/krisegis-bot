import AbstractCommand from "../../utils/AbstractCommand";
import Statut from "./Statut";
import Lancer from "./Lancer";

export default class Nowel extends AbstractCommand {
    public name: string = "nowel";
    public description: string = "Commandes pour l'événement de Nowel.";

    constructor() {
        super();
        this.subCommands.set('statut', Statut);
        this.subCommands.set('lancer', Lancer);
    }
}
