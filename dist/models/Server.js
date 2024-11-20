"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../utils/database"));
// Classe Server pour le modèle
class Server extends sequelize_1.Model {
}
// Initialisation du modèle
Server.init({
    id: {
        type: sequelize_1.DataTypes.STRING, allowNull: false, primaryKey: true,
    }, game: {
        type: sequelize_1.DataTypes.STRING, allowNull: true,
    }, guild: {
        type: sequelize_1.DataTypes.STRING, allowNull: false,
    }, tag: {
        type: sequelize_1.DataTypes.STRING, allowNull: false,
    }, channel: {
        type: sequelize_1.DataTypes.STRING, allowNull: true,
    }, name: {
        type: sequelize_1.DataTypes.STRING, allowNull: true,
    },
}, {
    sequelize: database_1.default, // Instance Sequelize
    modelName: 'Server', // Nom du modèle
    timestamps: true, // Ajoute automatiquement createdAt et updatedAt
});
exports.default = Server;
