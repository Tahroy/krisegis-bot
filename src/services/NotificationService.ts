import cron from 'node-cron';
import KrisegisClient from "../models/KrisegisClient";
import {MeteoService} from "./MeteoService";
import {PopulationService} from "./PopulationService";
import {QuestService} from "./QuestService";
import BreedingService from "./BreedingService";

/**
 * NotificationService
 * - Gère les rappels/notifications planifiés pour Astrub Économie
 */
export class NotificationService {
    /**
     * Démarre les tâches planifiées:
     * - Chaque jour à 10h : mise à jour/annonce météo et population
     * - Chaque heure : génération/annonce de quête
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
                } catch (error) {
                    console.error(error);
                }
            }
        });

        // Toutes les heures
        cron.schedule('0 * * * *', async () => {
            for (const guild of client.guilds.cache.values()) {
                try {
                    await QuestService.generateAndAnnounceQuest(client, guild.id);
                } catch (error) {
                    console.error(error);
                }
            }
        });
    }
}

export default NotificationService;
