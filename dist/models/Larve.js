"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../utils/database"));
class Larve extends sequelize_1.Model {
}
Larve.init({
    name: {
        type: sequelize_1.DataTypes.STRING, primaryKey: true
    }, nb: {
        type: sequelize_1.DataTypes.INTEGER
    }
}, {
    sequelize: database_1.default, modelName: 'larve', timestamps: false
});
exports.default = Larve;
