import {ResourceEnum} from "./Enums";

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
                [ResourceEnum.FRENE]: 500,
                [ResourceEnum.FER]: 500,
                [ResourceEnum.KAMAS]: 1000
            },
        ]
    },
    [HousesEnum.AMAKNA]: {
        type: HousesEnum.AMAKNA,
        levels: [
            {
                [ResourceEnum.FRENE]: 750,
                [ResourceEnum.FER]: 250,
                [ResourceEnum.KAMAS]: 2000
            },
        ]
    },
}

export {Houses, HousesEnum}