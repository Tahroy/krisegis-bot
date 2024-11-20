"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchMonsters = void 0;
// /src/api/dofusdb.ts
const axios_1 = __importDefault(require("axios"));
const API_URL = 'https://api.dofusdb.fr/monsters';
const fetchMonsters = async (conditionRequest) => {
    try {
        const response = await axios_1.default.get(`${API_URL}${conditionRequest}`);
        return response.data;
    }
    catch (error) {
        console.error('Erreur lors de la récupération des monstres:', error);
        throw new Error('Échec de la récupération des monstres');
    }
};
exports.fetchMonsters = fetchMonsters;
