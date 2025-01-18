import Ressource from "./Ressource";
import {RessourcesEnum} from "./Enums";

/*
Voici un résumé des effets par événement météo pour chaque ressource, avec un total de +20% pour chacune et un bonus/malus compris entre -30% et +30% :
Pluie

    Goujon : L'eau trouble rend la pêche plus difficile. → -20%
    Frêne : Le bois devient humide, rendant la coupe plus difficile. → -30%
    Orties : L'humidité favorise une croissance dense. → +30%
    Fer : L'humidité facilite l'extraction. → +25%
    Blé : La pluie favorise une meilleure croissance. → +30%

Sécheresse

    Goujon : Les poissons sont concentrés, facilitant la capture. → +30%
    Frêne : Le bois sec est plus facile à couper. → +30%
    Orties : Les orties se dessèchent rapidement. → -30%
    Fer : Les mines sont plus accessibles. → +20%
    Blé : La sécheresse ralentit la croissance du blé. → -30%

Vent fort

    Goujon : Les eaux agitées compliquent la pêche. → -30%
    Frêne : Les branches tombent naturellement à cause des vents. → +20%
    Orties : Les orties sont dispersées par le vent. → -20%
    Fer : Une meilleure ventilation rend l'extraction plus efficace. → +30%
    Blé : Le vent abîme les épis de blé. → -25%

Gel

    Goujon : Les poissons se réfugient sous la glace. → -10%
    Frêne : Le bois devient cassant, facilitant la coupe. → +30%
    Orties : Le gel ralentit leur croissance. → -10%
    Fer : Le gel stabilise les sols d'extraction. → +5%
    Blé : Le gel détruit les cultures de blé. → -30%

Canicule

    Goujon : L'eau plus chaude stimule l'activité des poissons. → +30%
    Frêne : La chaleur excessive fragilise les arbres. → -30%
    Orties : La chaleur stimule leur prolifération. → +30%
    Fer : La chaleur rend l'extraction plus fatigante. → -5%
    Blé : La chaleur accélère la maturation du blé. → +30%
 */
interface Meteo {
    name: string;
    effects: MeteoEffect[];
}

interface MeteoEffect {
    description: string;
    ressource: RessourcesEnum;
    value: number;
}

enum MeteoEnum {
    PLUIE = "Pluie",
    SECHERESSE = "Sécheresse",
    VENT_FORT = "Vent fort",
    GEL = "Gel",
    CANICULE = "Canicule"
}

const Meteos: Record<MeteoEnum, Meteo> = {
    [MeteoEnum.PLUIE]: {
        name: MeteoEnum.PLUIE,
        effects: [
            {
                description: "L'eau trouble rend la pêche plus difficile.",
                ressource: RessourcesEnum.GOUJON,
                value: -10
            },
            {
                description: "Le bois devient humide, rendant la coupe plus difficile.",
                ressource: RessourcesEnum.FRENE,
                value: -30
            },
            {
                description: "L'humidité favorise une croissance dense.",
                ressource: RessourcesEnum.ORTIE,
                value: 30
            },
            {
                description: "L'humidité facilite l'extraction.",
                ressource: RessourcesEnum.FER,
                value: 25
            },
            {
                description: "La pluie favorise une meilleure croissance.",
                ressource: RessourcesEnum.BLE,
                value: 40
            },
        ]
    },
    [MeteoEnum.SECHERESSE]: {
        name: MeteoEnum.SECHERESSE, effects: [
            {
                description: "Les poissons sont concentrés, facilitant la capture.",
                ressource: RessourcesEnum.GOUJON,
                value: 30
            },
            {
                description: "Le bois sec est plus facile à couper.",
                ressource: RessourcesEnum.FRENE,
                value: 30
            },
            {
                description: "Les orties se dessèchent rapidement.",
                ressource: RessourcesEnum.ORTIE,
                value: -20
            },
            {
                description: "Les mines sont plus accessibles.",
                ressource: RessourcesEnum.FER,
                value: 10
            },
            {
                description: "La sécheresse ralentit la croissance du blé.",
                ressource: RessourcesEnum.BLE,
                value: -10
            },
        ]
    },
    [MeteoEnum.VENT_FORT]: {
        name: MeteoEnum.VENT_FORT, effects: [
            {
                description: "Les eaux agitées compliquent la pêche.",
                ressource: RessourcesEnum.GOUJON,
                value: -20
            },
            {
                description: "Les branches tombent naturellement à cause des vents.",
                ressource: RessourcesEnum.FRENE,
                value: 20
            },
            {
                description: "Les orties sont dispersées par le vent.",
                ressource: RessourcesEnum.ORTIE,
                value: -10
            },
            {
                description: "Une meilleure ventilation rend l'extraction plus efficace.",
                ressource: RessourcesEnum.FER,
                value: 25
            },
            {
                description: "Le vent abîme les épis de blé.",
                ressource: RessourcesEnum.BLE,
                value: -25
            },
        ]
    },
    [MeteoEnum.GEL]: {
        name: MeteoEnum.GEL, effects: [
            {
                description: "Les poissons se réfugient sous la glace.",
                ressource: RessourcesEnum.GOUJON,
                value: -10
            },
            {
                description: "Le bois devient cassant, facilitant la coupe.",
                ressource: RessourcesEnum.FRENE,
                value: 30
            },
            {
                description: "Le gel ralentit leur croissance.",
                ressource: RessourcesEnum.ORTIE,
                value: -10
            },
            {
                description: "Le gel stabilise les sols d'extraction.",
                ressource: RessourcesEnum.FER,
                value: 10
            },
            {
                description: "Le gel détruit les cultures de blé.",
                ressource: RessourcesEnum.BLE,
                value: -30
            },
        ]
    },
    [MeteoEnum.CANICULE]: {
        name: MeteoEnum.CANICULE, effects: [
            {
                description: "L'eau plus chaude stimule l'activité des poissons.",
                ressource: RessourcesEnum.GOUJON,
                value: 20
            },
            {
                description: "La chaleur excessive fragilise les arbres.",
                ressource: RessourcesEnum.FRENE,
                value: -30
            },
            {
                description: "La chaleur stimule leur prolifération.",
                ressource: RessourcesEnum.ORTIE,
                value: 30
            },
            {
                description: "La chaleur rend l'extraction plus fatigante.",
                ressource: RessourcesEnum.FER,
                value: -50
            },
            {
                description: "La chaleur accélère la maturation du blé.",
                ressource: RessourcesEnum.BLE,
                value: 30
            }
        ]
    }
}

export default Meteo;

export {MeteoEffect};

