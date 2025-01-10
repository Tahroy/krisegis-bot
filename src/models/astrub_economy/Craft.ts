import BaseItem from "./BaseItem";
import {ItemType} from "../../services/playerItemService";
import {CraftEnum, RessourcesEnum, ToolsEnum} from "./Enums";

interface Craft extends BaseItem {
    recipe: object;
    sell: number;
}

const Crafts: Record<CraftEnum, Craft> = {
    [CraftEnum.PAIN_INCARNAM]: {
        name: CraftEnum.PAIN_INCARNAM,
        recipe: {[RessourcesEnum.BLE]: 10},
        sell: 22,
        tool: ToolsEnum.FOUR_A_PAIN,
        type: ItemType.FABRICATION,
    },
    [CraftEnum.POTION_MINI_SOIN]: {
        name: CraftEnum.POTION_MINI_SOIN,
        recipe: {[RessourcesEnum.ORTIE]: 10},
        sell: 22,
        tool: ToolsEnum.MARMITE,
        type: ItemType.FABRICATION,
    },
    [CraftEnum.GOUJON_EN_TRANCHE]: {
        name: CraftEnum.GOUJON_EN_TRANCHE,
        recipe: {[RessourcesEnum.GOUJON]: 10},
        sell: 22,
        tool: ToolsEnum.ATELIER_A_POISSON,
        type: ItemType.FABRICATION,
    },
    [CraftEnum.PAIN_AUX_ORTIES]: {
        name: CraftEnum.PAIN_AUX_ORTIES,
        recipe: {[CraftEnum.PAIN_INCARNAM]: 1, [RessourcesEnum.ORTIE]: 10},
        sell: 46,
        tool: ToolsEnum.FOUR_A_PAIN,
        type: ItemType.FABRICATION,
    },
    [CraftEnum.GOUJON_AUX_ORTIES]: {
        name: CraftEnum.GOUJON_AUX_ORTIES,
        recipe: {[RessourcesEnum.ORTIE]: 10, [CraftEnum.GOUJON_EN_TRANCHE]: 3},
        sell: 92,
        tool: ToolsEnum.ATELIER_A_POISSON,
        type: ItemType.FABRICATION,
    },
    [CraftEnum.SANDWICH_AU_GOUJON]: {
        name: CraftEnum.SANDWICH_AU_GOUJON,
        recipe: {[CraftEnum.PAIN_INCARNAM]: 1, [CraftEnum.GOUJON_EN_TRANCHE]: 3},
        sell: 96,
        tool: ToolsEnum.FOUR_A_PAIN,
        type: ItemType.FABRICATION,
    } //

}
export default Craft;
export {Crafts}