import {CraftEnum, RessourcesEnum, SellEnum} from "./Enums";
import {QuestService} from "../../services/questService";
import {Ressources} from "./Ressource";
import {Crafts} from "./Craft";

interface QuestTemplate {
    name: string;
    description: string;
    requiredItems: Record<string, number>;
    rewardType: 'kamas' | 'happiness';
}

enum QuestEnum {
    MALADIE_CITE = "Maladie dans la cité",
    FAMINE_ASTRUB = "Famine à Astrub",
    BESOIN_MATERIAUX = "Besoin de matériaux",
    MENACE_MONSTRES = "Menace de monstres",
    FESTIVAL_ASTRUB = "Festival d'Astrub",
    REPARATION_BATIMENTS = "Réparation des bâtiments",
    EXPEDITION_MINIERE = "Expédition minière", //CHASSE_GIBIER = "Chasse au gibier",
    RECOLTE_PLANTES = "Récolte de plantes médicinales",
    APPROVISIONNEMENT_FORGE = "Approvisionnement de la forge",
    FOND_ORPHELINAT = "Des fonds pour l'orphelinat"
}

const QuestTemplates: Record<QuestEnum, QuestTemplate> = {
    [QuestEnum.MALADIE_CITE]: {
        name: QuestEnum.MALADIE_CITE,
        description: "Une maladie touche la cité d'Astrub, les habitants se cachent chez eux et accusent les rats qui apparaissent depuis peu dans les égoûts. Un prêtre ordonne leur mise à mort, tandis que les Eniripsas cherchent des aventuriers pour enquêter. En attendant, ils ont besoin de potions de soin.",
        requiredItems: {
            [CraftEnum.POTION_MINI_SOIN]: 50
        },
        rewardType: 'happiness',
    }, [QuestEnum.FAMINE_ASTRUB]: {
        name: QuestEnum.FAMINE_ASTRUB,
        description: "Un drame touche la ville d'Astrub : les récoltes ont été faibles et la grange principale a brûlé. Les habitants ont faim et les enfants mendient auprès des marchands venus d'ailleurs. Une cargaison arrive, mais en attendant, vous avez des bouches à nourrir !",
        requiredItems: {
            [CraftEnum.PAIN_INCARNAM]: 100
        },
        rewardType: 'happiness',
    }, [QuestEnum.BESOIN_MATERIAUX]: {
        name: QuestEnum.BESOIN_MATERIAUX,
        description: "Le village en pleine expansion et Perle la bâtisseuse fait face à des pénuries de matériaux. Elle promet un meilleur paiement que celui proposé au marché d'Astrub.",
        requiredItems: {
            [RessourcesEnum.FRENE]: 250,
            [RessourcesEnum.FER]: 250
        },
        rewardType: 'kamas',
    }, [QuestEnum.MENACE_MONSTRES]: {
        name: QuestEnum.MENACE_MONSTRES,
        description: "L'alerte est sonnée au village d'Astrub. De nombreux monstres se rapprochent de la cité. Les mercenaires s'arment et ordonnent aux habitants de rentrer chez eux. De nombreux volontaires se présentent pour défendre leurs foyers, mais ils vont avoir besoin d'équipement.",
        requiredItems: {
            [CraftEnum.EPEE_FER]: 3,
            [CraftEnum.BOUCLIER_BOIS]: 3
        },
        rewardType: 'kamas',
    }, [QuestEnum.FESTIVAL_ASTRUB]: {
        name: QuestEnum.FESTIVAL_ASTRUB,
        description: "Avec autant de catastrophe, les habitants d'Astrub ont besoin d'organiser une grande fête ! Sortez la bière, sortez la nourriture ! Les petits et les grands préparent dans la joie cette belle journée, en espérant qu'il y en aura pour tout le monde.",
        requiredItems: {
            [CraftEnum.BIERE_ASTRUB]: 25,
            [CraftEnum.SUCRE_ORGE]: 5,
            [CraftEnum.SANDWICH_AU_GOUJON]: 10,
            [CraftEnum.PAIN_ORTIES]: 10,
            [CraftEnum.GREUVETTE_HERBES]: 5,
            [CraftEnum.TRUITE_HERBES]: 5
        },
        rewardType: 'happiness',
    }, [QuestEnum.REPARATION_BATIMENTS]: {
        name: QuestEnum.REPARATION_BATIMENTS,
        description: "La dernière tempête a abîmé le toit de la milice du village. Perle a besoin de matériau d'urgence et de qualité. Pour la sécurité des habitants, les mercenaires mettent les moyens (et surtout pour éviter les fuites...).",
        requiredItems: {
            [CraftEnum.PLANCHE_FRENE]: 50,
            [CraftEnum.PLANCHE_CHATAIGNIER]: 10
        },
        rewardType: 'kamas',
    }, [QuestEnum.EXPEDITION_MINIERE]: {
        name: QuestEnum.EXPEDITION_MINIERE,
        description: "Les Enutrofs protestent ! Ils refusent d'aller miner tant qu'ils n'ont pas du pain et de la bière. L'un d'entre eux avance qu'il faut 48 Enutrofs pour creuser leur tunnel et qu'ils ne sont que 45.",
        requiredItems: {
            [CraftEnum.BIERE_ASTRUB]: 48,
            [CraftEnum.PAIN_INCARNAM]: 48
        },
        rewardType: 'kamas',
    }, /*
    [QuestEnum.CHASSE_GIBIER]: {
        name: QuestEnum.CHASSE_GIBIER,
        description: "",
        requiredItems: {
        //    [CraftEnum.ARC_BOIS]: 5,
        //    [CraftEnum.FLECHE]: 100
        },
        rewardType: 'happiness',
    },
    */
    [QuestEnum.RECOLTE_PLANTES]: {
        name: QuestEnum.RECOLTE_PLANTES,
        description: "Les Eniripsas s'embrouillent sur la place publique. Certains veulent que les efforts soient mis dans les poisons pour défendre le village, d'autres que la recherche sur les soins avance. Ce n'est pas votre problème, mais vous pouvez gagner quelques kamas en répondant aux deux.",
        requiredItems: {
            [RessourcesEnum.ORTIE]: 100, [RessourcesEnum.SAUGE]: 50
        },
        rewardType: 'happiness',
    }, [QuestEnum.APPROVISIONNEMENT_FORGE]: {
        name: QuestEnum.APPROVISIONNEMENT_FORGE,
        description: "Depuis peu, un maître forgeron a commencé à donner des cours à de jeunes apprentis et les stocks de minerais s'épuisent à une vitesse folle. Le marché ne se remplit pas assez vite, voici une occasion de revendre vos minerais...",
        requiredItems: {
            [RessourcesEnum.FER]: 150, [RessourcesEnum.CUIVRE]: 100
        },
        rewardType: 'kamas',
    }, [QuestEnum.FOND_ORPHELINAT]: {
        name: QuestEnum.FOND_ORPHELINAT,
        description: "Malheureusement, tous les aventuriers ne rentrent pas. Tous les mercenaires ne survivent pas et tous les malades ne guérissent pas. Un orphelinat a commencé à apparaître à Astrub et celui-ci a besoin de fonds.",
        requiredItems: {
            [RessourcesEnum.KAMAS]: 5000,
        },
        rewardType: 'happiness',
    }
};

export {QuestEnum, QuestTemplates, QuestTemplate};