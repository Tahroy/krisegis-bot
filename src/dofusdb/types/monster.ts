export interface Monster {
    id: number;
    name: {
        fr: string;
    };
    look: string;
    img: string;
}

export interface MonsterAPIResponse {
    data: Monster[];
    total: number;
}