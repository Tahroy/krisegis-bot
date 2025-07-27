import {Ressources} from "./Ressource";
import {Tools} from "./Tool";
import {Crafts} from "./Craft";
import {ItemType} from "../../services/PlayerService";
import {JobEnum} from "./Enums";
import {BuildingEnum} from "./Building";

interface BaseItem {
    type: ItemType;
    name: string;
    buy?: number | null;
    sell?: number | null;
    job?: string | null;
    recipe?: object | null;
    level?: number;
    tool?: string;
    emoji?: string;
    experience?: number;
    jobs?: JobEnum[];
    buildings?: BuildingEnum[];
}

const Items: Record<string, Record<string, BaseItem>> = {
    ressources: Ressources,
    tools: Tools,
    crafts: Crafts
}



export default BaseItem
export {Items}
