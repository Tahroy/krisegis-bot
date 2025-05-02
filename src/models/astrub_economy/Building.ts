import {CraftEnum, RessourcesEnum} from "./Enums";

interface Building {
    name: string
    description: string
    recipe: Record<string, number>,
    image: string
}

enum BuildingEnum {
    SANCTUAIRE = "Sanctuaire",
    SCIERIE = "Scierie",
    FONDERIE = "Fonderie",
    BRASSERIE = "Brasserie",
    MENUISERIE = "Menuiserie",
    FORGE = "Forge",
}

const Buildings: Record<BuildingEnum, Building> = {
    [BuildingEnum.SCIERIE]: {
        name: BuildingEnum.SCIERIE,
        description: "Scierie fabriquée en bois avec une scie en fer. Les bûcherons peuvent y découper leur bois pour créer des planches.",
        recipe: {
            [RessourcesEnum.FRENE]: 5000,
            [RessourcesEnum.FER]: 2500,
            [RessourcesEnum.PIERRE]: 2500,
            [RessourcesEnum.KAMAS]: 10000
        },
        image: 'scierie.png'
    },
    [BuildingEnum.FONDERIE]: {
        name: BuildingEnum.FONDERIE,
        description: "Une magnifique fonderie où les animaux ont tendance à se rapprocher en période de gel. Les mineurs y viennent afin de raffiner les minerais bruts.",
        recipe: {
            [RessourcesEnum.FRENE]: 2500,
            [RessourcesEnum.FER]: 5000,
            [RessourcesEnum.PIERRE]: 2500,
            [RessourcesEnum.KAMAS]: 10000
        },
        image: 'fonderie.png'
    },
    [BuildingEnum.SANCTUAIRE]: {
        name: BuildingEnum.SANCTUAIRE,
        description: "Petit sanctuaire fait de pierre et de bois disposé au centre du marché. Les habitants peuvent y déposer une offrande dans la coupe sacrée pour espérer que les Dix leur répondent.",
        recipe: {
            [RessourcesEnum.PIERRE]: 3500,
            [CraftEnum.PLANCHE_FRENE]: 1000,
            [CraftEnum.LINGOT_FER]: 1000,
            [RessourcesEnum.KAMAS]: 10000
        },
        image: 'sanctuaire.png'
    },
    [BuildingEnum.BRASSERIE]: {
        name: BuildingEnum.BRASSERIE,
        description: "La bière d'Astrub n'attend qu'à être connue du Monde des Dix ! Cette brasserie accueille de nombreux travailleurs, prêts à faire de nouvelles découvertes aromatiques et surtout tester leurs propres produits.",
        recipe: {
            [RessourcesEnum.PIERRE]: 2500,
            [CraftEnum.PLANCHE_CHATAIGNIER]: 200,
            [CraftEnum.LINGOT_CUIVRE]: 200,
            [RessourcesEnum.KAMAS]: 15000
        },
        image: 'brasserie.png'
    },
    [BuildingEnum.MENUISERIE]: {
        name: BuildingEnum.MENUISERIE,
        description: "Atelier de menuiserie où les artisans transforment le bois en objets utiles comme des boucliers, des meubles et des armes. On y remarque même quelques statuettes en hommage aux dieux.",
        recipe: {
            [RessourcesEnum.PIERRE]: 2500,
            [CraftEnum.LINGOT_CUIVRE]: 150,
            [CraftEnum.PLANCHE_CHATAIGNIER]: 250,
            [RessourcesEnum.KAMAS]: 15000
        },
        image: 'menuiserie.png'
    },
    [BuildingEnum.FORGE]: {
        name: BuildingEnum.FORGE,
        description: "Forge imposante avec plusieurs enclumes où les forgerons travaillent le métal. On y fabrique des objets métalliques précieux, des talismans, des bijoux et des armes. Chaque matin, les enfants viennent admirer les marteaux frappant le métal..",
        recipe: {
            [RessourcesEnum.PIERRE]: 2500,
            [CraftEnum.LINGOT_CUIVRE]: 250,
            [CraftEnum.PLANCHE_CHATAIGNIER]: 150,
            [RessourcesEnum.KAMAS]: 15000
        },
        image: 'forge.png'
    },
}

export {BuildingEnum, Buildings, Building}

