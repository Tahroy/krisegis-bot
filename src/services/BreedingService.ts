import KrisegisClient from "../models/KrisegisClient";
import JobUtil from "./JobUtil";
import Bouftou from "../models/astrub_economy/Bouftou";
import {ResourceEnum} from "../models/astrub_economy/Enums";
import {BuildingEnum} from "../models/astrub_economy/Building";
import {PlayerService} from "./PlayerService";
import {Guild} from "discord.js";
import {ItemType} from "../utils/Enums";

export class BreedingService {
    /**
     * Calcule la production de laine selon le nombre de repas pris aujourd'hui
     */
    private static productionFor(feedCountToday: number): number {
        if (!feedCountToday) {
            return 0;
        }

        return 1 + Math.floor(Math.random() * feedCountToday);
    }

    /**
     * Traite le reset quotidien de l'élevage : production, faim, décès, reset des compteurs.
     */
    public static async runDaily(client: KrisegisClient, guild: Guild): Promise<void> {
        const guildId = guild.id;

        // Si la bouftonnerie n'est pas construite, ne rien faire
        const isBuilt = await JobUtil.isBuildingConstructed(guildId, BuildingEnum.BOUFTONNERIE);
        if (!isBuilt) {
            return;
        }

        const bouftous = await Bouftou.findAll({where: {guildId, isAlive: true}});

        let totalWool = 0;
        const deaths: string[] = [];
        const lostLives: string[] = [];

        for (const bouftou of bouftous) {
            const produced = BreedingService.productionFor(bouftou.feedCountToday);
            const emoji = await JobUtil.getEmojiByName(bouftou.emoji, guild.client);

            if (produced > 0) {
                totalWool += produced;
            }

            // Gestion de la faim et mort éventuelle
            if (bouftou.feedCountToday === 0) {
                bouftou.daysWithoutFood += 1;
                lostLives.push(`${emoji} ${bouftou.name}`);
            } else {
                bouftou.daysWithoutFood = 0;
            }

            if (bouftou.daysWithoutFood >= 3) {
                bouftou.isAlive = false;
                deaths.push(`${emoji} ${bouftou.name}`);
            }

            // Reset pour le nouveau jour
            bouftou.feedCountToday = 0;
            await bouftou.save();
        }

        // On ajoute la laine à la réserve
        await PlayerService.addPlayerItem(null, ResourceEnum.LAINE_DE_BOUFTOU, ItemType.RESSOURCE, totalWool, guildId);

        // Annonce dans le salon
        const channel = JobUtil.getChannel(client, guildId);
        if (channel && channel.isTextBased()) {
            const parts: string[] = [];
            if (totalWool > 0) {
                parts.push(`Production du jour : ${totalWool}x ${ResourceEnum.LAINE_DE_BOUFTOU}.`);
            }

            for (const name of lostLives) {
                parts.push(`${name} a perdu une vie...`);
            }
            for (const name of deaths) {
                parts.push(`${name} est mort de faim...`);
            }

            if (parts.length > 0) {
                await channel.send({content: parts.join('\n')})
            }
        }
    }
}

export default BreedingService;
