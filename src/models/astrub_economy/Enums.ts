enum RessourcesEnum {
    BLE = "Blé",
    FER = "Fer",
    FRENE = "Frêne",
    GOUJON = "Goujon",
    ORTIE = "Ortie",

    // Ressoures niveau 10
    CHATAIGNIER = "Châtaignier",
    CUIVRE = "Cuivre",
    SAUGE = "Sauge",
    ORGE = "Orge",
    GREUVETTE = "Greuvette",
    TRUITE = "Truite",

    KAMAS = "Kamas",

    PIERRE = "Pierre",
    LAINE_DE_BOUFTOU = "Laine de bouftou",
    CUIR = "Cuir", 
    TISSU = "Tissu",
    OEUF = "Oeuf",
}

export {RessourcesEnum};

enum CraftEnum {
    ATELIER_A_POISSON = "Atelier à poisson",
    FOUR_A_PAIN = "Four à pain",
    MARMITE = "Marmite",

    // Niveau 1
    SUCRE_ORGE = "Sucre d'orge",
    PAIN_INCARNAM = "Pain d’Incarnam",
    POTION_MINI_SOIN = "Potion de mini soin",
    GOUJON_EN_TRANCHE = "Goujon en tranche",
    PLANCHE_FRENE = "Planche frêne",
    LINGOT_FER = "Lingot de fer",

    // Niveau 1 - Complexes
    GOUJON_ORTIES = "Goujon aux orties",
    PAIN_ORTIES = "Pain aux orties",
    SANDWICH_AU_GOUJON = "Sandwich au goujon",

    // Niveau 10
    PLANCHE_CHATAIGNIER = "Planche châtaignier",
    LINGOT_CUIVRE = "Lingot de cuivre",
    POTION_RAPPEL = "Potion de rappel",
    FOUGASSE = "Fougasse",
    BEIGNET_GREUVETTE = "Beignet greuvette",
    TRUITE_EN_TRANCHE = "Truite en tranche",

    // Niveau 10 - Complexe
    BIERE_ASTRUB = "Bière d'Astrub",
    TRUITE_HERBES = "Truite aux herbes",
    PAIN_SAUGE = "Pain à la sauge",
    PATE_GREUVETTES = "Pâté de greuvettes",
    TALISMAN_CUIVRE = "Talisman en cuivre",
    BOUCLIER_BOIS = "Bouclier châtaignier",
    EPEE_BOISAILLE = "Épée de boisaille",
    LANTERNE = "Lanterne",

}

export {CraftEnum};

enum JobEnum {
    ALCHIMISTE = "Alchimiste",
    BUCHERON = "Bûcheron",
    MINEUR = "Mineur",
    PAYSAN = "Paysan",
    PECHEUR = 'Pêcheur',
}

export {JobEnum};

enum SellEnum {
    RESSOURCE_1= 2,
    RESSOURCE_10 = 6,
}

enum BuyEnum {
    RESSOURCE_1 = 5,
    RESSOURCE_10 = 15,
}

enum XpEnum {
    RESSOURCE_1 = 1,
    RESSOURCE_10 = 2
}

enum MultiplicatorEnum {
    SIMPLE_CRAFT = 1.1,
    COMPLEXE_CRAFT = 1.2
}
export {SellEnum, BuyEnum, MultiplicatorEnum, XpEnum}
