import BaseItem from "./BaseItem";
import {ItemType} from "../../services/playerItemService";
import {BuyEnum, JobEnum, RessourcesEnum, SellEnum} from "./Enums";

interface Ressource extends BaseItem{
    sell: number;   // Prix de vente
    buy: number;    // Prix d'achat
    job?: string;
    level: number;
}


// Exemple d'utilisation
const Ressources: Record<RessourcesEnum, Ressource> = {
    // Ressources de niveau 1
    [RessourcesEnum.BLE]: {name: RessourcesEnum.BLE, job: JobEnum.PAYSAN, level: 0, sell: SellEnum.RESSOURCE_1, buy: BuyEnum.RESSOURCE_1, type: ItemType.RESSOURCE, emoji: "ble"},
    [RessourcesEnum.ORTIE]: {name: RessourcesEnum.ORTIE, job: JobEnum.ALCHIMISTE, level: 0, sell: SellEnum.RESSOURCE_1, buy: BuyEnum.RESSOURCE_1, type: ItemType.RESSOURCE, emoji: "ortie"},
    [RessourcesEnum.GOUJON]: {name: RessourcesEnum.GOUJON, job: JobEnum.PECHEUR, level: 0, sell: SellEnum.RESSOURCE_1, buy: BuyEnum.RESSOURCE_1, type: ItemType.RESSOURCE, emoji: "goujon"},
    [RessourcesEnum.FRENE]: {name: RessourcesEnum.FRENE, job: JobEnum.BUCHERON, level: 0, sell: SellEnum.RESSOURCE_1, buy: BuyEnum.RESSOURCE_1, type: ItemType.RESSOURCE, emoji: "frene"},
    [RessourcesEnum.FER]: {name: RessourcesEnum.FER, job: JobEnum.MINEUR, level: 0, sell: SellEnum.RESSOURCE_1, buy: BuyEnum.RESSOURCE_1, type: ItemType.RESSOURCE, emoji: "fer"},

    // Nouvelles ressources de niveau 10
    [RessourcesEnum.CHATAIGNIER]: {name: RessourcesEnum.CHATAIGNIER, job: JobEnum.BUCHERON, level: 10, sell: SellEnum.RESSOURCE_10, buy: BuyEnum.RESSOURCE_10, type: ItemType.RESSOURCE, emoji: "chataignier"},
    [RessourcesEnum.CUIVRE]: {name: RessourcesEnum.CUIVRE, job: JobEnum.MINEUR, level: 10, sell: SellEnum.RESSOURCE_10, buy: BuyEnum.RESSOURCE_10, type: ItemType.RESSOURCE, emoji: "cuivre"},
    [RessourcesEnum.SAUGE]: {name: RessourcesEnum.SAUGE, job: JobEnum.ALCHIMISTE, level: 10, sell: SellEnum.RESSOURCE_10, buy: BuyEnum.RESSOURCE_10, type: ItemType.RESSOURCE, emoji: "sauge"},
    [RessourcesEnum.ORGE]: {name: RessourcesEnum.ORGE, job: JobEnum.PAYSAN, level: 10, sell: SellEnum.RESSOURCE_10, buy: BuyEnum.RESSOURCE_10, type: ItemType.RESSOURCE, emoji: "orge"},
    [RessourcesEnum.GREUVETTE]: {name: RessourcesEnum.GREUVETTE, job: JobEnum.PECHEUR, level: 10, sell: SellEnum.RESSOURCE_10, buy: BuyEnum.RESSOURCE_10, type: ItemType.RESSOURCE, emoji: "greuvette"},
    [RessourcesEnum.TRUITE]: {name: RessourcesEnum.TRUITE, job: JobEnum.PECHEUR, level: 10, sell: SellEnum.RESSOURCE_10, buy: BuyEnum.RESSOURCE_10, type: ItemType.RESSOURCE, emoji: "truite"},

    [RessourcesEnum.KAMAS]: {name: RessourcesEnum.KAMAS, job: undefined, level: 0, sell: 0, buy: 0, type: ItemType.RESSOURCE, emoji: "kamas"},

    [RessourcesEnum.PIERRE]: {name: RessourcesEnum.PIERRE, job:undefined, level:0, sell:0, buy: 3, type: ItemType.RESSOURCE, emoji: "pierre"},
    [RessourcesEnum.LAINE_DE_BOUFTOU]: {name: RessourcesEnum.LAINE_DE_BOUFTOU, job:undefined, level:0, sell:0, buy: 0, type: ItemType.RESSOURCE, emoji: "laine"},
    [RessourcesEnum.CUIR]: {name: RessourcesEnum.CUIR, job:undefined, level:15, sell:0, buy: 15, type: ItemType.RESSOURCE, emoji: "cuir"},
    [RessourcesEnum.TISSU]: {name: RessourcesEnum.TISSU, job:undefined, level:15, sell:0, buy: 15, type: ItemType.RESSOURCE, emoji: "tissu"}
};

export default Ressource;
export {Ressources}