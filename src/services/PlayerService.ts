import PlayerItem from '../models/PlayerItem';
import {Guild, User} from 'discord.js';
import {Op} from "sequelize";
import {ReserveService} from "./ReserveService";
import {CraftEnum, LevelEnum, ResourceEnum} from "../models/astrub_economy/Enums";
import ItemService from "./ItemService";
import {ItemType} from "../utils/Enums";

/**
 * Service pour les joueurs
 */
export class PlayerService {

    // Ajoute un item pour le joueur
    public static async getItems(user: User | null, types: ItemType[], guild: Guild, search: string | null = null): Promise<PlayerItem[]> {
        const allItems = await PlayerItem.findAll({
            where: {
                userId: user?.id ?? 'reserve',
                type: {[Op.in]: types},
                guildId: guild.id,
                quantity: {[Op.gt]: 0}
            }
        });

        let items: PlayerItem[] = [];

        if (search) {
            for (let item of allItems) {
                if (item.name.toLowerCase().includes(search.toLowerCase())) {
                    items.push(item)
                }
            }
        } else {
            items = allItems;
        }

        // Définir l'ordre de priorité des types
        const typeOrder = {
            [ItemType.RESSOURCE]: 1,
            [ItemType.FABRICATION]: 2,
            [ItemType.OUTIL]: 3
        };

        // Trier les items selon l'ordre des types puis par nom
        items.sort((a, b) => {
            const typeA = typeOrder[a.type as keyof typeof typeOrder] || 999;
            const typeB = typeOrder[b.type as keyof typeof typeOrder] || 999;

            if (typeA !== typeB) {
                return typeA - typeB;
            }
        
            return a.name.localeCompare(b.name);
        });
    
        return items;
    }

    public static async getItem(user: User|null, name: ResourceEnum | CraftEnum | string, guild: Guild): Promise<PlayerItem | null> {
        return await PlayerItem.findOne({
            where: {
                userId: user ? user.id : 'reserve',
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

            // Si c'est un outil, on met en place une durabilité
            if (type === ItemType.OUTIL) {
                // Tenter de récupérer la définition de craft pour déterminer le palier
                const craft = ItemService.getCraft(name);
                const level = (craft?.level ?? 0) as LevelEnum;
                const max = ItemService.getToolMaxDurability(level);

                if (playerItem) {
                    playerItem.type = type;
                    playerItem.quantity = 1;
                    playerItem.durability = max;
                    await playerItem.save();
                } else {
                    await PlayerItem.create({
                        name: name,
                        userId: user?.id ?? ReserveService.RESERVE_USER_ID,
                        quantity: 1,
                        type: type,
                        guildId: guildId,
                        durability: max,
                    });
                }
                return;
            }

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

