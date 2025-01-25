// /src/api/dofusdb.ts
import axios from 'axios';
import {MonsterDb, MonsterAPIResponse} from './types/monster';
import {NpcAPIResponse} from "./types/npc";

const API_URL = 'https://api.beta.dofusdb.fr';

export const fetchMonsters = async (conditionRequest: string): Promise<MonsterAPIResponse> => {
    try {
        const response = await axios.get(`${API_URL}/monsters${conditionRequest}`);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des monstres:', error);
        throw new Error('Échec de la récupération des monstres');
    }
};

export const fetchMonster = async (id: number): Promise<MonsterDb> => {
    try {
        const response = await axios.get(`${API_URL}/monsters/${id}`);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération du monstre:', error);
        throw new Error('Échec de la récupération du monstre');
    }
};

export const fetchNpcs = async (conditionRequest: string): Promise<NpcAPIResponse> => {
    try {
        const response = await axios.get(`${API_URL}/npcs${conditionRequest}`);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des PNJ:', error);
        throw new Error('Échec de la récupération des PNJ');
    }
}