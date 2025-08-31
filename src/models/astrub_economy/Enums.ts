enum ResourceEnum {
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

    // Ressources niveau 20
    NOYER = "Noyer",
    BRONZE = "Bronze",
    TREFLE_CINQ_FEUILLES = "Trèfle à cinq feuilles",
    AVOINE = "Avoine",
    CRABE_SOURIMI = "Crabe sourimi",
    POISSON_CHATON = "Poisson chaton",

    KAMAS = "Kamas",

    PIERRE = "Pierre",
    LAINE_DE_BOUFTOU = "Laine de bouftou",
    CUIR = "Cuir", 
    TISSU = "Tissu",
    OEUF = "Oeuf",
}

export {ResourceEnum};

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


    // Niveau 20
    PLANCHE_NOYER = "Planche noyer",
    LINGOT_BRONZE = "Lingot de bronze",
    POTION_SOIN = "Potion de soin",
    PAIN_FLOCONS_AVOINE = "Pain flocons d'avoine",
    BATON_CRABE = "Bâton de crabe",
    POISSON_CHATON_FUME = "Poisson chaton fumé",
    EBONITE = "Ébonite",
    ALUMINITE = "Aluminite",

    // Niveau 20 - Complexe
    TABLE_NOYER = "Table en noyer",
    SANDWICH_POISSON_CHATON = "Sandwich poisson chaton",
    POISSON_CHATON_HERBES = "Poisson chaton aux herbes",
    CRABE_SOURIMI_HERBES = "Crabe sourimi aux herbes",

    // OUTILS — Niveau 1 / 10 / 20 (simples)
    HACHE_FRENE = "Hache en frêne",
    HACHE_CHATAIGNIER = "Hache en châtaignier",
    HACHE_NOYER = "Hache en noyer",

    PIOCHE_FER = "Pioche en fer",
    PIOCHE_CUIVRE = "Pioche en cuivre",
    PIOCHE_BRONZE = "Pioche en bronze",

    SERPE_A_ORTIE = "Serpe à ortie",
    SERPE_A_SAUGE = "Serpe à sauge",
    SERPE_A_TREFLE = "Serpe à trèfle",

    FAUX_BLE = "Faux à blé",
    FAUX_ORGE = "Faux à orge",
    FAUX_AVOINE = "Faux à avoine",

    CANNE_GOUJON = "Canne à goujon",
    CANNE_GREUVETTE = "Canne à greuvette",
    CANNE_POISSON_CHATON = "Canne à poisson chaton",
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
    RESSOURCE_20 = 10,
}
enum XpEnum {
    RESSOURCE_1 = 1,
    RESSOURCE_10 = 2,
    RESSOURCE_20 = 3
}

enum LevelEnum {
    LEVEL_0 = 0,
    LEVEL_10 = 10,
    LEVEL_20 = 20,
}
export {SellEnum, XpEnum, LevelEnum};
