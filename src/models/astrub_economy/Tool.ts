import BaseItem from "./BaseItem";
import {ItemType} from "../../services/playerItemService";
import {JobEnum, RessourcesEnum, ToolsEnum} from "./Enums";

interface Tool extends BaseItem {
    buy: number;
    recipe: object;
    experience: number;
    jobs: JobEnum[];
}

export default Tool;

// Exemple d'utilisation
const Tools: Record<ToolsEnum, Tool> = {
    [ToolsEnum.FOUR_A_PAIN]: {
        name: ToolsEnum.FOUR_A_PAIN,
        buy: 1000,
        sell: 720,
        recipe: {[RessourcesEnum.FER]: 150, [RessourcesEnum.FRENE]: 150},
        type: ItemType.OUTIL,
        experience: 150,
        jobs: [JobEnum.MINEUR, JobEnum.BUCHERON]
    },
    [ToolsEnum.ATELIER_A_POISSON]: {
        name: ToolsEnum.ATELIER_A_POISSON,
        buy: 1000,
        sell: 720,
        recipe: {[RessourcesEnum.FRENE]: 300},
        type: ItemType.OUTIL,
        experience: 150,
        jobs: [JobEnum.BUCHERON]
    },
    [ToolsEnum.MARMITE]: {
        name: ToolsEnum.MARMITE,
        buy: 1000,
        sell: 720,
        recipe: {[RessourcesEnum.FER]: 300},
        type: ItemType.OUTIL,
        experience: 150,
        jobs: [JobEnum.MINEUR]
    }
};


export {Tools}
