import BaseItem from "./BaseItem";
import {ItemType} from "../../services/playerItemService";
import {BuyEnum, CraftEnum, JobEnum, MultiplicatorEnum, RessourcesEnum, SellEnum, ToolsEnum, XpEnum} from "./Enums";
import {BuildingEnum} from "./Building";

interface Craft extends BaseItem {
    recipe: object;
    sell: number;
    experience: number;
    jobs: JobEnum[];
    buildings?: BuildingEnum[];
}

const Crafts: Record<CraftEnum, Craft> = {
    // Niveau 1
    [CraftEnum.PAIN_INCARNAM]: {
        name: CraftEnum.PAIN_INCARNAM,
        recipe: {[RessourcesEnum.BLE]: 10},
        sell: 10 * SellEnum.RESSOURCE_1 * MultiplicatorEnum.SIMPLE_CRAFT,
        buy: 10 * BuyEnum.RESSOURCE_1 * MultiplicatorEnum.SIMPLE_CRAFT,
        tool: ToolsEnum.FOUR_A_PAIN,
        type: ItemType.FABRICATION,
        experience: 10 * XpEnum.RESSOURCE_1,
        jobs: [JobEnum.PAYSAN]
    },
    [CraftEnum.POTION_MINI_SOIN]: {
        name: CraftEnum.POTION_MINI_SOIN,
        recipe: {[RessourcesEnum.ORTIE]: 10},
        sell: 10 * SellEnum.RESSOURCE_1 * MultiplicatorEnum.SIMPLE_CRAFT,
        buy: 10 * BuyEnum.RESSOURCE_1 * MultiplicatorEnum.SIMPLE_CRAFT,
        tool: ToolsEnum.MARMITE,
        type: ItemType.FABRICATION,
        experience: 10 * XpEnum.RESSOURCE_1,
        jobs: [JobEnum.ALCHIMISTE]
    },
    [CraftEnum.GOUJON_EN_TRANCHE]: {
        name: CraftEnum.GOUJON_EN_TRANCHE,
        recipe: {[RessourcesEnum.GOUJON]: 10},
        sell: 10 * SellEnum.RESSOURCE_1 * MultiplicatorEnum.SIMPLE_CRAFT,
        buy: 10 * BuyEnum.RESSOURCE_1 * MultiplicatorEnum.SIMPLE_CRAFT,
        tool: ToolsEnum.ATELIER_A_POISSON,
        type: ItemType.FABRICATION,
        experience: 10 * XpEnum.RESSOURCE_1,
        jobs: [JobEnum.PECHEUR]
    },
    [CraftEnum.PLANCHE_FRENE]: {
        name: CraftEnum.PLANCHE_FRENE,
        recipe: {[RessourcesEnum.FRENE]: 10},
        sell: 10 * SellEnum.RESSOURCE_1 * MultiplicatorEnum.SIMPLE_CRAFT,
        buy: 10 * BuyEnum.RESSOURCE_1 * MultiplicatorEnum.SIMPLE_CRAFT,
        type: ItemType.FABRICATION,
        experience: 10 * XpEnum.RESSOURCE_1,
        jobs: [JobEnum.BUCHERON],
        buildings: [BuildingEnum.SCIERIE]
    },
    [CraftEnum.LINGOT_FER]: {
        name: CraftEnum.LINGOT_FER,
        recipe: {[RessourcesEnum.FER]: 10},
        sell: 10 * SellEnum.RESSOURCE_1 * MultiplicatorEnum.SIMPLE_CRAFT,
        buy: 10 * BuyEnum.RESSOURCE_1 * MultiplicatorEnum.SIMPLE_CRAFT,
        type: ItemType.FABRICATION,
        experience: 10 * XpEnum.RESSOURCE_1,
        jobs: [JobEnum.MINEUR],
        buildings: [BuildingEnum.FONDERIE]
    },

    // Niveau 1 + Niveau 1
    [CraftEnum.GOUJON_ORTIES]: {
        name: CraftEnum.GOUJON_ORTIES,
        recipe: {[CraftEnum.GOUJON_EN_TRANCHE]: 1, [RessourcesEnum.ORTIE]: 20},
        sell: 30 * SellEnum.RESSOURCE_1 * MultiplicatorEnum.COMPLEXE_CRAFT,
        buy: 30 * BuyEnum.RESSOURCE_1 * MultiplicatorEnum.COMPLEXE_CRAFT,
        tool: ToolsEnum.ATELIER_A_POISSON,
        type: ItemType.FABRICATION,
        experience: 30 * XpEnum.RESSOURCE_1,
        jobs: [JobEnum.PECHEUR, JobEnum.ALCHIMISTE]
    },
    [CraftEnum.PAIN_ORTIES]: {
        name: CraftEnum.PAIN_ORTIES,
        recipe: {[CraftEnum.PAIN_INCARNAM]: 1, [RessourcesEnum.ORTIE]: 20},
        sell: 30 * SellEnum.RESSOURCE_1 * MultiplicatorEnum.COMPLEXE_CRAFT,
        buy: 30 * BuyEnum.RESSOURCE_1 * MultiplicatorEnum.COMPLEXE_CRAFT,
        tool: ToolsEnum.FOUR_A_PAIN,
        type: ItemType.FABRICATION,
        experience: 30 * XpEnum.RESSOURCE_1,
        jobs: [JobEnum.PAYSAN, JobEnum.ALCHIMISTE]
    },
    [CraftEnum.SANDWICH_AU_GOUJON]: {
        name: CraftEnum.SANDWICH_AU_GOUJON,
        recipe: {[CraftEnum.PAIN_INCARNAM]: 1, [CraftEnum.GOUJON_EN_TRANCHE]: 2},
        sell: 30 * SellEnum.RESSOURCE_1 * MultiplicatorEnum.COMPLEXE_CRAFT,
        buy: 30 * BuyEnum.RESSOURCE_1 * MultiplicatorEnum.COMPLEXE_CRAFT,
        tool: ToolsEnum.FOUR_A_PAIN,
        type: ItemType.FABRICATION,
        experience: 30 * XpEnum.RESSOURCE_1,
        jobs: [JobEnum.PAYSAN, JobEnum.PECHEUR]
    },

    // Niveau 10
    [CraftEnum.PLANCHE_CHATAIGNIER]: {
        name: CraftEnum.PLANCHE_CHATAIGNIER,
        recipe: {[RessourcesEnum.CHATAIGNIER]: 20},
        sell: 20 * SellEnum.RESSOURCE_10 * MultiplicatorEnum.SIMPLE_CRAFT,
        buy: 20 * BuyEnum.RESSOURCE_10 * MultiplicatorEnum.SIMPLE_CRAFT,
        type: ItemType.FABRICATION,
        experience: 20 * XpEnum.RESSOURCE_10,
        jobs: [JobEnum.BUCHERON],
        buildings: [BuildingEnum.SCIERIE]
    },
    [CraftEnum.LINGOT_CUIVRE]: {
        name: CraftEnum.LINGOT_CUIVRE,
        recipe: {[RessourcesEnum.CUIVRE]: 20},
        sell: 20 * SellEnum.RESSOURCE_10 * MultiplicatorEnum.SIMPLE_CRAFT,
        buy: 20 * BuyEnum.RESSOURCE_10 * MultiplicatorEnum.SIMPLE_CRAFT,
        type: ItemType.FABRICATION,
        experience: 20 * XpEnum.RESSOURCE_10,
        jobs: [JobEnum.MINEUR],
        buildings: [BuildingEnum.FONDERIE]
    },
    [CraftEnum.POTION_RAPPEL]: {
        name: CraftEnum.POTION_RAPPEL,
        recipe: {[RessourcesEnum.SAUGE]: 20},
        sell: 20 * SellEnum.RESSOURCE_10 * MultiplicatorEnum.SIMPLE_CRAFT,
        buy: 20 * BuyEnum.RESSOURCE_10 * MultiplicatorEnum.SIMPLE_CRAFT,
        tool: ToolsEnum.MARMITE,
        type: ItemType.FABRICATION,
        experience: 20 * XpEnum.RESSOURCE_10,
        jobs: [JobEnum.ALCHIMISTE]
    },
    [CraftEnum.FOUGASSE]: {
        name: CraftEnum.FOUGASSE,
        recipe: {[RessourcesEnum.ORGE]: 20},
        sell: 20 * SellEnum.RESSOURCE_10 * MultiplicatorEnum.SIMPLE_CRAFT,
        buy: 20 * BuyEnum.RESSOURCE_10 * MultiplicatorEnum.SIMPLE_CRAFT,
        type: ItemType.FABRICATION,
        experience: 20 * XpEnum.RESSOURCE_10,
        jobs: [JobEnum.PAYSAN]
    },
    [CraftEnum.BEIGNET_GREUVETTE]: {
        name: CraftEnum.BEIGNET_GREUVETTE,
        recipe: {[RessourcesEnum.GREUVETTE]: 20},
        sell: 20 * SellEnum.RESSOURCE_10 * MultiplicatorEnum.SIMPLE_CRAFT,
        buy: 20 * BuyEnum.RESSOURCE_10 * MultiplicatorEnum.SIMPLE_CRAFT,
        tool: ToolsEnum.ATELIER_A_POISSON,
        type: ItemType.FABRICATION,
        experience: 20 * XpEnum.RESSOURCE_10,
        jobs: [JobEnum.PECHEUR]
    },
    [CraftEnum.TRUITE_EN_TRANCHE]: {
        name: CraftEnum.TRUITE_EN_TRANCHE,
        recipe: {[RessourcesEnum.TRUITE]: 20},
        sell: 20 * SellEnum.RESSOURCE_10 * MultiplicatorEnum.SIMPLE_CRAFT,
        buy: 20 * BuyEnum.RESSOURCE_10 * MultiplicatorEnum.SIMPLE_CRAFT,
        tool: ToolsEnum.ATELIER_A_POISSON,
        type: ItemType.FABRICATION,
        experience: 20 * XpEnum.RESSOURCE_10,
        jobs: [JobEnum.PECHEUR]
    },

    // Niveau 1 + Niveau 10
    [CraftEnum.BIERE_ASTRUB]: {
        name: CraftEnum.BIERE_ASTRUB,
        recipe: {[RessourcesEnum.BLE] : 20, [RessourcesEnum.ORGE]: 20},
        sell: (20 * SellEnum.RESSOURCE_10 + 20 * SellEnum.RESSOURCE_1) * MultiplicatorEnum.COMPLEXE_CRAFT,
        buy: (20 * BuyEnum.RESSOURCE_10 + 20 * BuyEnum.RESSOURCE_1) * MultiplicatorEnum.COMPLEXE_CRAFT,
        type: ItemType.FABRICATION,
        experience: 20 * XpEnum.RESSOURCE_10 + 20 * XpEnum.RESSOURCE_1,
        jobs: [JobEnum.PAYSAN],
        buildings: [BuildingEnum.BRASSERIE]
    },

    [CraftEnum.SUCRE_ORGE]: {
        name: CraftEnum.SUCRE_ORGE,
        recipe: {[RessourcesEnum.ORGE]: 10, [RessourcesEnum.ORTIE]: 20},
        sell: (10 * SellEnum.RESSOURCE_10 + 20 * SellEnum.RESSOURCE_1) * MultiplicatorEnum.COMPLEXE_CRAFT,
        buy: (10 * BuyEnum.RESSOURCE_10 + 20 * BuyEnum.RESSOURCE_1) * MultiplicatorEnum.COMPLEXE_CRAFT,
        type: ItemType.FABRICATION,
        experience: 10 * XpEnum.RESSOURCE_10 + 20 * XpEnum.RESSOURCE_1,
        jobs: [JobEnum.PAYSAN, JobEnum.ALCHIMISTE],
        buildings: [BuildingEnum.BRASSERIE]
    },

    // Niveau 10 + Niveau 10
    [CraftEnum.TRUITE_HERBES]: {
        name: CraftEnum.TRUITE_HERBES,
        recipe: {[CraftEnum.TRUITE_EN_TRANCHE]: 1, [RessourcesEnum.SAUGE]: 20},
        sell: 30 * SellEnum.RESSOURCE_10 * MultiplicatorEnum.COMPLEXE_CRAFT,
        buy: 30 * BuyEnum.RESSOURCE_10 * MultiplicatorEnum.COMPLEXE_CRAFT,
        tool: ToolsEnum.ATELIER_A_POISSON,
        type: ItemType.FABRICATION,
        experience: 30 * XpEnum.RESSOURCE_10,
        jobs: [JobEnum.PECHEUR, JobEnum.ALCHIMISTE]
    },
    [CraftEnum.PAIN_SAUGE]: {
        name: CraftEnum.PAIN_SAUGE,
        recipe: {[CraftEnum.FOUGASSE]: 1, [RessourcesEnum.SAUGE]: 10},
        sell: 30 * SellEnum.RESSOURCE_10 * MultiplicatorEnum.COMPLEXE_CRAFT,
        buy: 30 * BuyEnum.RESSOURCE_10 * MultiplicatorEnum.COMPLEXE_CRAFT,
        tool: ToolsEnum.FOUR_A_PAIN,
        type: ItemType.FABRICATION,
        experience: 30 * XpEnum.RESSOURCE_10,
        jobs: [JobEnum.PAYSAN, JobEnum.ALCHIMISTE]
    },
    [CraftEnum.GREUVETTE_HERBES]: {
        name: CraftEnum.GREUVETTE_HERBES,
        recipe: {[CraftEnum.PAIN_SAUGE]: 1, [CraftEnum.BEIGNET_GREUVETTE]: 2},
        sell: 30 * SellEnum.RESSOURCE_10 * MultiplicatorEnum.COMPLEXE_CRAFT,
        buy: 30 * BuyEnum.RESSOURCE_10 * MultiplicatorEnum.COMPLEXE_CRAFT,
        type: ItemType.FABRICATION,
        experience: 30 * XpEnum.RESSOURCE_10,
        jobs: [JobEnum.PAYSAN, JobEnum.PECHEUR]
    },
    [CraftEnum.TALISMAN_PAYSAN]: {
        name: CraftEnum.TALISMAN_PAYSAN,
        recipe: {[CraftEnum.LINGOT_CUIVRE]: 10, [RessourcesEnum.SAUGE]: 50},
        sell: 150 * SellEnum.RESSOURCE_10 * MultiplicatorEnum.COMPLEXE_CRAFT,
        buy: 150 * BuyEnum.RESSOURCE_10 * MultiplicatorEnum.COMPLEXE_CRAFT,
        type: ItemType.FABRICATION,
        experience: 150 * XpEnum.RESSOURCE_10,
        jobs: [JobEnum.MINEUR, JobEnum.ALCHIMISTE],
        buildings: [BuildingEnum.FORGE]
    },
    [CraftEnum.BOUCLIER_BOIS]: {
        name: CraftEnum.BOUCLIER_BOIS,
        recipe: {[CraftEnum.PLANCHE_CHATAIGNIER]: 10, [CraftEnum.LINGOT_CUIVRE]: 5},
        sell: 150 * SellEnum.RESSOURCE_10 * MultiplicatorEnum.COMPLEXE_CRAFT,
        buy: 150 * BuyEnum.RESSOURCE_10 * MultiplicatorEnum.COMPLEXE_CRAFT,
        type: ItemType.FABRICATION,
        experience: 30,
        jobs: [JobEnum.BUCHERON, JobEnum.MINEUR],
        buildings: [BuildingEnum.MENUISERIE]
    }
}
export default Craft;
export {Crafts}