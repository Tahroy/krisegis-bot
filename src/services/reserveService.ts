import PlayerItem from '../models/PlayerItem';
import {Guild, User} from 'discord.js';
import {Op} from "sequelize";
import {ItemType, PlayerService} from "./playerItemService";

export class ReserveService {
    static readonly RESERVE_USER_ID = 'reserve';

    /**
     * Récupère tous les items de la réserve pour une guilde donnée
     */
    static async getReserveItems(guild: Guild, types: ItemType[] = [ItemType.RESSOURCE, ItemType.FABRICATION]): Promise<PlayerItem[]> {
        return await PlayerItem.findAll({
            where: {
                userId: this.RESERVE_USER_ID,
                type: {[Op.in]: types},
                guildId: guild.id,
                quantity: {[Op.gt]: 0}
            },
            order: [['type', 'ASC'], ['name', 'ASC']]
        });
    }

    /**
     * Dépose un item d'un joueur dans la réserve
     */
    static async deposeItem(user: User, name: string, type: ItemType, quantity: number, guildId: string): Promise<void> {
        // Vérifier si le joueur a suffisamment d'items
        const playerItem = await PlayerItem.findOne({
            where: {
                userId: user.id,
                name: name,
                guildId: guildId
            }
        });

        if (!playerItem || playerItem.quantity < quantity) {
            throw new Error('Quantité insuffisante');
        }

        // Retirer l'item de l'inventaire du joueur
        await PlayerService.addPlayerItem(user, name, type, -quantity, guildId);

        // Ajouter l'item à la réserve
        await PlayerService.addPlayerItem(null, name, type, quantity, guildId);
    }

    /**
     * Retire un item de la réserve pour le donner à un joueur
     */
    static async takeItem(user: User, name: string, type: ItemType, quantity: number, guildId: string): Promise<void> {
        // Vérifier si la réserve a suffisamment d'items
        const reserveItem = await PlayerItem.findOne({
            where: {
                userId: this.RESERVE_USER_ID,
                name: name,
                guildId: guildId
            }
        });

        if (!reserveItem || reserveItem.quantity < quantity) {
            throw new Error('Quantité insuffisante dans la réserve');
        }

        // Retirer l'item de la réserve
        await PlayerService.addPlayerItem(null, name, type, -quantity, guildId)
        // Ajouter l'item à l'inventaire du joueur
        await PlayerService.addPlayerItem(user, name, type, quantity, guildId);
    }
}