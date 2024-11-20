"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../utils/database"));
class Capture extends sequelize_1.Model {
}
Capture.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    rollUserId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    catchUserId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    monsterId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    monsterName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    catchDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
}, {
    sequelize: database_1.default,
    tableName: 'captures',
    timestamps: true,
});
exports.default = Capture;
