import Ressource, {Ressources} from "../../models/astrub_economy/Ressource";
import Tool, {Tools} from "../../models/astrub_economy/Tool";
import BaseItem, {Items} from "../../models/astrub_economy/BaseItem";
import {Crafts} from "../../models/astrub_economy/Craft";
import {User} from "discord.js";
import Player from "../../models/astrub_economy/Player";

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
        return { level, remainingXP };
    }

    static getRessource(ressource: string): Ressource|null {
        return Object.values(Ressources).find(r => r.name === ressource) ?? null
    }

    static getTool(tool: string): Tool|null {
        return Object.values(Tools).find(t => t.name === tool) ?? null
    }

    static getCraft(craft: string): BaseItem|null {
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

    static async  getPlayer(user: User): Promise<Player> {
        let player = await Player.findOne({
            where: {
                id: user.id
            }
        })

        if (player) {
            return player;
        }

        return await Player.create({id: user.id})
    }

}

export default JobUtil;