"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../utils/database"));
// Classe Potion pour le modèle
class Potion extends sequelize_1.Model {
}
// Initialisation du modèle
Potion.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true,
    }, name: {
        type: sequelize_1.DataTypes.STRING, allowNull: false,
    }, user_id: {
        type: sequelize_1.DataTypes.STRING, allowNull: false,
    }, ingredient_1: {
        type: sequelize_1.DataTypes.STRING, allowNull: false,
    }, ingredient_2: {
        type: sequelize_1.DataTypes.STRING, allowNull: false,
    }, ingredient_3: {
        type: sequelize_1.DataTypes.STRING, allowNull: false,
    }, ingredient_4: {
        type: sequelize_1.DataTypes.STRING, allowNull: false,
    }, ingredient_5: {
        type: sequelize_1.DataTypes.STRING, allowNull: false,
    },
}, {
    sequelize: database_1.default, // Instance de Sequelize
    modelName: 'Potion', // Nom du modèle
    timestamps: true, // Ajoute automatiquement les colonnes createdAt et updatedAt
});
exports.default = Potion;
