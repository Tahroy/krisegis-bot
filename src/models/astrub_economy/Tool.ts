import {RessourcesEnum} from "./Ressource";
import BaseItem from "./BaseItem";
import {ItemType} from "../../services/playerItemService";

interface Tool extends BaseItem {
    buy: number,
    recipe:object,
}

export default Tool;

enum ToolsEnum {
    FOUR_A_PAIN = "Four à pain",
    ATELIER_A_POISSON = "Atelier à poisson",
    MARMITE = "Marmite"
}

// Exemple d'utilisation
const Tools: Record<ToolsEnum, Tool> = {
    [ToolsEnum.FOUR_A_PAIN]: {
        name: ToolsEnum.FOUR_A_PAIN,
        buy: 2000,
        sell:1800,
        recipe: {[RessourcesEnum.FER]: 150, [RessourcesEnum.FRENE]: 150},
        type: ItemType.OUTIL,
    },
    [ToolsEnum.ATELIER_A_POISSON]: {
        name: ToolsEnum.ATELIER_A_POISSON,
        buy: 2000,
        sell:1800,
        recipe: {[RessourcesEnum.FER]: 250, [RessourcesEnum.FRENE]: 50},
        type: ItemType.OUTIL,
    },
    [ToolsEnum.MARMITE]: {
        name: ToolsEnum.MARMITE,
        buy: 2000,
        sell: 1800,
        recipe: {[RessourcesEnum.FER]: 50, [RessourcesEnum.FRENE]: 250},
        type: ItemType.OUTIL,
    }
};


export {Tools, ToolsEnum}