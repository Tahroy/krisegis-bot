export interface Monster {
    id: number;
    name: {
        fr: string;
    };
    look: string;
}

export interface MonsterAPIResponse {
    data: Monster[];
    total: number;
}