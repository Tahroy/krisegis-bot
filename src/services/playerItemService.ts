import PlayerItem from '../models/PlayerItem';
import {User} from 'discord.js';

export enum ItemType {
    KOUINKOUIN = 'kouinkouin',
    POTION = 'potion',
    LARVE = 'larve',
    WABBIT = 'wabbit',
    QUESTION = 'question',
    MONSTRE = 'monstre',
    RESSOURCE = 'ressource'
}

/**
 * Service pour gérer les items des joueurs
 */
export class PlayerService {

    // Ajoute un item pour le joueur
    static async addPlayerItem(user: User, name: string, type: ItemType, quantity: number = 1): Promise<void> {
        try {
            // Recherche d'un item existant pour ce joueur
            let playerItem = await PlayerItem.findOne({
                where: {
                    name: name, user_id: user.id,
                },
            });

            // Si l'item existe, on incrémente la quantité
            if (playerItem) {
                playerItem.quantity += 1;
                await playerItem.save();
            } else {
                // Sinon, on crée un nouvel item pour le joueur
                playerItem = await PlayerItem.create({
                    name: name, user_id: user.id, quantity: quantity, type: type,
                });
            }
        } catch (error) {
            console.error('Erreur lors de l\'ajout de l\'item pour le joueur:', error);
            throw new Error('Impossible d\'ajouter l\'item pour le joueur');
        }
    }
}

