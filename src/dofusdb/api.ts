// /src/api/dofusdb.ts
import axios from 'axios';
import {Monster, MonsterAPIResponse} from './types/monster';

const API_URL = 'https://api.dofusdb.fr/monsters';

export const fetchMonsters = async (conditionRequest: string): Promise<MonsterAPIResponse> => {
    try {
        const response = await axios.get(`${API_URL}${conditionRequest}`);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des monstres:', error);
        throw new Error('Échec de la récupération des monstres');
    }
};

export const fetchMonster = async (id: number): Promise<Monster> => {
    try {
        const response = await axios.get(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération du monstre:', error);
        throw new Error('Échec de la récupération du monstre');
    }
};