"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../utils/database"));
// Classe LoreElement pour le modèle
class LoreElement extends sequelize_1.Model {
}
// Initialisation du modèle
LoreElement.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true,
    }, name: {
        type: sequelize_1.DataTypes.STRING, allowNull: false,
    }, type: {
        type: sequelize_1.DataTypes.ENUM('npc', 'item', 'document', 'article'), allowNull: false,
    }, content: {
        type: sequelize_1.DataTypes.TEXT, allowNull: true,
    },
}, {
    sequelize: database_1.default, // Instance Sequelize
    modelName: 'LoreElement', // Nom du modèle
    timestamps: true, // Ajoute automatiquement createdAt et updatedAt
});
exports.default = LoreElement;
