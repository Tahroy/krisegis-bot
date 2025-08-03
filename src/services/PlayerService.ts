import PlayerItem from '../models/PlayerItem';
import {Guild, User} from 'discord.js';
import {Op} from "sequelize";
import {ReserveService} from "./ReserveService";
import Player from "../models/astrub_economy/Player";

export enum ItemType {
    KOUINKOUIN = 'kouinkouin',
    POTION = 'potion',
    LARVE = 'larve',
    WABBIT = 'wabbit',
    QUESTION = 'question',
    MONSTRE = 'monstre',
    RESSOURCE = 'ressource',
    OUTIL = 'outil',
    FABRICATION = 'fabrication'
}

/**
 * Service pour les joueurs
 */
export class PlayerService {

    // Ajoute un item pour le joueur
    public static async getItems(user: User, types: ItemType[], guild: Guild): Promise<PlayerItem[]> {
        return await PlayerItem.findAll({
            where: {
                userId: user.id,
                type: {[Op.in]: types},
                guildId: guild.id,
                quantity: {[Op.gt]: 0}
            },
            order: [['type', 'ASC'], ['name', 'ASC']]
        });
    }

    public static async getItem(user: User, name: string, guild: Guild): Promise<PlayerItem | null> {
        return await PlayerItem.findOne({
            where: {
                userId: user.id,
                guildId: guild.id,
                name: name,
            },
        });
    }

    public static async addPlayerItem(user: User | null, name: string, type: ItemType, quantity: number = 1, guildId: string): Promise<void> {
        try {
            // Recherche d'un item existant pour ce joueur
            let playerItem = await PlayerItem.findOne({
                where: {
                    name: name,
                    userId: user?.id ?? ReserveService.RESERVE_USER_ID,
                    guildId: guildId
                },
            });

            // Si l'item existe, on incrémente la quantité
            if (playerItem) {
                playerItem.quantity += quantity;
                await playerItem.save();
            } else {
                // Sinon, on crée un nouvel item pour le joueur
                await PlayerItem.create({
                    name: name,
                    userId: user?.id ?? ReserveService.RESERVE_USER_ID,
                    quantity: quantity,
                    type: type,
                    guildId: guildId,
                });
            }
        } catch (error) {
            console.error('Erreur lors de l\'ajout de l\'item pour le joueur:', error);
            throw new Error('Impossible d\'ajouter l\'item pour le joueur');
        }
    }

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
        const level = PlayerService.getLevelFromXP(currentXP, baseXP);

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
        const level = PlayerService.getLevelFromXP(totalXP, baseXP);

        let xpForCurrentLevel = 0;
        for (let i = 1; i <= level; i++) {
            xpForCurrentLevel += baseXP * i ** 2;
        }

        const currentLevelXP = totalXP - xpForCurrentLevel;
        const nextLevelXP = baseXP * (level + 1) ** 2;

        return {currentLevelXP, nextLevelXP};
    }

}

