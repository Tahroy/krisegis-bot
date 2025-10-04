import Resource, {Ressources} from "../models/astrub_economy/Resource";
import BaseItem, {Items} from "../models/astrub_economy/BaseItem";
import {Crafts} from "../models/astrub_economy/Craft";
import {LevelEnum} from "../models/astrub_economy/Enums";

/**
 * ItemService
 * - Récupération d'objets
 */
export class ItemService {
    static getResource(name: string): Resource | null {
        return Object.values(Ressources).find(r => r.name === name) ?? null;
    }

    static getCraft(name: string): BaseItem | null {
        return Object.values(Crafts).find(c => c.name === name) ?? null;
    }

    static getItem(name: string): BaseItem | undefined {
        return this.getAllItems().find(item => item.name === name);
    }

    static getAllItems(): BaseItem[] {
        const items: BaseItem[] = [];
        for (const category of Object.values(Items)) {
            items.push(...Object.values(category));
        }

        items.sort((a, b) => a.name.localeCompare(b.name));

        return items;
    }

    static getAllResources(): Resource[] {
        return Object.values(Ressources);
    }

    public static getToolMaxDurability(level: LevelEnum): number {
        switch (level) {
            case LevelEnum.LEVEL_0:
                return 50;
            case LevelEnum.LEVEL_10:
                return 100;
            case LevelEnum.LEVEL_20:
                return 150;
        }
    }

}

export default ItemService;
