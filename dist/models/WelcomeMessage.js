"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../utils/database"));
// Classe WelcomeMessage pour le modèle
class WelcomeMessage extends sequelize_1.Model {
}
// Initialisation du modèle
WelcomeMessage.init({
    message: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    guild: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: "185464480346537984", // Valeur par défaut
    },
}, {
    sequelize: database_1.default, // Instance Sequelize
    modelName: 'WelcomeMessage', // Nom du modèle
    timestamps: true, // Ajoute automatiquement createdAt et updatedAt
});
exports.default = WelcomeMessage;
