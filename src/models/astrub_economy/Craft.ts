import BaseItem from "./BaseItem";
import {CraftEnum, JobEnum, ResourceEnum, XpEnum} from "./Enums";
import {BuildingEnum} from "./Building";
import {ItemType} from "../../utils/Enums";

interface Craft extends BaseItem {
    recipe: object;
    experience: number;
    jobs: JobEnum[];
    buildings?: BuildingEnum[];
}

const Crafts: Record<CraftEnum, Craft> = {
    // Niveau 1
    [CraftEnum.PAIN_INCARNAM]: {
        name: CraftEnum.PAIN_INCARNAM,
        recipe: {[ResourceEnum.BLE]: 10},
        tool: CraftEnum.FOUR_A_PAIN,
        type: ItemType.FABRICATION,
        experience: 10 * XpEnum.RESSOURCE_1,
        jobs: [JobEnum.PAYSAN]
    }, [CraftEnum.POTION_MINI_SOIN]: {
        name: CraftEnum.POTION_MINI_SOIN,
        recipe: {[ResourceEnum.ORTIE]: 10},
        tool: CraftEnum.MARMITE,
        type: ItemType.FABRICATION,
        experience: 10 * XpEnum.RESSOURCE_1,
        jobs: [JobEnum.ALCHIMISTE]
    }, [CraftEnum.GOUJON_EN_TRANCHE]: {
        name: CraftEnum.GOUJON_EN_TRANCHE,
        recipe: {[ResourceEnum.GOUJON]: 10},
        tool: CraftEnum.ATELIER_A_POISSON,
        type: ItemType.FABRICATION,
        experience: 10 * XpEnum.RESSOURCE_1,
        jobs: [JobEnum.PECHEUR]
    }, [CraftEnum.PLANCHE_FRENE]: {
        name: CraftEnum.PLANCHE_FRENE,
        recipe: {[ResourceEnum.FRENE]: 10},
        type: ItemType.FABRICATION,
        experience: 10 * XpEnum.RESSOURCE_1,
        jobs: [JobEnum.BUCHERON],
        buildings: [BuildingEnum.SCIERIE]
    }, [CraftEnum.LINGOT_FER]: {
        name: CraftEnum.LINGOT_FER,
        recipe: {[ResourceEnum.FER]: 10},
        type: ItemType.FABRICATION,
        experience: 10 * XpEnum.RESSOURCE_1,
        jobs: [JobEnum.MINEUR],
        buildings: [BuildingEnum.FONDERIE]
    },
    [CraftEnum.FOUR_A_PAIN]: {
        name: CraftEnum.FOUR_A_PAIN,
        recipe: {[ResourceEnum.FER]: 50, [ResourceEnum.FRENE]: 50},
        type: ItemType.FABRICATION,
        experience: 100 * XpEnum.RESSOURCE_1,
        jobs: [JobEnum.MINEUR, JobEnum.BUCHERON]
    },
    [CraftEnum.ATELIER_A_POISSON]: {
        name: CraftEnum.ATELIER_A_POISSON,
        recipe: {[ResourceEnum.FRENE]: 100},
        type: ItemType.FABRICATION,
        experience: 100 * XpEnum.RESSOURCE_1,
        jobs: [JobEnum.BUCHERON]
    },
    [CraftEnum.MARMITE]: {
        name: CraftEnum.MARMITE,
        recipe: {[ResourceEnum.FER]: 100},
        type: ItemType.FABRICATION,
        experience: 100 * XpEnum.RESSOURCE_1,
        jobs: [JobEnum.MINEUR]
    },

    // Niveau 1 + Niveau 1
    [CraftEnum.GOUJON_ORTIES]: {
        name: CraftEnum.GOUJON_ORTIES,
        recipe: {[CraftEnum.GOUJON_EN_TRANCHE]: 1, [ResourceEnum.ORTIE]: 20},
        tool: CraftEnum.ATELIER_A_POISSON,
        type: ItemType.FABRICATION,
        experience: 30 * XpEnum.RESSOURCE_1,
        jobs: [JobEnum.PECHEUR, JobEnum.ALCHIMISTE]
    }, [CraftEnum.PAIN_ORTIES]: {
        name: CraftEnum.PAIN_ORTIES,
        recipe: {[CraftEnum.PAIN_INCARNAM]: 1, [ResourceEnum.ORTIE]: 20},
        tool: CraftEnum.FOUR_A_PAIN,
        type: ItemType.FABRICATION,
        experience: 30 * XpEnum.RESSOURCE_1,
        jobs: [JobEnum.PAYSAN, JobEnum.ALCHIMISTE]
    }, [CraftEnum.SANDWICH_AU_GOUJON]: {
        name: CraftEnum.SANDWICH_AU_GOUJON,
        recipe: {[CraftEnum.PAIN_INCARNAM]: 1, [CraftEnum.GOUJON_EN_TRANCHE]: 2},
        tool: CraftEnum.FOUR_A_PAIN,
        type: ItemType.FABRICATION,
        experience: 30 * XpEnum.RESSOURCE_1,
        jobs: [JobEnum.PAYSAN, JobEnum.PECHEUR]
    }, [CraftEnum.EPEE_BOISAILLE]: {
        name: CraftEnum.EPEE_BOISAILLE,
        recipe: {[CraftEnum.LINGOT_FER]: 15, [CraftEnum.PLANCHE_FRENE]: 5},
        type: ItemType.FABRICATION,
        experience: 200 * XpEnum.RESSOURCE_1,
        jobs: [JobEnum.BUCHERON, JobEnum.MINEUR],
        buildings: [BuildingEnum.FORGE]
    },

    // Niveau 10
    [CraftEnum.PLANCHE_CHATAIGNIER]: {
        name: CraftEnum.PLANCHE_CHATAIGNIER,
        recipe: {[ResourceEnum.CHATAIGNIER]: 20},
        type: ItemType.FABRICATION,
        experience: 20 * XpEnum.RESSOURCE_10,
        jobs: [JobEnum.BUCHERON],
        buildings: [BuildingEnum.SCIERIE]
    }, [CraftEnum.LINGOT_CUIVRE]: {
        name: CraftEnum.LINGOT_CUIVRE,
        recipe: {[ResourceEnum.CUIVRE]: 20},
        type: ItemType.FABRICATION,
        experience: 20 * XpEnum.RESSOURCE_10,
        jobs: [JobEnum.MINEUR],
        buildings: [BuildingEnum.FONDERIE]
    }, [CraftEnum.POTION_RAPPEL]: {
        name: CraftEnum.POTION_RAPPEL,
        recipe: {[ResourceEnum.SAUGE]: 20},
        tool: CraftEnum.MARMITE,
        type: ItemType.FABRICATION,
        experience: 20 * XpEnum.RESSOURCE_10,
        jobs: [JobEnum.ALCHIMISTE]
    }, [CraftEnum.FOUGASSE]: {
        name: CraftEnum.FOUGASSE,
        recipe: {[ResourceEnum.ORGE]: 20},
        type: ItemType.FABRICATION,
        experience: 20 * XpEnum.RESSOURCE_10,
        jobs: [JobEnum.PAYSAN]
    }, [CraftEnum.BEIGNET_GREUVETTE]: {
        name: CraftEnum.BEIGNET_GREUVETTE,
        recipe: {[ResourceEnum.GREUVETTE]: 20},
        tool: CraftEnum.ATELIER_A_POISSON,
        type: ItemType.FABRICATION,
        experience: 20 * XpEnum.RESSOURCE_10,
        jobs: [JobEnum.PECHEUR]
    }, [CraftEnum.TRUITE_EN_TRANCHE]: {
        name: CraftEnum.TRUITE_EN_TRANCHE,
        recipe: {[ResourceEnum.TRUITE]: 20},
        tool: CraftEnum.ATELIER_A_POISSON,
        type: ItemType.FABRICATION,
        experience: 20 * XpEnum.RESSOURCE_10,
        jobs: [JobEnum.PECHEUR]
    },

    // Niveau 1 + Niveau 10
    [CraftEnum.BIERE_ASTRUB]: {
        name: CraftEnum.BIERE_ASTRUB,
        recipe: {[ResourceEnum.ORGE]: 5},
        type: ItemType.FABRICATION,
        experience: 5 * XpEnum.RESSOURCE_10,
        jobs: [JobEnum.PAYSAN],
        buildings: [BuildingEnum.BRASSERIE]
    },
    [CraftEnum.LANTERNE]: {
        name: CraftEnum.LANTERNE,
        recipe: {[CraftEnum.LINGOT_FER]: 5, [CraftEnum.LINGOT_CUIVRE]: 1},
        type: ItemType.FABRICATION,
        experience: 50 * XpEnum.RESSOURCE_1 + 20 * XpEnum.RESSOURCE_10,
        jobs: [JobEnum.MINEUR],
        buildings: [BuildingEnum.FORGE]
    },

    [CraftEnum.SUCRE_ORGE]: {
        name: CraftEnum.SUCRE_ORGE,
        recipe: {[ResourceEnum.ORGE]: 10, [ResourceEnum.ORTIE]: 20},
        type: ItemType.FABRICATION,
        experience: 10 * XpEnum.RESSOURCE_10 + 20 * XpEnum.RESSOURCE_1,
        jobs: [JobEnum.PAYSAN, JobEnum.ALCHIMISTE],
        buildings: [BuildingEnum.BRASSERIE]
    },

    // Niveau 10 + Niveau 10
    [CraftEnum.TRUITE_HERBES]: {
        name: CraftEnum.TRUITE_HERBES,
        recipe: {[CraftEnum.TRUITE_EN_TRANCHE]: 1, [ResourceEnum.SAUGE]: 20},
        tool: CraftEnum.ATELIER_A_POISSON,
        type: ItemType.FABRICATION,
        experience: 30 * XpEnum.RESSOURCE_10,
        jobs: [JobEnum.PECHEUR, JobEnum.ALCHIMISTE]
    }, [CraftEnum.PAIN_SAUGE]: {
        name: CraftEnum.PAIN_SAUGE,
        recipe: {[CraftEnum.FOUGASSE]: 1, [ResourceEnum.SAUGE]: 10},
        tool: CraftEnum.FOUR_A_PAIN,
        type: ItemType.FABRICATION,
        experience: 30 * XpEnum.RESSOURCE_10,
        jobs: [JobEnum.PAYSAN, JobEnum.ALCHIMISTE]
    }, [CraftEnum.PATE_GREUVETTES]: {
        name: CraftEnum.PATE_GREUVETTES,
        recipe: {[ResourceEnum.GREUVETTE]: 20},
        type: ItemType.FABRICATION,
        experience: 20 * XpEnum.RESSOURCE_10,
        jobs: [JobEnum.PAYSAN, JobEnum.PECHEUR]
    }, [CraftEnum.TALISMAN_CUIVRE]: {
        name: CraftEnum.TALISMAN_CUIVRE,
        recipe: {[CraftEnum.LINGOT_CUIVRE]: 5, [ResourceEnum.SAUGE]: 50},
        type: ItemType.FABRICATION,
        experience: 150 * XpEnum.RESSOURCE_10,
        jobs: [JobEnum.MINEUR, JobEnum.ALCHIMISTE],
        buildings: [BuildingEnum.FORGE]
    }, [CraftEnum.BOUCLIER_BOIS]: {
        name: CraftEnum.BOUCLIER_BOIS,
        recipe: {[CraftEnum.PLANCHE_CHATAIGNIER]: 5},
        type: ItemType.FABRICATION,
        experience: 100 * XpEnum.RESSOURCE_10,
        jobs: [JobEnum.BUCHERON, JobEnum.MINEUR],
        buildings: [BuildingEnum.MENUISERIE]
    },

    // Niveau 20
    [CraftEnum.PLANCHE_NOYER]: {
        name: CraftEnum.PLANCHE_NOYER,
        recipe: {[ResourceEnum.NOYER]: 20},
        type: ItemType.FABRICATION,
        experience: 20 * XpEnum.RESSOURCE_20,
        jobs: [JobEnum.BUCHERON],
        buildings: [BuildingEnum.SCIERIE]
    }, [CraftEnum.LINGOT_BRONZE]: {
        name: CraftEnum.LINGOT_BRONZE,
        recipe: {[ResourceEnum.BRONZE]: 20},
        type: ItemType.FABRICATION,
        experience: 20 * XpEnum.RESSOURCE_20,
        jobs: [JobEnum.MINEUR],
        buildings: [BuildingEnum.FONDERIE]
    }, [CraftEnum.POTION_SOIN]: {
        name: CraftEnum.POTION_SOIN,
        recipe: {[ResourceEnum.TREFLE_CINQ_FEUILLES]: 20},
        tool: CraftEnum.MARMITE,
        type: ItemType.FABRICATION,
        experience: 20 * XpEnum.RESSOURCE_20,
        jobs: [JobEnum.ALCHIMISTE]
    }, [CraftEnum.PAIN_FLOCONS_AVOINE]: {
        name: CraftEnum.PAIN_FLOCONS_AVOINE,
        recipe: {[ResourceEnum.AVOINE]: 20},
        type: ItemType.FABRICATION,
        experience: 20 * XpEnum.RESSOURCE_20,
        jobs: [JobEnum.PAYSAN]
    }, [CraftEnum.BATON_CRABE]: {
        name: CraftEnum.BATON_CRABE,
        recipe: {[ResourceEnum.CRABE_SOURIMI]: 20},
        tool: CraftEnum.ATELIER_A_POISSON,
        type: ItemType.FABRICATION,
        experience: 20 * XpEnum.RESSOURCE_20,
        jobs: [JobEnum.PECHEUR]
    }, [CraftEnum.POISSON_CHATON_FUME]: {
        name: CraftEnum.POISSON_CHATON_FUME,
        recipe: {[ResourceEnum.POISSON_CHATON]: 20},
        tool: CraftEnum.ATELIER_A_POISSON,
        type: ItemType.FABRICATION,
        experience: 20 * XpEnum.RESSOURCE_20,
        jobs: [JobEnum.PECHEUR]
    },

    // Alliages multi-niveaux
    [CraftEnum.ALUMINITE]: {
        name: CraftEnum.ALUMINITE,
        recipe: { [CraftEnum.LINGOT_FER]: 10, [CraftEnum.LINGOT_CUIVRE]: 1 },
        type: ItemType.FABRICATION,
        experience: 100 * XpEnum.RESSOURCE_1 + 20 * XpEnum.RESSOURCE_10,
        jobs: [JobEnum.MINEUR],
        buildings: [BuildingEnum.FONDERIE]
    }, [CraftEnum.EBONITE]: {
        name: CraftEnum.EBONITE,
        recipe: { [CraftEnum.LINGOT_FER]: 10, [CraftEnum.LINGOT_CUIVRE]: 5, [CraftEnum.LINGOT_BRONZE]: 1 },
        type: ItemType.FABRICATION,
        experience: 100 * XpEnum.RESSOURCE_1 + 100 * XpEnum.RESSOURCE_10 + 20 * XpEnum.RESSOURCE_20,
        jobs: [JobEnum.MINEUR],
        buildings: [BuildingEnum.FONDERIE]
    },

    // Niveau 20 - Complexe
    [CraftEnum.TABLE_NOYER]: {
        name: CraftEnum.TABLE_NOYER,
        recipe: { [CraftEnum.PLANCHE_NOYER]: 5},
        type: ItemType.FABRICATION,
        experience: 100 * XpEnum.RESSOURCE_20,
        jobs: [JobEnum.BUCHERON],
        buildings: [BuildingEnum.MENUISERIE]
    }, [CraftEnum.SANDWICH_POISSON_CHATON]: {
        name: CraftEnum.SANDWICH_POISSON_CHATON,
        recipe: { [CraftEnum.PAIN_FLOCONS_AVOINE]: 1, [CraftEnum.POISSON_CHATON_FUME]: 2 },
        tool: CraftEnum.FOUR_A_PAIN,
        type: ItemType.FABRICATION,
        experience: 30 * XpEnum.RESSOURCE_20,
        jobs: [JobEnum.PAYSAN, JobEnum.PECHEUR]
    }, [CraftEnum.POISSON_CHATON_HERBES]: {
        name: CraftEnum.POISSON_CHATON_HERBES,
        recipe: { [CraftEnum.POISSON_CHATON_FUME]: 1, [ResourceEnum.TREFLE_CINQ_FEUILLES]: 20 },
        tool: CraftEnum.ATELIER_A_POISSON,
        type: ItemType.FABRICATION,
        experience: 30 * XpEnum.RESSOURCE_20,
        jobs: [JobEnum.PECHEUR, JobEnum.ALCHIMISTE]
    }, [CraftEnum.CRABE_SOURIMI_HERBES]: {
        name: CraftEnum.CRABE_SOURIMI_HERBES,
        recipe: { [CraftEnum.BATON_CRABE]: 1, [ResourceEnum.TREFLE_CINQ_FEUILLES]: 20 },
        tool: CraftEnum.ATELIER_A_POISSON,
        type: ItemType.FABRICATION,
        experience: 30 * XpEnum.RESSOURCE_20,
        jobs: [JobEnum.PECHEUR, JobEnum.ALCHIMISTE]
    },

    // Bûcheron
    [CraftEnum.HACHE_FRENE]: {
        name: CraftEnum.HACHE_FRENE,
        recipe: { [ResourceEnum.FRENE]: 50 },
        type: ItemType.OUTIL,
        experience: 50 * XpEnum.RESSOURCE_1,
        jobs: [JobEnum.BUCHERON],
        level: 0,
    },
    [CraftEnum.HACHE_CHATAIGNIER]: {
        name: CraftEnum.HACHE_CHATAIGNIER,
        recipe: { [ResourceEnum.CHATAIGNIER]: 100 },
        type: ItemType.OUTIL,
        experience: 100 * XpEnum.RESSOURCE_10,
        jobs: [JobEnum.BUCHERON],
        buildings: [BuildingEnum.SCIERIE],
        level: 10,
    },
    [CraftEnum.HACHE_NOYER]: {
        name: CraftEnum.HACHE_NOYER,
        recipe: { [ResourceEnum.NOYER]: 150 },
        type: ItemType.OUTIL,
        experience: 150 * XpEnum.RESSOURCE_20,
        jobs: [JobEnum.BUCHERON],
        buildings: [BuildingEnum.MENUISERIE],
        level: 20,
    },

    // Mineur
    [CraftEnum.PIOCHE_FER]: {
        name: CraftEnum.PIOCHE_FER,
        recipe: { [ResourceEnum.FER]: 50 },
        type: ItemType.OUTIL,
        experience: 50 * XpEnum.RESSOURCE_1,
        jobs: [JobEnum.MINEUR],
        level: 0,
    },
    [CraftEnum.PIOCHE_CUIVRE]: {
        name: CraftEnum.PIOCHE_CUIVRE,
        recipe: { [ResourceEnum.CUIVRE]: 100 },
        type: ItemType.OUTIL,
        experience: 100 * XpEnum.RESSOURCE_10,
        jobs: [JobEnum.MINEUR],
        buildings: [BuildingEnum.FONDERIE],
        level: 10,
    },
    [CraftEnum.PIOCHE_BRONZE]: {
        name: CraftEnum.PIOCHE_BRONZE,
        recipe: { [ResourceEnum.BRONZE]: 150 },
        type: ItemType.OUTIL,
        experience: 150 * XpEnum.RESSOURCE_20,
        jobs: [JobEnum.MINEUR],
        buildings: [BuildingEnum.FORGE],
        level: 20,
    },

    // Alchimiste
    [CraftEnum.SERPE_A_ORTIE]: {
        name: CraftEnum.SERPE_A_ORTIE,
        recipe: { [ResourceEnum.ORTIE]: 50 },
        type: ItemType.OUTIL,
        experience: 50 * XpEnum.RESSOURCE_1,
        jobs: [JobEnum.ALCHIMISTE],
        level: 0,
    },
    [CraftEnum.SERPE_A_SAUGE]: {
        name: CraftEnum.SERPE_A_SAUGE,
        recipe: { [ResourceEnum.SAUGE]: 100 },
        type: ItemType.OUTIL,
        experience: 100 * XpEnum.RESSOURCE_10,
        jobs: [JobEnum.ALCHIMISTE],
        buildings: [BuildingEnum.FONDERIE],
        level: 10,
    },
    [CraftEnum.SERPE_A_TREFLE]: {
        name: CraftEnum.SERPE_A_TREFLE,
        recipe: { [ResourceEnum.TREFLE_CINQ_FEUILLES]: 150 },
        type: ItemType.OUTIL,
        experience: 150 * XpEnum.RESSOURCE_20,
        jobs: [JobEnum.ALCHIMISTE],
        buildings: [BuildingEnum.MENUISERIE],
        level: 20,
    },

    // Paysan
    [CraftEnum.FAUX_BLE]: {
        name: CraftEnum.FAUX_BLE,
        recipe: { [ResourceEnum.BLE]: 50 },
        type: ItemType.OUTIL,
        experience: 50 * XpEnum.RESSOURCE_1,
        jobs: [JobEnum.PAYSAN],
        level: 0,
    },
    [CraftEnum.FAUX_ORGE]: {
        name: CraftEnum.FAUX_ORGE,
        recipe: { [ResourceEnum.ORGE]: 100 },
        type: ItemType.OUTIL,
        experience: 100 * XpEnum.RESSOURCE_10,
        jobs: [JobEnum.PAYSAN],
        buildings: [BuildingEnum.SCIERIE],
        level: 10,
    },
    [CraftEnum.FAUX_AVOINE]: {
        name: CraftEnum.FAUX_AVOINE,
        recipe: { [ResourceEnum.AVOINE]: 150 },
        type: ItemType.OUTIL,
        experience: 150 * XpEnum.RESSOURCE_20,
        jobs: [JobEnum.PAYSAN],
        buildings: [BuildingEnum.MENUISERIE],
        level: 20,
    },

    // Pêcheur
    [CraftEnum.CANNE_GOUJON]: {
        name: CraftEnum.CANNE_GOUJON,
        recipe: { [ResourceEnum.GOUJON]: 50 },
        type: ItemType.OUTIL,
        experience: 50 * XpEnum.RESSOURCE_1,
        jobs: [JobEnum.PECHEUR],
        level: 0,
    },
    [CraftEnum.CANNE_GREUVETTE]: {
        name: CraftEnum.CANNE_GREUVETTE,
        recipe: { [ResourceEnum.GREUVETTE]: 100 },
        type: ItemType.OUTIL,
        experience: 100 * XpEnum.RESSOURCE_10,
        jobs: [JobEnum.PECHEUR],
        buildings: [BuildingEnum.SCIERIE],
        level: 10,
    },
    [CraftEnum.CANNE_POISSON_CHATON]: {
        name: CraftEnum.CANNE_POISSON_CHATON,
        recipe: { [ResourceEnum.POISSON_CHATON]: 150 },
        type: ItemType.OUTIL,
        experience: 150 * XpEnum.RESSOURCE_20,
        jobs: [JobEnum.PECHEUR],
        buildings: [BuildingEnum.MENUISERIE],
        level: 20,
    }
}
export default Craft;
export {Crafts}
