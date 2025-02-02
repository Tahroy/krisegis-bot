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
}

const Buildings: Record<BuildingEnum, Building> = {
    [BuildingEnum.SANCTUAIRE]: {
        name: BuildingEnum.SANCTUAIRE,
        description: "Petit sanctuaire fait de pierre et de bois disposé au centre du marché. Les habitants peuvent y déposer une offrande dans la coupe pour espérer que les Dix leur répondent.",
        recipe: {
            [RessourcesEnum.PIERRE]: 3500,
            [CraftEnum.PLANCHE]: 1000,
            [CraftEnum.BARRE_DE_FER]: 1000,
            [RessourcesEnum.KAMAS]: 10000
        },
        image: 'sanctuaire.png'
    },
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
        image: 'forge.png'
    }
}

export default Building

export {BuildingEnum, Buildings}

