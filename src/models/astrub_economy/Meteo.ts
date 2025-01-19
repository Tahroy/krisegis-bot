import {JobEnum, RessourcesEnum} from "./Enums";

interface Meteo {
    name: string;
    description: string;
    effects: MeteoEffect[];
}

interface MeteoEffect {
    description: string;
    job: JobEnum;
    value: number;
}

enum MeteosEnum {
    PLUIE = "🌧️ Pluie",
    BRUME_EPAISSE = "🌫️ Brume épaisse",
    VENT_FORT = "💨 Vents forts",
    GEL = "❄️ Gel",
    CANICULE = "☀️ Canicule"
}

const Meteos: Record<MeteosEnum, Meteo> = {
    [MeteosEnum.PLUIE]: {
        name: MeteosEnum.PLUIE,
        description: "La pluie s'abat avec force sur Astrub et les enfants se réfugient chez eux. Les gouttes tombent en cadence, transformant les terres en un paysage fertile et vivant.",
        effects: [
            {
                description: "Les pluies abondantes enrichissent les rivières. Les pêcheurs, protégés des intempéries profitent de cette effervescence.",
                job: JobEnum.PECHEUR,
                value: 40
            },
            {
                description: "Dans la forêt, les arbres alourdis par l'humidité offrent un spectacle mélancolique. Les troncs glissants rendent chaque coup de hache plus laborieux et le transport du bois jusqu'au marché est rend plus pénible.",
                job: JobEnum.BUCHERON,
                value: -20
            },
            {
                description: "Dans les prairies et les bois, les plantes prospèrent et les alchimistes sont vêtus de leurs grands manteaux. La prolifération offre une cueillette abondante.",
                job: JobEnum.ALCHIMISTE,
                value: 30
            },
            {
                description: "Les mines souffrent d'infiltrations d'eau qui rendent les sols instables et les veines les plus riches sont innondées.",
                job: JobEnum.MINEUR,
                value: -20
            },
            {
                description: "Enfin, dans les champs au nord du marché, les paysans sourient sous leurs capes. Le blé profite de cette pluie bienveillante et s'élève dans le ciel. Une journée abondante s'offre à eux.",
                job: JobEnum.PAYSAN,
                value: 30
            },
        ]
    },
    [MeteosEnum.BRUME_EPAISSE]: {
        name: MeteosEnum.BRUME_EPAISSE,
        description: "Une épaisse nappe de brume enveloppe Astrub, plongeant les terres dans une ambiance silencieuse. Malgré ce climat, les récolteurs doivent continuer leurs activités.",
        effects: [
            {
                description: "La brume rend difficile la localisation des bancs de poissons pour les pêcheurs.",
                job: JobEnum.PECHEUR,
                value: -20
            },
            {
                description: "Les arbres se perdent dans le paysage embrumé. La coupe est rendue compliquée et les monstres rodent...",
                job: JobEnum.BUCHERON,
                value: -20
            },
            {
                description: "Dans l'humidité enveloppante, les plantes prolifèrent, au grand bonheur des alchimistes.",
                job: JobEnum.ALCHIMISTE,
                value: 30
            },
            {
                description: "L'air ambiant offre aux galeries un environnement frais et plus confortable pour les mineurs.",
                job: JobEnum.MINEUR,
                value: 40
            },
            {
                description: "Le microclimat offert par la brume favorise la croissance des céréales. Les paysans découvrent avec joie des champs verdoyants.",
                job: JobEnum.PAYSAN,
                value: 30
            },
        ]
    },
    [MeteosEnum.VENT_FORT]: {
        name: MeteosEnum.VENT_FORT,
        description: "Les rafales se déchainent sur Astrub, emportant tout sur leur passage. Ce Tumulte, certainement causé par une déesse malicieuse, complique le travail des récolteurs.",
        effects: [
            {
                description: "Les eaux sont agitées et effraient les poissons. Les cannes à pêche se brisent et les filets peinent à résister aux remous.",
                job: JobEnum.PECHEUR,
                value: -20
            },
            {
                description: "Les vents forts abattent les branches et les arbres. Malgré les dangers, les bûcherons peuvent récolter le bois sans effort.",
                job: JobEnum.BUCHERON,
                value: 40
            },
            {
                description: "Les rafales de vent emportent les plantes avec elles. Les alchimistes découvrent leurs coins préférés dépouillés.",
                job: JobEnum.ALCHIMISTE,
                value: -30
            },
            {
                description: "L'air s'infiltre dans les mines et améliore la ventilation. Les mineurs en profitent avec plaisir.",
                job: JobEnum.MINEUR,
                value: 40
            },
            {
                description: "Les champs souffrent des bourrasques de vent. Les épis de blé brisé tombent au sol et cassent avant la maturation.",
                job: JobEnum.PAYSAN,
                value: -30
            },
        ]
    },
    [MeteosEnum.GEL]: {
        name: MeteosEnum.GEL,
        description: "Une vague glaciale s'abat sur Astrub, transformant la région en un paysage figé. Le froid mordant détruit les récoltes et les habitants restent au chaud chez eux.",
        effects: [
            {
                description: "Les poissons se réfugient sous la glace, rendant leur capture particulièrement difficile.",
                job: JobEnum.PECHEUR,
                value: -20
            },
            {
                description: "Le gel durcit les troncs, rendant la coupe plus difficile. Cependant, les besoins d'Astrub augmentent pour chauffer les demeures et les bûcherons se mettent au travail.",
                job: JobEnum.BUCHERON,
                value: 40
            },
            {
                description: "Sous la glace et le givre, les plantes se font rares. Les alchimistes peinent à trouver des spécimens exploitables.",
                job: JobEnum.ALCHIMISTE,
                value: -40
            },
            {
                description: "Le gel rend les outils glissants et l'extraction plus compliquée. Les mineurs engourdis doivent faire des efforts supplémentaires.",
                job: JobEnum.MINEUR,
                value: -20
            },
            {
                description: "Le gel fragilise les cultures et les récoltes sont fortement compromises. Il faudra attendre le retour des beaux jours.",
                job: JobEnum.PAYSAN,
                value: -30
            },
        ]
    },
    [MeteosEnum.CANICULE]: {
        name: MeteosEnum.CANICULE,
        description: "Une chaleur étouffante s'installe sur Astrub, rendant l'air lourd et pesant.",
        effects: [
            {
                description: "L'eau surchauffée rend les poissons plus actifs. Équipés de leurs plus beaux chapeaux de paille, les pêcheurs s'en donnent à coeur joie !",
                job: JobEnum.PECHEUR,
                value: 40
            },
            {
                description: "La chaleur intense rend les efforts des bûcherons plus bien compliqués. Les pauses sont plus régulières et la récolte plus épuisante.",
                job: JobEnum.BUCHERON,
                value: -20
            },
            {
                description: "Les plantes se révèlent résistantes et prolifèrent sous la chaleur, offrant une cueillante abondante.",
                job: JobEnum.ALCHIMISTE,
                value: 30
            },
            {
                description: "La chaleur rend l'air des mines suffocant, ralentissant les efforts des mineurs.",
                job: JobEnum.MINEUR,
                value: -20
            },
            {
                description: "Les céréales profitent du soleil et les paysans se dépèchent de récolter avant que les épis ne se dessèchent.",
                job: JobEnum.PAYSAN,
                value: 20
            }
        ]
    }
}

export default Meteo;

export {MeteoEffect, MeteosEnum, Meteos};

