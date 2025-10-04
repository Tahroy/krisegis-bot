import BaseItem from "./BaseItem";
import {JobEnum, LevelEnum, ResourceEnum} from "./Enums";
import {ItemType} from "../../utils/Enums";

interface Resource extends BaseItem {
    job?: string;
    level: LevelEnum;
}


// Exemple d'utilisation
const Ressources: Record<ResourceEnum, Resource> = {

    // Ressources de niveau 1
    [ResourceEnum.BLE]: {
        name: ResourceEnum.BLE, job: JobEnum.PAYSAN, level: LevelEnum.LEVEL_0, type: ItemType.RESSOURCE, emoji: "ble"
    },
    [ResourceEnum.ORTIE]: {
        name: ResourceEnum.ORTIE,
        job: JobEnum.ALCHIMISTE,
        level: LevelEnum.LEVEL_0,
        type: ItemType.RESSOURCE,
        emoji: "ortie"
    },
    [ResourceEnum.GOUJON]: {
        name: ResourceEnum.GOUJON,
        job: JobEnum.PECHEUR,
        level: LevelEnum.LEVEL_0,
        type: ItemType.RESSOURCE,
        emoji: "goujon"
    },
    [ResourceEnum.FRENE]: {
        name: ResourceEnum.FRENE,
        job: JobEnum.BUCHERON,
        level: LevelEnum.LEVEL_0,
        type: ItemType.RESSOURCE,
        emoji: "frene"
    },
    [ResourceEnum.FER]: {
        name: ResourceEnum.FER, job: JobEnum.MINEUR, level: LevelEnum.LEVEL_0, type: ItemType.RESSOURCE, emoji: "fer"
    },

    // Niveau 10
    [ResourceEnum.CHATAIGNIER]: {
        name: ResourceEnum.CHATAIGNIER,
        job: JobEnum.BUCHERON,
        level: LevelEnum.LEVEL_10,
        type: ItemType.RESSOURCE,
        emoji: "chataignier"
    },
    [ResourceEnum.CUIVRE]: {
        name: ResourceEnum.CUIVRE,
        job: JobEnum.MINEUR,
        level: LevelEnum.LEVEL_10,
        type: ItemType.RESSOURCE,
        emoji: "cuivre"
    },
    [ResourceEnum.SAUGE]: {
        name: ResourceEnum.SAUGE,
        job: JobEnum.ALCHIMISTE,
        level: LevelEnum.LEVEL_10,
        type: ItemType.RESSOURCE,
        emoji: "sauge"
    },
    [ResourceEnum.ORGE]: {
        name: ResourceEnum.ORGE, job: JobEnum.PAYSAN, level: LevelEnum.LEVEL_10, type: ItemType.RESSOURCE, emoji: "orge"
    },
    [ResourceEnum.GREUVETTE]: {
        name: ResourceEnum.GREUVETTE,
        job: JobEnum.PECHEUR,
        level: LevelEnum.LEVEL_10,
        type: ItemType.RESSOURCE,
        emoji: "greuvette"
    },
    [ResourceEnum.TRUITE]: {
        name: ResourceEnum.TRUITE,
        job: JobEnum.PECHEUR,
        level: LevelEnum.LEVEL_10,
        type: ItemType.RESSOURCE,
        emoji: "truite"
    },

    // Niveau 20
    [ResourceEnum.AVOINE]: {
        name: ResourceEnum.AVOINE,
        job: JobEnum.PAYSAN,
        level: LevelEnum.LEVEL_20,
        type: ItemType.RESSOURCE,
        emoji: "avoine"
    },
    [ResourceEnum.TREFLE_CINQ_FEUILLES]: {
        name: ResourceEnum.TREFLE_CINQ_FEUILLES,
        job: JobEnum.ALCHIMISTE,
        level: LevelEnum.LEVEL_20,
        type: ItemType.RESSOURCE,
        emoji: "trefle"
    },
    [ResourceEnum.NOYER]: {
        name: ResourceEnum.NOYER,
        job: JobEnum.BUCHERON,
        level: LevelEnum.LEVEL_20,
        type: ItemType.RESSOURCE,
        emoji: "noyer"
    },
    [ResourceEnum.BRONZE]: {
        name: ResourceEnum.BRONZE,
        job: JobEnum.MINEUR,
        level: LevelEnum.LEVEL_20,
        type: ItemType.RESSOURCE,
        emoji: "bronze"
    },
    [ResourceEnum.CRABE_SOURIMI]: {
        name: ResourceEnum.CRABE_SOURIMI,
        job: JobEnum.PECHEUR,
        level: LevelEnum.LEVEL_20,
        type: ItemType.RESSOURCE,
        emoji: "crabe"
    },
    [ResourceEnum.POISSON_CHATON]: {
        name: ResourceEnum.POISSON_CHATON,
        job: JobEnum.PECHEUR,
        level: LevelEnum.LEVEL_20,
        type: ItemType.RESSOURCE,
        emoji: "poissonchaton"
    },

    // Ressources neutres
    [ResourceEnum.KAMAS]: {
        name: ResourceEnum.KAMAS, job: undefined, level: LevelEnum.LEVEL_0, type: ItemType.RESSOURCE, emoji: "kamas"
    },

    [ResourceEnum.PIERRE]: {
        name: ResourceEnum.PIERRE, job: undefined, level: LevelEnum.LEVEL_0, type: ItemType.RESSOURCE, emoji: "pierre"
    },
    [ResourceEnum.LAINE_DE_BOUFTOU]: {
        name: ResourceEnum.LAINE_DE_BOUFTOU,
        job: undefined,
        level: LevelEnum.LEVEL_0,
        type: ItemType.RESSOURCE,
        emoji: "laine"
    },
    [ResourceEnum.CUIR]: {
        name: ResourceEnum.CUIR, job: undefined, level: LevelEnum.LEVEL_0, type: ItemType.RESSOURCE, emoji: "cuir"
    },
    [ResourceEnum.TISSU]: {
        name: ResourceEnum.TISSU, job: undefined, level: LevelEnum.LEVEL_0, type: ItemType.RESSOURCE, emoji: "tissu"
    },
    [ResourceEnum.OEUF]: {
        name: ResourceEnum.OEUF,
        job: undefined,
        level: LevelEnum.LEVEL_0,
        type: ItemType.RESSOURCE
    },
    [ResourceEnum.BOUFTOU]: {
        name: ResourceEnum.BOUFTOU,
        job: undefined,
        level: LevelEnum.LEVEL_0,
        type: ItemType.RESSOURCE,
        emoji: "bouftou"
    },
};

export default Resource;
export {Ressources}