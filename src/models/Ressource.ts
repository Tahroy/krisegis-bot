import {JobEnum} from "./Job";

interface Ressource {
    name: string;   // Nom de l'objet/ressource
    sale: number;   // Prix de vente
    buy: number;    // Prix d'achat
    job: string;
    level: number;
}

export default Ressource;

enum RessourceEnum {
    FER = "Fer",
    FRENE = "Frêne",
    BLE = "Blé",
    ORTIE = "Ortie",
    GOUJON = "Goujon",
}

// Exemple d'utilisation
const Ressources: Record<RessourceEnum, Ressource> = {
    [RessourceEnum.BLE]: {name: RessourceEnum.BLE, job: JobEnum.PAYSAN, level: 1, sale: 2, buy: 5},
    [RessourceEnum.ORTIE]: {name: RessourceEnum.ORTIE, job: JobEnum.ALCHIMISTE, level: 1, sale: 2, buy: 5},
    [RessourceEnum.GOUJON]: {name: RessourceEnum.GOUJON, job: JobEnum.PECHEUR, level: 1, sale: 2, buy: 5},
    [RessourceEnum.FRENE]: {name: RessourceEnum.FRENE, job: JobEnum.BUCHERON, level: 1, sale: 2, buy: 5},
    [RessourceEnum.FER]: {name: RessourceEnum.FER, job: JobEnum.MINEUR, level: 1, sale: 2, buy: 5}
};


export {Ressources, RessourceEnum}