import BaseItem from "../models/astrub_economy/BaseItem";
import {CraftEnum, LevelEnum, ResourceEnum, SellEnum} from "../models/astrub_economy/Enums";
import {ItemService} from "./ItemService";
import {ItemType} from "../utils/Enums";

/**
 * EconomyService
 * - Calcule les prix d'achat/vente
 * - Stratégie actuelle :
 *  - Prix d'une fabrication : ressources * 1.1
 *  - Prix d'achat : prix de vente * 2.5
 */
export class EconomyService {
    /**
     * Calcul du prix de vente d'un item
     */
    static calculSell(item: BaseItem): number {
        if (!item.recipe || Object.keys(item.recipe).length === 0) {
            return Math.floor(EconomyService.getBaseSell(item));
        }

        let sell = 0;
        for (const [recipeItemName, quantity] of Object.entries(item.recipe)) {
            const recipeItem = ItemService.getItem(recipeItemName as ResourceEnum | CraftEnum);
            if (!recipeItem) {
                continue;
            }

            const recipeSell = EconomyService.calculSell(recipeItem);
            sell += recipeSell * quantity;
        }

        return Math.floor(sell * 1.1);
    }

    private static getBaseSell(item: BaseItem): number {
        // Prix fixes pour ressources de base
        const neutralPrices: Partial<Record<ResourceEnum, number>> = {
            [ResourceEnum.KAMAS]: 1,
            [ResourceEnum.PIERRE]: 1,
            [ResourceEnum.LAINE_DE_BOUFTOU]: 50,
            [ResourceEnum.CUIR]: 6,
            [ResourceEnum.TISSU]: 6,
            [ResourceEnum.OEUF]: 4,
            [ResourceEnum.BOUFTOU]: 5000
        };

        if (item.type === ItemType.RESSOURCE) {
            const name = item.name as ResourceEnum;
            if (name && neutralPrices[name]) {
                return neutralPrices[name];
            }

            // Ressources récoltables (avec niveau)
            switch (item.level as LevelEnum) {
                case LevelEnum.LEVEL_0:
                    return SellEnum.RESSOURCE_1;
                case LevelEnum.LEVEL_10:
                    return SellEnum.RESSOURCE_10;
                case LevelEnum.LEVEL_20:
                    return SellEnum.RESSOURCE_20;
                default:
                    return 0;
            }
        }

        return 0;
    }

    /**
     * Calcul du prix d'achat d'une ressource ou d'un craft
     */
    static calculBuy(ressource: BaseItem): number {
        const sell = EconomyService.calculSell(ressource);
        return Math.ceil(sell * 2.5);
    }
}

export default EconomyService;
