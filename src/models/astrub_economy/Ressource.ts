import BaseItem from "./BaseItem";
import {ItemType} from "../../services/playerItemService";
import {JobEnum, RessourcesEnum} from "./Enums";

interface Ressource extends BaseItem{
    sell: number;   // Prix de vente
    buy: number;    // Prix d'achat
    job: string;
    level: number;
}


// Exemple d'utilisation
const Ressources: Record<RessourcesEnum, Ressource> = {
    [RessourcesEnum.BLE]: {name: RessourcesEnum.BLE, job: JobEnum.PAYSAN, level: 1, sell: 2, buy: 5, type: ItemType.RESSOURCE, emoji: "ble"},
    [RessourcesEnum.ORTIE]: {name: RessourcesEnum.ORTIE, job: JobEnum.ALCHIMISTE, level: 1, sell: 2, buy: 5, type: ItemType.RESSOURCE, emoji: "ortie"},
    [RessourcesEnum.GOUJON]: {name: RessourcesEnum.GOUJON, job: JobEnum.PECHEUR, level: 1, sell: 2, buy: 5, type: ItemType.RESSOURCE, emoji: "goujon"},
    [RessourcesEnum.FRENE]: {name: RessourcesEnum.FRENE, job: JobEnum.BUCHERON, level: 1, sell: 2, buy: 5, type: ItemType.RESSOURCE, emoji: "frene"},
    [RessourcesEnum.FER]: {name: RessourcesEnum.FER, job: JobEnum.MINEUR, level: 1, sell: 2, buy: 5, type: ItemType.RESSOURCE, emoji: "fer"},
};

export default Ressource;
export {Ressources}