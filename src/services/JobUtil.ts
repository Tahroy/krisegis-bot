import Ressource, {Ressources} from "../models/astrub_economy/Ressource";
import BaseItem, {Items} from "../models/astrub_economy/BaseItem";
import {Crafts} from "../models/astrub_economy/Craft";
import {Client, Guild, User} from "discord.js";
import Player from "../models/astrub_economy/Player";
import cron from 'node-cron';
import {PopulationService} from "./PopulationService";
import KrisegisClient from "../models/KrisegisClient";
import BuildingGuild from "../models/astrub_economy/BuildingGuild";
import {Building, Buildings} from "../models/astrub_economy/Building";
import {QuestService} from "./QuestService";
import {CraftEnum, RessourcesEnum} from "../models/astrub_economy/Enums";
import {Op} from "sequelize";
import {MeteoService} from "./MeteoService";

class JobUtil {

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

    static getCraft(craft: string): BaseItem | null {
        return Object.values(Crafts).find(c => c.name === craft) ?? null
    }

    static getItem(name: string): BaseItem | undefined {
        return Object.values({...Ressources, ...Crafts}).find(item => item.name === name);
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

    /**
     * Génère une nouvelle quête pour un serveur et l'annonce
     */
    static async generateAndAnnounceQuest(client: KrisegisClient, guildId: string): Promise<void> {
        await QuestService.deleteOldQuests(client, guildId);

        // Une chance sur 12 de déclencher une quête
        const random = Math.random() * 8 < 1
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
        cron.schedule('0 10 * * *', async () => {
            for (const guild of client.guilds.cache.values()) {
                try {
                    await MeteoService.updateMeteo(guild.id);
                    await MeteoService.annoncerMeteo(client, guild.id)
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

    static async getUsername(playerId: string, guild: Guild) {
        const member = await guild.members.fetch(playerId);
        return member.displayName;
    }
}

export default JobUtil;
