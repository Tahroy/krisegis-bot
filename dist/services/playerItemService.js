"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerService = exports.ItemType = void 0;
const PlayerItem_1 = __importDefault(require("../models/PlayerItem"));
var ItemType;
(function (ItemType) {
    ItemType["KOUINKOUIN"] = "kouinkouin";
    ItemType["POTION"] = "potion";
    ItemType["LARVE"] = "larve";
    ItemType["WABBIT"] = "wabbit";
    ItemType["QUESTION"] = "question";
})(ItemType || (exports.ItemType = ItemType = {}));
/**
 * Service pour gérer les items des joueurs
 */
class PlayerService {
    // Ajoute un item pour le joueur
    static async addPlayerItem(user, name, type) {
        try {
            // Recherche d'un item existant pour ce joueur
            let playerItem = await PlayerItem_1.default.findOne({
                where: {
                    name: name, user_id: user.id,
                },
            });
            // Si l'item existe, on incrémente la quantité
            if (playerItem) {
                playerItem.quantity += 1;
                await playerItem.save();
            }
            else {
                // Sinon, on crée un nouvel item pour le joueur
                playerItem = await PlayerItem_1.default.create({
                    name: name, user_id: user.id, quantity: 1, type: type,
                });
            }
        }
        catch (error) {
            console.error('Erreur lors de l\'ajout de l\'item pour le joueur:', error);
            throw new Error('Impossible d\'ajouter l\'item pour le joueur');
        }
    }
}
exports.PlayerService = PlayerService;
