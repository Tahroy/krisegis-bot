import PlayerItem from '../models/PlayerItem';
import {Guild, User} from 'discord.js';
import {Op} from "sequelize";

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
 * Service pour gérer les items des joueurs
 */
export class PlayerService {

    // Ajoute un item pour le joueur
    static async getItems(user: User, types: ItemType[], guild: Guild): Promise<PlayerItem[]> {
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

    static async addPlayerItem(user: User, name: string, type: ItemType, quantity: number = 1, guildId: string): Promise<void> {
        try {
            // Recherche d'un item existant pour ce joueur
            let playerItem = await PlayerItem.findOne({
                where: {
                    name: name,
                    userId: user.id,
                    guildId: guildId
                },
            });

            // Si l'item existe, on incrémente la quantité
            if (playerItem) {
                playerItem.quantity += quantity;
                await playerItem.save();
            } else {

                console.log({
                    name: name,
                    userId: user.id,
                    quantity: quantity,
                    type: type,
                    guild: guildId
                })
                // Sinon, on crée un nouvel item pour le joueur
                await PlayerItem.create({
                    name: name,
                    userId: user.id,
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
}

