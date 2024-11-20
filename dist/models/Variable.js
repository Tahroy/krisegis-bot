"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../utils/database"));
// Classe Variable pour le modèle
class Variable extends sequelize_1.Model {
}
// Initialisation du modèle
Variable.init({
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
    },
    data: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    server: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        primaryKey: true, // Vous avez défini 'server' comme partie de la clé primaire
    },
}, {
    sequelize: database_1.default, // Instance Sequelize
    modelName: 'Variable', // Nom du modèle
    timestamps: true, // Ajoute automatiquement createdAt et updatedAt
});
exports.default = Variable;
