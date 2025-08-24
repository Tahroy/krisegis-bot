import {CraftEnum, ResourceEnum} from "./Enums";
import {BuildingEnum} from "./Building";
import {MeteosEnum} from "./Meteo";

interface QuestTemplate {
    name: string;
    description: string;
    requiredItems: Record<string, number>;
    rewardType: 'kamas' | 'happiness';
    buildings?: BuildingEnum[];
    weather?: MeteosEnum[];
}

enum QuestEnum {
    MALADIE_CITE = "Pourquoi tu es tout vert ?",
    FAMINE_ASTRUB = "On a faim, on a faim !",
    BESOIN_MATERIAUX = "Il me faut deux clous et une planche",
    MENACE_MONSTRES = "Alerte ! Alerte !",
    FESTIVAL_ASTRUB = "Festival d'Astrub",
    REPARATION_BATIMENTS = "Il était là ce trou ?",
    MANIFESTATION_MINIERE = "On creuse le jour, on boit la nuit !",
    RECOLTE_PLANTES = "Tu as essayé cette plante ?",
    APPROVISIONNEMENT_FORGE = "Il y en a encore un qui s'est brûlé...",
    FOND_ORPHELINAT = "Personne ne pense aux enfants ?!",
    APPROVISIONNER_TAVERNE = "Il fait soif ici !",
    ENTRAINEMENT_MILICE = "J'ai pris une flèche dans le genou",
    POISSON_FRAIS = "Il n'est pas frais mon poisson ?!",
    CELEBRATION_SANCTUAIRE = "Célébration au sanctuaire",
    NOUVEAUX_AVENTURIERS = "Ils vont revenir vite",
    
    // Quêtes liées à la météo
    COLLECTE_EAU_PLUIE = "Moi je fais tout à l'eau de pluie",
    REPAS_CHAUD = "Ça fait du bien par où ça passe !",
    RAFRAICHISSEMENTS = "Une p'tite bière ?",
    LANTERNES_BRUME = "Michel t'es où ?... T'es là ?... Michel ?!",
    ABRIS_VENT = "Le mulou souffle fort aujourd'hui !",
    ENGELURES = "J'ai mal quand j'appuie sur mon coude ou sur ma tête",
    BOIS_POUR_FEU = "Une bonne cheminée et un bon livre",
}

