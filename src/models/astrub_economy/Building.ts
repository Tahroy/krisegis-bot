import {CraftEnum, ResourceEnum} from "./Enums";

class Building {
    name!: string
    description!: string
    recipe!: Record<string, number>
    image!: string
    shortDescription!: string
}

enum BuildingEnum {
    SANCTUAIRE = "Sanctuaire",
    SCIERIE = "Scierie",
    FONDERIE = "Fonderie",
    BRASSERIE = "Brasserie",
    MENUISERIE = "Menuiserie",
    FORGE = "Forge",
    RESERVE = "Réserve",
    ORPHELINAT = "Orphelinat",
    TAVERNE = "Taverne",
    MILICE = "Milice",
    BOUFTONNERIE = "Bouftonnerie",
}

const Buildings: Record<BuildingEnum, Building> = {
    [BuildingEnum.SANCTUAIRE]: {
        name: BuildingEnum.SANCTUAIRE,
        description: "Petit sanctuaire fait de pierre et de bois disposé au centre du marché. Les habitants peuvent y déposer une offrande dans la coupe sacrée pour espérer que les Dix leur répondent.",
        shortDescription: "Débloque les prières",
        recipe: {
            [ResourceEnum.PIERRE]: 1000,
            [CraftEnum.PLANCHE_FRENE]: 500,
            [CraftEnum.LINGOT_FER]: 500,
            [ResourceEnum.KAMAS]: 10000
        },
        image: 'sanctuaire.png'
    },
    [BuildingEnum.SCIERIE]: {
        name: BuildingEnum.SCIERIE,
        description: "Scierie fabriquée en bois avec une scie en fer. Les bûcherons peuvent y découper leur bois pour créer des planches.",
        shortDescription: "Débloque les planches",
        recipe: {
            [ResourceEnum.FRENE]: 5000,
            [ResourceEnum.FER]: 2500,
            [ResourceEnum.PIERRE]: 1000,
            [ResourceEnum.KAMAS]: 5000
        },
        image: 'scierie.png'
    },
    [BuildingEnum.FONDERIE]: {
        name: BuildingEnum.FONDERIE,
        description: "Une magnifique fonderie où les animaux ont tendance à se rapprocher en période de gel. Les mineurs y viennent afin de raffiner les minerais bruts.",
        shortDescription: "Débloque les lingots",
        recipe: {
            [ResourceEnum.FRENE]: 2500,
            [ResourceEnum.FER]: 5000,
            [ResourceEnum.PIERRE]: 1000,
            [ResourceEnum.KAMAS]: 5000
        },
        image: 'fonderie.png'
    },
    [BuildingEnum.BRASSERIE]: {
        name: BuildingEnum.BRASSERIE,
        description: "La bière d'Astrub n'attend qu'à être connue du Monde des Dix ! Cette brasserie accueille de nombreux travailleurs, prêts à faire de nouvelles découvertes aromatiques et surtout tester leurs propres produits.",
        shortDescription: "Débloque la bière",
        recipe: {
            [ResourceEnum.PIERRE]: 1000,
            [CraftEnum.PLANCHE_CHATAIGNIER]: 150,
            [CraftEnum.LINGOT_CUIVRE]: 150,
            [ResourceEnum.KAMAS]: 10000
        },
        image: 'brasserie.png'
    },

    [BuildingEnum.FORGE]: {
        name: BuildingEnum.FORGE,
        description: "Forge imposante avec plusieurs enclumes où les forgerons travaillent le métal. On y fabrique des objets métalliques précieux, des talismans, des bijoux et des armes. Chaque matin, les enfants viennent admirer les marteaux frappant le métal..",
        shortDescription: "Débloque le travail du métal",
        recipe: {
            [ResourceEnum.PIERRE]: 1000,
            [CraftEnum.LINGOT_CUIVRE]: 200,
            [CraftEnum.PLANCHE_CHATAIGNIER]: 50,
            [ResourceEnum.KAMAS]: 10000
        },
        image: 'forge.png'
    },
    [BuildingEnum.MENUISERIE]: {
        name: BuildingEnum.MENUISERIE,
        description: "Atelier de menuiserie où les artisans transforment le bois en objets utiles comme des boucliers, des meubles et des armes. On y remarque même quelques statuettes en hommage aux dieux.",
        shortDescription: "Débloque le travail du bois",
        recipe: {
            [ResourceEnum.PIERRE]: 1000,
            [CraftEnum.LINGOT_CUIVRE]: 50,
            [CraftEnum.PLANCHE_CHATAIGNIER]: 200,
            [ResourceEnum.KAMAS]: 10000
        },
        image: 'menuiserie.png'
    },
    [BuildingEnum.RESERVE]: {
        name: BuildingEnum.RESERVE,
        description: "Grande réserve d'Astrub. Ce bâtiment permet de mettre en commun des ressources entre les différents artisans et habitants du village. Certains disent que c'est une insulte à Enutrof, d'autres qu'Eniripsa veille sur le village.",
        shortDescription: "Débloque la réserve",
        recipe: {
            [ResourceEnum.PIERRE]: 500,
            [CraftEnum.LINGOT_FER]: 200,
            [CraftEnum.PLANCHE_FRENE]: 200,
            [CraftEnum.GOUJON_EN_TRANCHE]: 200,
            [CraftEnum.POTION_MINI_SOIN]: 200,
            [CraftEnum.PAIN_INCARNAM]: 200,
            [ResourceEnum.KAMAS]: 5000
        },
        image: 'reserve.png'
    },
    [BuildingEnum.ORPHELINAT]: {
        name: BuildingEnum.ORPHELINAT,
        description: "Malheureusement, tous les aventuriers ne rentrent pas. Tous les mercenaires ne survivent pas et tous les malades ne guérissent pas. L'orphelinat s'occupe de tous ceux qui ont perdu leurs parents et permet de retrouver un peu de joie.",
        shortDescription: "Débloque de nouvelles quêtes",
        recipe: {
            [ResourceEnum.BLE]: 500,
            [ResourceEnum.PIERRE]: 500,
            [CraftEnum.LINGOT_FER]: 200,
            [CraftEnum.PLANCHE_FRENE]: 500,
            [ResourceEnum.KAMAS]: 5000,
        },
        image: 'orphelinat.png'
    },
    [BuildingEnum.TAVERNE]: {
        name: BuildingEnum.TAVERNE,
        description: "La taverne d'Astrub est LE lieu le plus important du village. Paysans, commerçants, mercenaires, nobles, pauvres... Tout le monde s'y retrouve pour fêter ou oublier sa journée.",
        shortDescription: "Débloque de nouvelles quêtes",
        recipe: {
            [ResourceEnum.PIERRE]: 500,
            [CraftEnum.PLANCHE_FRENE]: 200,
            [CraftEnum.LINGOT_FER]: 50,
            [CraftEnum.PLANCHE_CHATAIGNIER]: 50,
            [CraftEnum.LINGOT_CUIVRE]: 25,
            [ResourceEnum.KAMAS]:5000,
        },
        image: 'taverne.png'
    },
    [BuildingEnum.MILICE]: {
        name: BuildingEnum.MILICE,
        description: "Dans un besoin de protéger les habitants des monstres et des bandits, des habitants ont pris les armes pour former une milice, en collaboration avec les mercenaires.",
        shortDescription: "Débloque de nouvelles quêtes",
        recipe: {
            [ResourceEnum.PIERRE]: 500,
            [CraftEnum.LINGOT_FER]: 75,
            [CraftEnum.PLANCHE_FRENE]: 75,
            [CraftEnum.PLANCHE_CHATAIGNIER]: 50,
            [CraftEnum.LINGOT_CUIVRE]: 50,
            [ResourceEnum.KAMAS]: 5000,
        },
        image: 'milice.png'
    },
    [BuildingEnum.BOUFTONNERIE]: {
        name: BuildingEnum.BOUFTONNERIE,
        description: "Une bouftonnerie habituée par un vieil homme en fin de carrière. Il a décidé de s'installer à Astrub et d'offrir son expertise à ceux qui viennent nourrir ses bêtes",
        shortDescription: "Débloque les bouftous",
        recipe: {
            [ResourceEnum.BLE]: 2500,
            [ResourceEnum.PIERRE]: 1000,
            [CraftEnum.PLANCHE_NOYER]: 100,
            [ResourceEnum.KAMAS]: 10000
        },
        image: 'bouftonnerie.png'
    }
}

export {BuildingEnum, Buildings, Building}

