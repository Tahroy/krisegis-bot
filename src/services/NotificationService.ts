import cron from 'node-cron';
import KrisegisClient from "../models/KrisegisClient";
import {MeteoService} from "./MeteoService";
import {PopulationService} from "./PopulationService";
import {QuestService} from "./QuestService";
import BreedingService from "./BreedingService";
import Nowel from "../models/nowel/Nowel";
import { Op } from 'sequelize';
import sequelize from '../utils/database';
import SmashPassService from "./SmashPassService";

interface SchedulerConfig {
    name: string;
    cronExpression: string;
    enabled: boolean;
    handler: () => Promise<void>;
}

export class NotificationService {

    /**
     * Astrub Économie - Nouvelle journée (chaque jour à 10h)
     */
    private static async astrubEconomyNewDay(client: KrisegisClient): Promise<void> {
        for (const guild of client.guilds.cache.values()) {
            try {
                await MeteoService.updateMeteo(guild.id);
                await MeteoService.annoncerMeteo(client, guild.id);
                await PopulationService.updatePopulation(guild.id);
                await PopulationService.annoncePopulation(client, guild.id);
                await BreedingService.runDaily(client, guild);
            } catch (error) {
                console.error(`[DailyMorning] Erreur pour la guilde ${guild.id}:`, error);
            }
        }
    }

    /**
     * Astrub Économie - Quêtes (toutes les heures)
     */
    private static async astrubEconomyQuests(client: KrisegisClient): Promise<void> {
        for (const guild of client.guilds.cache.values()) {
            try {
                await QuestService.generateAndAnnounceQuest(client, guild.id);
            } catch (error) {
                console.error(`[HourlyQuests] Erreur pour la guilde ${guild.id}:`, error);
            }
        }
    }

    /**
     * Nowel - Régénération des PV (toutes les heures)
     */
    private static async nowelHPRegen(): Promise<void> {
        try {
            await Nowel.update(
                { remainingHP: sequelize.literal('remainingHP + 1') },
                { where: { remainingHP: { [Op.lt]: 5 } } }
            );
        } catch (error) {
            console.error("[NowelHPRegen] Erreur lors de la régénération des PV:", error);
        }
    }

    /**
     * Nowel - Nouvelles boules (toutes les 30 minutes)
     */
    private static async nowelThrowsRegen(): Promise<void> {
        try {
            await Nowel.update(
                { remainingThrows: sequelize.literal('remainingThrows + 1') },
                { where: { remainingThrows: { [Op.lt]: 5 } } }
            );
        } catch (error) {
            console.error("[NowelThrowsRegen] Erreur lors de la régénération des lancers:", error);
        }
    }

    /**
     * Smash or Pass - PNJ (10h chaque jour)
     */
    private static async smashPassNPC(client: KrisegisClient): Promise<void> {
        for (const guild of client.guilds.cache.values()) {
            try {
                console.log(`[SmashPassNPC] Smash or pass pour ${guild.id}`);
                await SmashPassService.postDaily(guild, 'npc');
            } catch (error) {
                console.error(`[SmashPassNPC] Erreur pour la guilde ${guild.id}:`, error);
            }
        }
    }

    /**
     * Smash or Pass - Monstres (18h chaque jour)
     */
    private static async smashPassMonster(client: KrisegisClient): Promise<void> {
        for (const guild of client.guilds.cache.values()) {
            try {
                await SmashPassService.postDaily(guild, 'monster');
            } catch (error) {
                console.error(`[SmashPassMonster] Erreur pour la guilde ${guild.id}:`, error);
            }
        }
    }

    static startSchedulers(client: KrisegisClient): void {
        const schedulers: SchedulerConfig[] = [
            {
                name: 'AstrubEconomyNewDay',
                cronExpression: '0 10 * * *',
                enabled: false,
                handler: () => this.astrubEconomyNewDay(client),
            },
            {
                name: 'AstrubEconomyQuests',
                cronExpression: '0 * * * *',
                enabled: false,
                handler: () => this.astrubEconomyQuests(client),
            },
            {
                name: 'NowelHPRegen',
                cronExpression: '0 * * * *',
                enabled: true,
                handler: () => this.nowelHPRegen(),
            },
            {
                name: 'NowelThrowsRegen',
                cronExpression: '*/30 * * * *',
                enabled: true,
                handler: () => this.nowelThrowsRegen(),
            },
            {
                name: 'SmashPassNPC',
                cronExpression: '0 9 * * *',
                enabled: true,
                handler: () => this.smashPassNPC(client),
            },
            {
                name: 'SmashPassMonster',
                cronExpression: '0 17 * * *',
                enabled: true,
                handler: () => this.smashPassMonster(client),
            },
        ];

        for (const scheduler of schedulers) {
            if (!scheduler.enabled) {
                continue;
            }

            cron.schedule(scheduler.cronExpression, scheduler.handler);
        }
    }
}

export default NotificationService;
