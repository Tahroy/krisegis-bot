import {DataTypes, Model} from "sequelize";
import sequelize from '../utils/database';
import {PicturesManager} from "../utils/PicturesManager";
import {join} from "path";

const url_look = process.env.URL_LOOK;

interface NpcAttributes {
    id: number;
    name: string;
    look: string;
}

class Npc extends Model<NpcAttributes> implements NpcAttributes {
    public id!: number;
    public name!: string;
    public look!: string;

    async getImage() {
        const hex = Buffer.from(this.look, 'utf8').toString('hex');

        const img = `${url_look}/${hex}`

        await PicturesManager.fetchImageIfNeeded(img, `${this.id}.png`, '/npcs/');

        return join(__dirname, '..', '..', 'public', 'npcs', `${this.id}.png`)
    }
}

Npc.init(
    {
        id: {type: DataTypes.INTEGER, primaryKey: true},
        name: {type: DataTypes.STRING,},
        look: {type: DataTypes.STRING,},
    },
    {
        sequelize,
        tableName: 'npc',
    }
);

export default Npc