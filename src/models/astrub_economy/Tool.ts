import BaseItem from "./BaseItem";
import {ItemType} from "../../services/playerItemService";
import {RessourcesEnum, ToolsEnum} from "./Enums";

interface Tool extends BaseItem {
    buy: number,
    recipe:object,
}

export default Tool;

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
        recipe: {[RessourcesEnum.FER]: 50, [RessourcesEnum.FRENE]: 250},
        type: ItemType.OUTIL,
    },
    [ToolsEnum.MARMITE]: {
        name: ToolsEnum.MARMITE,
        buy: 2000,
        sell: 1800,
        recipe: {[RessourcesEnum.FER]: 250, [RessourcesEnum.FRENE]: 50},
        type: ItemType.OUTIL,
    }
};


export {Tools}
