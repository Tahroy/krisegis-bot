"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../utils/database"));
// Classe Participant pour le modèle
class Participant extends sequelize_1.Model {
}
// Initialisation du modèle
Participant.init({
    id: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
    },
    event: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
    },
}, {
    sequelize: database_1.default, // Instance Sequelize
    modelName: 'Participant', // Nom du modèle
    tableName: 'participants', // Nom de la table (optionnel)
    timestamps: true, // Ajoute automatiquement createdAt et updatedAt
});
exports.default = Participant;
