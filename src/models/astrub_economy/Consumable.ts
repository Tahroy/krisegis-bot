import Craft from "./Craft";
import {ItemType} from "../../services/PlayerService";
import {CraftEnum, JobEnum, RessourcesEnum, ToolsEnum, XpEnum} from "./Enums";

export enum ConsumablesEnum {
    PAIN_SUCRE = "Pain sucré",
    FOUGASSE_BIERE = "Fougasse à la bière",
    GALETTE_INCARNAM = "Galette d'Incarnam"
}


interface Consumable extends Craft {
    effects: string[];
    duration: number;
}

const Consumables: Record<ConsumablesEnum, Consumable> = {
    [ConsumablesEnum.PAIN_SUCRE]: {
        name: ConsumablesEnum.PAIN_SUCRE,
        recipe: {[CraftEnum.SUCRE_ORGE]: 1, [CraftEnum.PAIN_INCARNAM]: 2},
        sell: 0,
        buy: 0,
        type: ItemType.FABRICATION,
        experience: 0,
        jobs: [JobEnum.PAYSAN, JobEnum.ALCHIMISTE],
        tool: ToolsEnum.FOUR_A_PAIN,
        effects: [],
        duration: 1440
    }, [ConsumablesEnum.FOUGASSE_BIERE]: {
        name: ConsumablesEnum.FOUGASSE_BIERE,
        recipe: {[CraftEnum.FOUGASSE]: 1, [CraftEnum.BIERE_ASTRUB]: 1},
        sell: 0,
        buy: 0,
        type: ItemType.FABRICATION,
        experience: 0,
        jobs: [],
        tool: ToolsEnum.FOUR_A_PAIN,
        effects: [],
        duration: 1440
    }, [ConsumablesEnum.GALETTE_INCARNAM]: {
        name: ConsumablesEnum.GALETTE_INCARNAM,
        recipe: {[CraftEnum.PAIN_INCARNAM]:20, [RessourcesEnum.OEUF]: 10},
        sell: 0,
        buy: 0,
        type: ItemType.FABRICATION,
        experience: 0,
        jobs: [],
        tool: ToolsEnum.FOUR_A_PAIN,
        effects: [],
        duration: 1440
    }
};

export default Consumable;
export {Consumables};