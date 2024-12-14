export interface MonsterDb {
    id: number;
    name: {
        fr: string;
    };
    look: string;
    img: string;
    isBoss: boolean;
    isMiniBoss: boolean;
    gfxId: number;
}

export interface MonsterAPIResponse {
    data: MonsterDb[];
    total: number;
}