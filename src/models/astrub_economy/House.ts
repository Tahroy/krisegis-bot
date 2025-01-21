import {RessourcesEnum} from "./Enums";

class House {
    public type!: string
    public levels!: {}[]
}

export default House

enum HousesEnum {
    ASTRUB = 'Astrub',
    AMAKNA = 'Amakna',
}

const Houses: Record<HousesEnum, House> = {
    [HousesEnum.ASTRUB]: {
        type: HousesEnum.ASTRUB,
        levels: [
            {
                [RessourcesEnum.FRENE]: 500,
                [RessourcesEnum.FER]: 500,
                [RessourcesEnum.KAMAS]: 1000
            },
        ]
    },
    [HousesEnum.AMAKNA]: {
        type: HousesEnum.AMAKNA,
        levels: [
            {
                [RessourcesEnum.FRENE]: 750,
                [RessourcesEnum.FER]: 250,
                [RessourcesEnum.KAMAS]: 2000
            },
        ]
    },
}

export {Houses, HousesEnum}