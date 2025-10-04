import AbstractCommand from "../../utils/AbstractCommand";
import Recolte from "./Recolte";
import Vendre from "./Vendre";
import Prix from "./Prix";
import Profil from "./Profil";
import Fabriquer from "./Fabriquer";
import Inventaire from "./Inventaire";
import Donner from "./Donner";
import Recettes from "./Recettes";
import Information from "./Information";
import Batiments from "./Batiments";
import Reserve from "./Reserve";
import {SlashCommandBuilder} from "discord.js";
import Acheter from "./Acheter";
import {Prier} from "./Prier";
import Quetes from "./Quetes";
import Statut from "./Statut";
import Bouftonnerie from "./Bouftonnerie";

class AstrubEconomie extends AbstractCommand {
    description: string = "Jeu d'économie via Krisegis";
    name: string = "astrub_economie";

    constructor() {
        super();
        this.subCommands.set("recolte", Recolte);
        this.subCommands.set('vendre', Vendre);
        this.subCommands.set('acheter', Acheter)
        this.subCommands.set("prix", Prix)
        this.subCommands.set("profil", Profil)
        this.subCommands.set('fabriquer', Fabriquer)
        this.subCommands.set('inventaire', Inventaire)
        this.subCommands.set('donner', Donner)
        this.subCommands.set('recettes', Recettes)
        this.subCommands.set('information', Information);
        this.subCommands.set('batiments', Batiments)
        this.subCommands.set('reserve', Reserve)
        this.subCommands.set('prier', Prier)
        this.subCommands.set('quetes', Quetes)
        this.subCommands.set('statut', Statut)
        this.subCommands.set('bouftonnerie', Bouftonnerie)
    }

    protected addOptions(builder: SlashCommandBuilder) {
        builder.setContexts(0)
    }
}

export default AstrubEconomie;
