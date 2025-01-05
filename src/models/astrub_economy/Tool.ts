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
        buy: 3000,
        sell:2400,
        recipe: {[RessourcesEnum.FER]: 200, [RessourcesEnum.FRENE]: 200},
        type: ItemType.OUTIL,
    },
    [ToolsEnum.ATELIER_A_POISSON]: {
        name: ToolsEnum.ATELIER_A_POISSON,
        buy: 3000,
        sell:2400,
        recipe: {[RessourcesEnum.FER]: 300, [RessourcesEnum.FRENE]: 100},
        type: ItemType.OUTIL,
    },
    [ToolsEnum.MARMITE]: {
        name: ToolsEnum.MARMITE,
        buy: 3000,
        sell: 2400,
        recipe: {[RessourcesEnum.FER]: 100, [RessourcesEnum.FRENE]: 300},
        type: ItemType.OUTIL,
    }
};


export {Tools, ToolsEnum}