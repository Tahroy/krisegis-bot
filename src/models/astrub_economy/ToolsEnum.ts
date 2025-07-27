import BaseItem from "./BaseItem";
import {ItemType} from "../../services/PlayerService";
import {ToolsEnum} from "./Enums";
import {RessourcesEnum} from "./Enums";

interface Tool extends BaseItem {
    tool?: string;
}

const Tools: Record<ToolsEnum, Tool> = {
    [ToolsEnum.FOUR_A_PAIN]: {
        name: ToolsEnum.FOUR_A_PAIN,
        buy: 100,
        type: ItemType.OUTIL,
        recipe: {[RessourcesEnum.PIERRE]: 20}
    },
    [ToolsEnum.MARMITE]: {
        name: ToolsEnum.MARMITE,
        buy: 100,
        type: ItemType.OUTIL,
        recipe: {[RessourcesEnum.FER]: 15, [RessourcesEnum.PIERRE]: 5}
    },
    [ToolsEnum.ATELIER_A_POISSON]: {
        name: ToolsEnum.ATELIER_A_POISSON,
        buy: 100,
        type: ItemType.OUTIL,
        recipe: {[RessourcesEnum.FRENE]: 15, [RessourcesEnum.PIERRE]: 5}
    }
};

export {Tools, Tool};
