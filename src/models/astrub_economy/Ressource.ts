import BaseItem from "./BaseItem";
import {ItemType} from "../../services/playerItemService";
import {JobEnum, RessourcesEnum} from "./Enums";

interface Ressource extends BaseItem{
    sell: number;   // Prix de vente
    buy: number;    // Prix d'achat
    job?: string;
    level: number;
}


// Exemple d'utilisation
const Ressources: Record<RessourcesEnum, Ressource> = {
    // Niveau 1
    [RessourcesEnum.BLE]: {name: RessourcesEnum.BLE, job: JobEnum.PAYSAN, level: 1, sell: 2, buy: 5, type: ItemType.RESSOURCE, emoji: "ble"},
    [RessourcesEnum.ORTIE]: {name: RessourcesEnum.ORTIE, job: JobEnum.ALCHIMISTE, level: 1, sell: 2, buy: 5, type: ItemType.RESSOURCE, emoji: "ortie"},
    [RessourcesEnum.GOUJON]: {name: RessourcesEnum.GOUJON, job: JobEnum.PECHEUR, level: 1, sell: 2, buy: 5, type: ItemType.RESSOURCE, emoji: "goujon"},
    [RessourcesEnum.FRENE]: {name: RessourcesEnum.FRENE, job: JobEnum.BUCHERON, level: 1, sell: 2, buy: 5, type: ItemType.RESSOURCE, emoji: "frene"},
    [RessourcesEnum.FER]: {name: RessourcesEnum.FER, job: JobEnum.MINEUR, level: 1, sell: 2, buy: 5, type: ItemType.RESSOURCE, emoji: "fer"},

    // Niveau 10
    [RessourcesEnum.CHATAIGNIER]: {name: RessourcesEnum.CHATAIGNIER, job: JobEnum.BUCHERON, level: 10, sell: 4, buy: 10, type: ItemType.RESSOURCE, emoji: "chataignier"},
    [RessourcesEnum.CUIVRE]: {name: RessourcesEnum.CUIVRE, job: JobEnum.MINEUR, level: 10, sell: 4, buy: 10, type: ItemType.RESSOURCE, emoji: "cuivre"},
    [RessourcesEnum.SAUGE]: {name: RessourcesEnum.SAUGE, job: JobEnum.ALCHIMISTE, level: 10, sell: 4, buy: 10, type: ItemType.RESSOURCE, emoji: "sauge"},
    [RessourcesEnum.ORGE]: {name: RessourcesEnum.ORGE, job: JobEnum.PAYSAN, level: 10, sell: 4, buy: 10, type: ItemType.RESSOURCE, emoji: "orge"},
    [RessourcesEnum.GREUVETTE]: {name: RessourcesEnum.GREUVETTE, job: JobEnum.PECHEUR, level: 10, sell: 4, buy: 10, type: ItemType.RESSOURCE, emoji: "greuvette"},
    [RessourcesEnum.TRUITE]: {name: RessourcesEnum.TRUITE, job: JobEnum.PECHEUR, level: 10, sell: 4, buy: 10, type: ItemType.RESSOURCE, emoji: "truite"},

    [RessourcesEnum.KAMAS]: {name: RessourcesEnum.KAMAS, job: undefined, level: 1, sell: 0, buy: 0, type: ItemType.RESSOURCE, emoji: "kamas"},

    [RessourcesEnum.PIERRE]: {name: RessourcesEnum.PIERRE, job:undefined, level:1, sell:0, buy: 3, type: ItemType.RESSOURCE, emoji: "pierre"},
    [RessourcesEnum.LAINE_DE_BOUFTOU]: {name: RessourcesEnum.LAINE_DE_BOUFTOU, job:undefined, level:1, sell:0, buy: 0, type: ItemType.RESSOURCE, emoji: "laine"}
};

export default Ressource;
export {Ressources}