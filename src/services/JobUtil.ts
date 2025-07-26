import Ressource, {Ressources} from "../models/astrub_economy/Ressource";
import BaseItem, {Items} from "../models/astrub_economy/BaseItem";
import {Crafts} from "../models/astrub_economy/Craft";
import {Client, Guild, User} from "discord.js";
import Player from "../models/astrub_economy/Player";
import Meteo, {Meteos} from "../models/astrub_economy/Meteo";
import cron from 'node-cron';
import Tool, {Tools} from "../models/astrub_economy/Tool";
import WeatherGuild from "../models/astrub_economy/WeatherGuild";
import {PopulationService} from "./populationService";
import KrisegisClient from "../models/KrisegisClient";
import BuildingGuild from "../models/astrub_economy/BuildingGuild";
import {Building, Buildings} from "../models/astrub_economy/Building";
import {QuestService} from "./questService";
import {CraftEnum, RessourcesEnum} from "../models/astrub_economy/Enums";
import {Op} from "sequelize";

class JobUtil {
    static getLevelFromXP(currentXP: number, baseXP: number = 10): number {
        let level = 0;
        let xpForNextLevel = baseXP;

        // On recalcule chaque niveau !
        while (currentXP >= xpForNextLevel) {
            currentXP -= xpForNextLevel;
            level++;
            xpForNextLevel = baseXP * (level + 1) ** 2;
        }

        return level;
    }

    /**
     * Calcule le niveau et l'XP restante pour passer au niveau suivant à partir de l'XP totale
     */
    static getLevelAndRemainingXP(currentXP: number, baseXP: number = 10): { level: number, remainingXP: number } {
        const level = this.getLevelFromXP(currentXP, baseXP);

        let xpForCurrentLevel = 0;
        for (let i = 1; i <= level; i++) {
            xpForCurrentLevel += baseXP * i ** 2;
        }

        const remainingXP = baseXP * (level + 1) ** 2 - (currentXP - xpForCurrentLevel);

        return {level, remainingXP};
    }

    /**
     * Calcule l'XP déjà obtenue sur le niveau actuel et l'XP totale nécessaire pour le niveau suivant
     */
    static getCurrentLevelXP(totalXP: number, baseXP: number = 10): { currentLevelXP: number, nextLevelXP: number} {
        const level = this.getLevelFromXP(totalXP, baseXP);

        let xpForCurrentLevel = 0;
        for (let i = 1; i <= level; i++) {
            xpForCurrentLevel += baseXP * i ** 2;
        }

        const currentLevelXP = totalXP - xpForCurrentLevel;
        const nextLevelXP = baseXP * (level + 1) ** 2;

        return {currentLevelXP, nextLevelXP};
    }


    static isLessThanXMinutesAgo(date: Date, minutes: number): boolean {
        return (Date.now() - date.getTime()) < minutes * 60 * 1000;
    }

    static getTimeBeforeNextHarvest(lastHarvest: Date, minutes: number): number {
        const nextHarvest = new Date(lastHarvest.getTime() + minutes * 60 * 1000);
        return Math.floor((nextHarvest.getTime() - Date.now()));
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

        // On trie les météos pour avoir seulement celles avec active à true
        const meteosActive = meteos.filter(m => m.active);

        let randomMeteo = meteosActive[Math.floor(Math.random() * meteosActive.length)];

        const currentWeather = await WeatherGuild.findOne({ where: { guildId } });

        // Si c'est la même météo, on relance UNE fois
        if (currentWeather && currentWeather.name === randomMeteo.name) {
            randomMeteo = meteosActive[Math.floor(Math.random() * meteosActive.length)];
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

    /**
     * Génère une nouvelle quête pour un serveur et l'annonce
     */
    static async generateAndAnnounceQuest(client: KrisegisClient, guildId: string): Promise<void> {
        await QuestService.deleteOldQuests(client, guildId);

        // Une chance sur 6 de déclencher une quête
        const random = Math.random() * 6 < 1
        console.log("Quête ? " + (random ? "Oui" : "Non"))
        if (!random) {
            return;
        }

        const quest = await QuestService.generateRandomQuest(guildId);

        if (quest) {
            await QuestService.announceQuest(client, quest);
        }
    }

    async startReminder(client: KrisegisClient) {
        // Définir la tâche à exécuter chaque jour à 10h
        cron.schedule('*/2 * * * *', async () => {
            for (const guild of client.guilds.cache.values()) {
                try {
                    await JobUtil.updateMeteo(guild.id);
                    await JobUtil.annoncerMeteo(client, guild.id)
                    await PopulationService.updatePopulation(guild.id)
                    await PopulationService.annoncePopulation(client, guild.id)
                } catch (error) {
                    console.error(error);
                }
            }
        });

        cron.schedule('0 * * * *', async () => {
            for (const guild of client.guilds.cache.values()) {
                try {
                    await JobUtil.generateAndAnnounceQuest(client, guild.id);
                } catch (error) {
                    console.error(error);
                }
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

        const channel = JobUtil.getChannel(client, guildId);

        if (channel && channel.isTextBased()) {
            await channel.send({content: meteo.getText()});
        }
    }

    static getChannel(client : KrisegisClient, guildId: any) {
        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            return;
        }
        return guild.channels.cache.find(channel =>
            (channel.name === 'Astrub Économie') || (channel.name === 'astrub-economie')
        )
    }

    public static async isBuildingConstructed(guildId: string, buildingName: string): Promise<boolean> {
        const buildingGuild = await BuildingGuild.findOne({
            where: {
                guildId: guildId,
                name: buildingName,
                status: "completed"
            }
        });
        return buildingGuild !== null
    }

    public static calculSell(item: BaseItem) {
        if (!item.recipe) {
            return Math.floor(item.sell || 0);
        }

        let sell = 0;
        for (const [recipeItemName, quantity] of Object.entries(item.recipe)) {
            const recipeItem = JobUtil.getItem(recipeItemName as RessourcesEnum | CraftEnum);
            if (!recipeItem) {
                continue;
            }

            const recipeSell = JobUtil.calculSell(recipeItem);
            sell += recipeSell * quantity;
        }

        return Math.floor(sell * 1.1);
    }

    static calculBuy(ressource: BaseItem) {
        const sell = JobUtil.calculSell(ressource);
        return Math.ceil(sell * 2.5) ;
    }

    /**
     * Retourne le nombre de joueurs actifs ces trois derniers jours
     */
    static async getNbActivesPlayers(guildId: string) {
        return await Player.count({
            where: {
                guildId: guildId,
                lastHarvest: {
                    [Op.gt]: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3)
                }
            }
        });
    }
}

export default JobUtil;
