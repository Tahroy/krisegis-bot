import Meteo, {Meteos} from "../models/astrub_economy/Meteo";
import WeatherGuild from "../models/astrub_economy/WeatherGuild";
import KrisegisClient from "../models/KrisegisClient";
import JobUtil from "./JobUtil";

export class MeteoService {
    public static async updateMeteo(guildId: string) {
        const meteos = Object.values(Meteos);

        // On trie les météos pour avoir seulement celles avec active à true
        const meteosActive = meteos.filter(m => m.active);

        let randomMeteo = meteosActive[Math.floor(Math.random() * meteosActive.length)];

        const currentWeather = await WeatherGuild.findOne({where: {guildId}});

        // Si c'est la même météo, on relance UNE fois
        if (currentWeather && currentWeather.name === randomMeteo.name) {
            randomMeteo = meteosActive[Math.floor(Math.random() * meteosActive.length)];
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
