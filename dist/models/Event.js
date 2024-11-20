"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../utils/database"));
class Event extends sequelize_1.Model {
}
Event.init({
    id: {
        type: sequelize_1.DataTypes.STRING, allowNull: false, primaryKey: true
    }, guild: {
        type: sequelize_1.DataTypes.STRING, allowNull: false
    }, server: {
        type: sequelize_1.DataTypes.STRING, allowNull: true
    }, date: {
        type: sequelize_1.DataTypes.INTEGER, allowNull: false
    }, recalled: {
        type: sequelize_1.DataTypes.BOOLEAN, allowNull: false, defaultValue: false
    }, name: {
        type: sequelize_1.DataTypes.STRING, allowNull: true
    }, serverName: {
        type: sequelize_1.DataTypes.STRING, allowNull: true
    }, description: {
        type: sequelize_1.DataTypes.STRING, allowNull: true
    }
}, {
    sequelize: database_1.default, modelName: 'event', timestamps: true
});
exports.default = Event;
