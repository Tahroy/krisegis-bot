"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../utils/database"));
class Question extends sequelize_1.Model {
}
Question.init({
    question: {
        type: sequelize_1.DataTypes.STRING, allowNull: false,
    }, answers: {
        type: sequelize_1.DataTypes.JSON, // Utilisez le type JSON pour stocker un tableau d'answers
    }, correctAnswer: {
        type: sequelize_1.DataTypes.STRING, allowNull: false,
    },
}, {
    sequelize: database_1.default, modelName: 'Question',
});
exports.default = Question;
