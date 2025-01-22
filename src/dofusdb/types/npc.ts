export interface NpcDb {
    id: number;
    name: {
        fr: string;
    };
    look: string;
    img: string;
}

export interface NpcAPIResponse {
    data: NpcDb[];
    total: number;
}