const QuestTemplates: Record<QuestEnum, QuestTemplate> = {
    [QuestEnum.MALADIE_CITE]: {
        name: QuestEnum.MALADIE_CITE,
        description: "Une maladie touche la cité d'Astrub, les habitants se cachent chez eux et accusent les rats qui apparaissent depuis peu dans les égoûts. Un prêtre ordonne leur mise à mort, tandis que les Eniripsas cherchent des aventuriers pour enquêter. En attendant, ils ont besoin de potions de soin.",
        requiredItems: {[CraftEnum.POTION_MINI_SOIN]: 50},
        rewardType: 'happiness',
    }, [QuestEnum.FAMINE_ASTRUB]: {
        name: QuestEnum.FAMINE_ASTRUB,
        description: "Un drame touche la ville d'Astrub : les récoltes ont été faibles et la grange principale a brûlé. Les habitants ont faim et les enfants mendient auprès des marchands venus d'ailleurs. Une cargaison arrive, mais en attendant, vous avez des bouches à nourrir !",
        requiredItems: {[CraftEnum.PAIN_INCARNAM]: 100},
        rewardType: 'happiness',
    }, [QuestEnum.BESOIN_MATERIAUX]: {
        name: QuestEnum.BESOIN_MATERIAUX,
        description: "Le village en pleine expansion et Perle la bâtisseuse fait face à des pénuries de matériaux. Elle promet un meilleur paiement que celui proposé au marché d'Astrub.",
        requiredItems: {[ResourceEnum.FRENE]: 250, [ResourceEnum.FER]: 250},
        rewardType: 'kamas',
    }, [QuestEnum.MENACE_MONSTRES]: {
        name: QuestEnum.MENACE_MONSTRES,
        description: "L'alerte est sonnée au village d'Astrub. De nombreux monstres se rapprochent de la cité. Les mercenaires s'arment et ordonnent aux habitants de rentrer chez eux. De nombreux volontaires se présentent pour défendre leurs foyers, mais ils vont avoir besoin d'équipement.",
        requiredItems: {[CraftEnum.EPEE_BOISAILLE]: 3, [CraftEnum.BOUCLIER_BOIS]: 1},
        rewardType: 'kamas',
        buildings: [BuildingEnum.FORGE, BuildingEnum.MENUISERIE]
    }, [QuestEnum.FESTIVAL_ASTRUB]: {
        name: QuestEnum.FESTIVAL_ASTRUB,
        description: "Avec autant de catastrophe, les habitants d'Astrub ont besoin d'organiser une grande fête ! Sortez la bière, sortez la nourriture ! Les petits et les grands préparent dans la joie cette belle journée, en espérant qu'il y en aura pour tout le monde.",
        requiredItems: {
            [CraftEnum.BIERE_ASTRUB]: 20,
            [CraftEnum.SUCRE_ORGE]: 5,
            [CraftEnum.SANDWICH_AU_GOUJON]: 5,
            [CraftEnum.PAIN_ORTIES]: 5,
            [CraftEnum.PATE_GREUVETTES]: 5,
            [CraftEnum.TRUITE_HERBES]: 5
        },
        rewardType: 'happiness',
    }, [QuestEnum.REPARATION_BATIMENTS]: {
        name: QuestEnum.REPARATION_BATIMENTS,
        description: "La dernière tempête a abîmé le toit de la milice du village. Perle a besoin de matériau d'urgence et de qualité. Pour la sécurité des habitants, les mercenaires mettent les moyens (et surtout pour éviter les fuites...).",
        requiredItems: {[CraftEnum.PLANCHE_FRENE]: 50, [CraftEnum.PLANCHE_CHATAIGNIER]: 10},
        rewardType: 'kamas',
    }, [QuestEnum.MANIFESTATION_MINIERE]: {
        name: QuestEnum.MANIFESTATION_MINIERE,
        description: "Les Enutrofs protestent ! Ils refusent d'aller miner tant qu'ils n'ont pas du pain et de la bière. L'un d'entre eux avance qu'il faut 48 Enutrofs pour creuser leur tunnel et qu'ils ne sont que 45.",
        requiredItems: {[CraftEnum.BIERE_ASTRUB]: 48, [CraftEnum.PAIN_INCARNAM]: 48},
        rewardType: 'kamas',
    },
    [QuestEnum.RECOLTE_PLANTES]: {
        name: QuestEnum.RECOLTE_PLANTES,
        description: "Les Eniripsas s'embrouillent sur la place publique. Certains veulent que les efforts soient mis dans les poisons pour défendre le village, d'autres que la recherche sur les soins avance. Ce n'est pas votre problème, mais vous pouvez gagner quelques kamas en répondant aux deux.",
        requiredItems: {[ResourceEnum.ORTIE]: 100, [ResourceEnum.SAUGE]: 50},
        rewardType: 'happiness',
    }, [QuestEnum.APPROVISIONNEMENT_FORGE]: {
        name: QuestEnum.APPROVISIONNEMENT_FORGE,
        description: "Depuis peu, un maître forgeron a commencé à donner des cours à de jeunes apprentis et les stocks de minerais s'épuisent à une vitesse folle. Le marché ne se remplit pas assez vite, voici une occasion de revendre vos minerais...",
        requiredItems: {[ResourceEnum.FER]: 150, [ResourceEnum.CUIVRE]: 100},
        rewardType: 'kamas',
        buildings: [BuildingEnum.FORGE]
    }, [QuestEnum.FOND_ORPHELINAT]: {
        name: QuestEnum.FOND_ORPHELINAT,
        description: "La gérante de l'orphelinat dépose une note au centre du village. Les caisses sont presque vides, les enfants ont besoin de vêtements, de draps, de repas chauds et de nouvelles bougies. Elle appelle à la charité de chacun.",
        requiredItems: {[ResourceEnum.KAMAS]: 5000,},
        rewardType: 'happiness',
        buildings: [BuildingEnum.ORPHELINAT]
    }, [QuestEnum.APPROVISIONNER_TAVERNE]: {
        name: QuestEnum.APPROVISIONNER_TAVERNE,
        description: "Un groupe de mercenaires a passé la soirée à la taverne hier soir. Le tavernier a besoin de provisions d'urgence et il est prêt à payer le prix fort !",
        requiredItems: {[CraftEnum.BIERE_ASTRUB]: 30, [CraftEnum.PAIN_SAUGE]: 15},
        rewardType: 'kamas',
        buildings: [BuildingEnum.BRASSERIE, BuildingEnum.TAVERNE]
    }, [QuestEnum.ENTRAINEMENT_MILICE]: {
        name: QuestEnum.ENTRAINEMENT_MILICE,
        description: "La nouvelle milice du village forme de jeunes recrues. Les mercenaires ont tendance à se blesser ou à se perdre dans les bois aux alentours. Ils auraient bien besoin de repas et de potions de soin.",
        requiredItems: {[CraftEnum.SANDWICH_AU_GOUJON]: 20, [CraftEnum.POTION_MINI_SOIN]: 20},
        rewardType: 'happiness',
        buildings: [BuildingEnum.MILICE]
    },
    [QuestEnum.POISSON_FRAIS]: {
        name: QuestEnum.POISSON_FRAIS,
        description: "« Les mouches, c'est offert. » Le poissonnier d'Astrub n'a pas toujours le poisson le plus frais des environs. Le Conseil d'Astrub offre un supplément si vous renouvelez son stock avec une meilleure qualité.",
        requiredItems: {
            [ResourceEnum.GOUJON]: 100,
            [ResourceEnum.TRUITE]: 50,
            [ResourceEnum.GREUVETTE]: 50
        },
        rewardType: 'kamas'
    },
    [QuestEnum.CELEBRATION_SANCTUAIRE]: {
        name: QuestEnum.CELEBRATION_SANCTUAIRE,
        description: "Les prêtres organisent une cérémonie en hommage aux dieux. Ils souhaitent que les paysans, alchimistes et pêcheurs proposent une offrande pour obtenir la bénédiction des Dix.",
        requiredItems: {
            [ResourceEnum.BLE]: 150,
            [ResourceEnum.ORTIE]: 150,
            [ResourceEnum.GOUJON]: 150,
        },
        rewardType: 'happiness',
        buildings: [BuildingEnum.SANCTUAIRE]
    },
    [QuestEnum.NOUVEAUX_AVENTURIERS]: {
        name: QuestEnum.NOUVEAUX_AVENTURIERS,
        description: "De jeunes habitants d'Astrub ont décidé de partir à l'aventure. Ils pensent que le Monde des Dix doit être exploré. Leurs parents sont certains qu'ils reviendront vite et demandent des potions pour eux.",
        requiredItems: {[CraftEnum.POTION_MINI_SOIN]: 50, [CraftEnum.POTION_RAPPEL]: 10},
        rewardType: 'kamas'
    },
    [QuestEnum.COLLECTE_EAU_PLUIE]: {
        name: QuestEnum.COLLECTE_EAU_PLUIE,
        description: "La pluie tombe sans interruption sur Astrub. Le Conseil des Dix a décidé de renforcer le système de récupération d'eau, afin de palier aux périodes de sécheresse.",
        requiredItems: {
            [CraftEnum.PLANCHE_FRENE]: 30,
            [CraftEnum.LINGOT_CUIVRE]: 5
        },
        rewardType: 'kamas',
        buildings: [BuildingEnum.FORGE],
        weather: [MeteosEnum.PLUIE]
    },
    [QuestEnum.REPAS_CHAUD]: {
        name: QuestEnum.REPAS_CHAUD,
        description: "Le froid entre dans les vêtements et les maisons d'Astrub. Les récolteurs ont du mal à travailler dans ces conditions et un repas chaud leur ferait le plus grand bien.",
        requiredItems: {
            [CraftEnum.PAIN_INCARNAM]: 40,
            [CraftEnum.GOUJON_EN_TRANCHE]: 40
        },
        rewardType: 'happiness',
        weather: [MeteosEnum.GEL]
    },
    [QuestEnum.ENGELURES]: {
        name: QuestEnum.ENGELURES,
        description: "Le gel est violent aujourd'hui et les récolteurs d'Astrub se bousculent chez le médecin du village pour guérir et prévenir des engelures. Il risque de manquer de potions de soin...",
        requiredItems: {[CraftEnum.POTION_MINI_SOIN]: 50},
        rewardType: 'kamas',
        weather: [MeteosEnum.GEL]
    },
    [QuestEnum.BOIS_POUR_FEU]: {
        name: QuestEnum.BOIS_POUR_FEU,
        description: "Les cheminées fument à Astrub aujourd'hui. Tous les habitants brûlent ce qu'ils peuvent pour se protéger du froid et espérer avoir une belle journée en intérieur. Ils auraient bien besoin de bois supplémentaire.",
        requiredItems: {
            [ResourceEnum.FRENE]: 150,
            [ResourceEnum.CHATAIGNIER]: 100
        },
        rewardType: 'happiness',
        weather: [MeteosEnum.GEL]
    },
    [QuestEnum.RAFRAICHISSEMENTS]: {
        name: QuestEnum.RAFRAICHISSEMENTS,
        description: "La chaleur est forte à Astrub et les habitants se rejoignent près du lac. Le tavernier a ouvert une terrasse près de l'eau où tout le monde vient chercher un peu de fraîcheur. Il aurait bien besoin de provisions pour tenir tous ces Diziens.",
        requiredItems: {[CraftEnum.BIERE_ASTRUB]: 25,},
        rewardType: 'kamas',
        buildings: [BuildingEnum.TAVERNE, BuildingEnum.BRASSERIE],
        weather: [MeteosEnum.CANICULE]
    },
    [QuestEnum.LANTERNES_BRUME]: {
        name: QuestEnum.LANTERNES_BRUME,
        description: "BONK ! Un milicien s'est encore pris la tête dans un mur. C'est qu'on n'y voit rien du tout aujourd'hui ! La milice achète d'urgence des lanterne pour aider ses hommes.",
        requiredItems: {[CraftEnum.LANTERNE]: 10},
        rewardType: 'kamas',
        buildings: [BuildingEnum.FORGE],
        weather: [MeteosEnum.BRUME_EPAISSE]
    },
    [QuestEnum.ABRIS_VENT]: {
        name: QuestEnum.ABRIS_VENT,
        description: "Les vents violents ont détruit certaines habitations et les habitants d'Astrub préparent la reconstruction. Ils en appellent à la charité des récolteurs du village.",
        requiredItems: {
            [CraftEnum.PLANCHE_FRENE]: 50,
            [CraftEnum.PLANCHE_CHATAIGNIER]: 10,
            [ResourceEnum.PIERRE]: 50
        },
        rewardType: 'happiness',
        buildings: [BuildingEnum.MENUISERIE],
        weather: [MeteosEnum.VENT_FORT]
    }
};

export {QuestEnum, QuestTemplates, QuestTemplate};
