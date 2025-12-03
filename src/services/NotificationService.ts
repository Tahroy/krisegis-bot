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

/**
 * NotificationService
 * - Gère les rappels/notifications planifiés pour Astrub Économie
 */
export class NotificationService {
    /**
     * Démarre les tâches planifiées:
     * - Chaque jour à 10h : mise à jour/annonce météo et population
     * - Chaque heure : génération/annonce de quête et régénération des PV de Nowel
     * - Toutes les 30 minutes : régénération des lancers de Nowel
     */
    static startSchedulers(client: KrisegisClient) {
        // Quotidien à 10:00
        cron.schedule('0 10 * * *', async () => {
            for (const guild of client.guilds.cache.values()) {
                try {
                    await MeteoService.updateMeteo(guild.id);
                    await MeteoService.annoncerMeteo(client, guild.id);
                    await PopulationService.updatePopulation(guild.id);
                    await PopulationService.annoncePopulation(client, guild.id);
                    await BreedingService.runDaily(client, guild);
                   // await SmashPassService.postDaily(guild, 'npc');
                } catch (error) {
                    console.error(error);
                }
            }
        });

        // Toutes les heures
        cron.schedule('0 * * * *', async () => {
            // Quests
            for (const guild of client.guilds.cache.values()) {
                try {
                    await QuestService.generateAndAnnounceQuest(client, guild.id);
                } catch (error) {
                    console.error(error);
                }
            }

            // Nowel HP Regeneration
            try {
                // Régénère 1 PV pour les joueurs ayant moins de 5 PV
                await Nowel.update(
                    { remainingHP: sequelize.literal('remainingHP + 1') },
                    { where: { remainingHP: { [Op.lt]: 5 } } }
                );
            } catch (error) {
                console.error("Erreur lors de la régénération des PV de Nowel:", error);
            }
        });

        // Toutes les 30 minutes
        cron.schedule('*/30 * * * *', async () => {
            try {
                // Régénère 1 lancer pour les joueurs ayant moins de 10 lancers
                await Nowel.update(
                    { remainingThrows: sequelize.literal('remainingThrows + 1') },
                    { where: { remainingThrows: { [Op.lt]: 5 } } }
                );
            } catch (error) {
                console.error("Erreur lors de la régénération des lancers de Nowel : ", error);
            }
        });

        cron.schedule('* 11 * * *', async () => {
            for (const guild of client.guilds.cache.values()) {
                try {
                    console.log(`Smash or pass pour ${guild.id}`)
                    await SmashPassService.postDaily(guild, 'npc');
                } catch (error) {
                    console.error(error);
                }
            }
        })

        cron.schedule('* 18 * * *', async () => {
            for (const guild of client.guilds.cache.values()) {
                try {
                    await SmashPassService.postDaily(guild, 'monster');
                } catch (error) {
                    console.error(error);
                }
            }
        })
    }
}

export default NotificationService;
