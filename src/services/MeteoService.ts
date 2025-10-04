import Meteo, {Meteos} from "../models/astrub_economy/Meteo";
import WeatherGuild from "../models/astrub_economy/WeatherGuild";
import KrisegisClient from "../models/KrisegisClient";
import JobUtil from "./JobUtil";

export class MeteoService {
    public static async updateMeteo(guildId: string) {
        const meteos = Object.values(Meteos);

        // On trie les météos disponibles pour le mois courant
        const now = new Date();
        const meteosDisponibles = meteos.filter(m => m.isAvailableFor(now));

        // Si aucune météo n'est disponible selon les périodes, on retombe sur toutes (fallback)
        const pool = meteosDisponibles.length > 0 ? meteosDisponibles : meteos;

        let randomMeteo = pool[Math.floor(Math.random() * pool.length)];

        const currentWeather = await WeatherGuild.findOne({where: {guildId}});

        // Si c'est la même météo, on relance UNE fois depuis le même pool
        if (currentWeather && currentWeather.name === randomMeteo.name) {
            randomMeteo = pool[Math.floor(Math.random() * pool.length)];
        }

        await MeteoService.sauvegarderMeteo(randomMeteo, guildId);
    }

    private static async sauvegarderMeteo(meteo: Meteo, guildId: string) {
        await WeatherGuild.upsert({
            guildId: guildId, name: meteo.name, lastUpdate: new Date()
        });
    }

    public static async chargerMeteo(guildId: string): Promise<string | null> {
        const weather = await WeatherGuild.findOne({where: {guildId}});
        return weather ? weather.name : null;
    }

    public static async annoncerMeteo(client: KrisegisClient, guildId: string) {

        const meteoName = await MeteoService.chargerMeteo(guildId);
        const meteo = Object.values(Meteos).find(r => r.name === meteoName) ?? null

        if (!meteo) {
            return
        }

        const channel = JobUtil.getChannel(client, guildId);

        if (channel && channel.isTextBased()) {
            await channel.send({content: meteo.getText()});
        }
    }

}
