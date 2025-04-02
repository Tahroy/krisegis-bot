import Ressource, {Ressources} from "../../models/astrub_economy/Ressource";
import Tool, {Tools} from "../../models/astrub_economy/Tool";
import BaseItem, {Items} from "../../models/astrub_economy/BaseItem";
import {Crafts} from "../../models/astrub_economy/Craft";
import {Client, Guild, User} from "discord.js";
import Player from "../../models/astrub_economy/Player";
import Meteo, {Meteos} from "../../models/astrub_economy/Meteo";
import cron from 'node-cron';
import KrisegisClient from "../../models/KrisegisClient";
import BuildingGuild from "../../models/astrub_economy/BuildingGuild";
import Building, {Buildings} from "../../models/astrub_economy/Building";
import WeatherGuild from "../../models/astrub_economy/WeatherGuild";

class JobUtil {
    static getLevelFromXP(currentXP: number, baseXP: number = 10): number {
        // Initialisation des variables
        let level = 0;
        let xpForNextLevel = baseXP;

        // Boucle pour trouver le niveau en fonction de l'XP actuelle
        while (currentXP >= xpForNextLevel) {
            currentXP -= xpForNextLevel; // On retire l'XP requise pour le niveau actuel
            level++; // Augmente le niveau
            xpForNextLevel = baseXP * (level + 1) ** 2; // Calcule l'XP requise pour le prochain niveau
        }

        return level;
    }

    static isLessThanXMinutesAgo(date: Date, minutes: number): boolean {
        return (Date.now() - date.getTime()) < minutes * 60 * 1000;
    }

    static getTimeBeforeNextHarvest(lastHarvest: Date, minutes: number): number {
        const nextHarvest = new Date(lastHarvest.getTime() + minutes * 60 * 1000);
        return Math.floor((nextHarvest.getTime() - Date.now()));
    }

    static getLevelAndRemainingXP(currentXP: number, baseXP: number = 10): { level: number, remainingXP: number } {
        const level = this.getLevelFromXP(currentXP, baseXP);
        const remainingXP = baseXP * (level + 1) ** 2 - currentXP;
        return {level, remainingXP};
    }

    static getRessource(ressource: string): Ressource | null {
        return Object.values(Ressources).find(r => r.name === ressource) ?? null
    }

    static getTool(tool: string): Tool | null {
        return Object.values(Tools).find(t => t.name === tool) ?? null
    }

    static getCraft(craft: string): BaseItem | null {
        return Object.values(Crafts).find(c => c.name === craft) ?? null
    }

    static getItem(name: string): BaseItem | undefined {
        return Object.values({...Ressources, ...Tools, ...Crafts}).find(item => item.name === name);
    }

    static getAllItems(): BaseItem[] {
        const items: BaseItem[] = [];
        for (const category of Object.values(Items)) {
            items.push(...Object.values(category));
        }
        return items;
    }

    static async getPlayer(user: User, guildId: string): Promise<Player> {
        let player = await Player.findOne({
            where: {
                userId: user.id,
                guildId: guildId
            }
        })

        if (player) {
            return player;
        }

        return await Player.create({userId: user.id, guildId: guildId})
    }


    static async getEmoji(item: BaseItem, client: Client): Promise<string> {
        if (!item.emoji) {
            return '';
        }

        if (!client.application) {
            return '';
        }


        const clientApplicationEmojis = await client.application.emojis.fetch()

        const searchEmoji = clientApplicationEmojis.find(emoji => emoji.name === item.emoji)

        if (!searchEmoji) {
            return '';
        }
        return `<:${searchEmoji.name}:${searchEmoji.id}>`

    }

    static async updateMeteo(guildId: string) {
        const meteos = Object.values(Meteos);
        let randomMeteo = meteos[Math.floor(Math.random() * meteos.length)];

        const currentWeather = await WeatherGuild.findOne({ where: { guildId } });

        // Si c'est la même météo, on relance UNE fois
        if (currentWeather && currentWeather.name === randomMeteo.name) {
            randomMeteo = meteos[Math.floor(Math.random() * meteos.length)];
        }

        await JobUtil.sauvegarderMeteo(randomMeteo, guildId);
    }

    static async sauvegarderMeteo(meteo: Meteo, guildId: string) {
        await WeatherGuild.upsert({
            guildId: guildId,
            name: meteo.name,
            lastUpdate: new Date()
        });
    }

    static async chargerMeteo(guildId: string): Promise<string | null> {
        const weather = await WeatherGuild.findOne({ where: { guildId } });
        return weather ? weather.name : null;
    }


    async startReminder(client: KrisegisClient) {
        // Définir la tâche à exécuter chaque jour à 10h
        cron.schedule('0 10 * * *', async () => {
            for (const guild of client.guilds.cache.values()) {
                await JobUtil.updateMeteo(guild.id);
                await JobUtil.annoncerMeteo(client, guild.id)
            }
        });
    }

    static async getBuildingsGuild(guild: Guild | null): Promise<string[]> {
        if (!guild) {
            return []
        }

        const builds = await BuildingGuild.findAll({
            where: {status: "completed", guildId: guild.id}
        })

        const retour = [];

        for (const build of builds) {
            retour.push(build.name);
        }

        return retour;
    }

    static getBuilding(value: string) {
        return Object.values(Buildings).find(r => r.name === value) ?? null
    }

    static getEmptyRecipe(building: Building): Record<string, number> {
        const resetValues = (obj: Record<string, number>): Record<string, number> => {
            const newObj: Record<string, number> = {};
            for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    newObj[key] = 0;
                }
            }
            return newObj;
        };

        return resetValues(building.recipe)
    }

    public static async annoncerMeteo(client: KrisegisClient, guildId: string) {

        const meteoName = await JobUtil.chargerMeteo(guildId);
        const meteo = Object.values(Meteos).find(r => r.name === meteoName) ?? null

        if (!meteo) {
            return
        }

        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            return;
        }

        const channel = guild.channels.cache.find(channel => channel.name === 'Astrub Économie');

        if (channel && channel.isTextBased()) {
            await channel.send({content: meteo.getText()});
        }
    }
}

export default JobUtil;