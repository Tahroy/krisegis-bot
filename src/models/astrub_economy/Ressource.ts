import {JobEnum} from "./Job";
import BaseItem from "./BaseItem";
import {ItemType} from "../../services/playerItemService";

interface Ressource extends BaseItem{
    sell: number;   // Prix de vente
    buy: number;    // Prix d'achat
    job: string;
    level: number;
}


enum RessourcesEnum {
    FER = "Fer",
    FRENE = "Frêne",
    BLE = "Blé",
    ORTIE = "Ortie",
    GOUJON = "Goujon",
}

// Exemple d'utilisation
const Ressources: Record<RessourcesEnum, Ressource> = {
    [RessourcesEnum.BLE]: {name: RessourcesEnum.BLE, job: JobEnum.PAYSAN, level: 1, sell: 2, buy: 5, type: ItemType.RESSOURCE},
    [RessourcesEnum.ORTIE]: {name: RessourcesEnum.ORTIE, job: JobEnum.ALCHIMISTE, level: 1, sell: 2, buy: 5, type: ItemType.RESSOURCE},
    [RessourcesEnum.GOUJON]: {name: RessourcesEnum.GOUJON, job: JobEnum.PECHEUR, level: 1, sell: 2, buy: 5, type: ItemType.RESSOURCE},
    [RessourcesEnum.FRENE]: {name: RessourcesEnum.FRENE, job: JobEnum.BUCHERON, level: 1, sell: 2, buy: 5, type: ItemType.RESSOURCE},
    [RessourcesEnum.FER]: {name: RessourcesEnum.FER, job: JobEnum.MINEUR, level: 1, sell: 2, buy: 5, type: ItemType.RESSOURCE},
};

export default Ressource;
export {Ressources, RessourcesEnum}