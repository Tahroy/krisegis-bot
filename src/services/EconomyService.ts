import BaseItem from "../models/astrub_economy/BaseItem";
import {CraftEnum, RessourcesEnum} from "../models/astrub_economy/Enums";
import {ItemService} from "./ItemService";

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
        if (!item.recipe) {
            return Math.floor(item.sell || 0);
        }

        let sell = 0;
        for (const [recipeItemName, quantity] of Object.entries(item.recipe)) {
            const recipeItem = ItemService.getItem(recipeItemName as RessourcesEnum | CraftEnum);
            if (!recipeItem) {
                continue;
            }

            const recipeSell = EconomyService.calculSell(recipeItem);
            sell += recipeSell * quantity;
        }

        return Math.floor(sell * 1.1);
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
