import {DataTypes, Model} from "sequelize";
import sequelize from '../utils/database';
import {PicturesManager} from "../utils/PicturesManager";
import {join} from "path";

interface MonsterAttributes {
    name: string;
    id: number;
    isBoss: boolean;
    isMiniBoss: boolean;
    gfxId: number;
}

class Monster extends Model<MonsterAttributes> implements MonsterAttributes {
    public name!: string;
    public id!: number;
    public isBoss!: boolean;
    public isMiniBoss!: boolean;
    public gfxId!: number;

    async getImage() {
        const img = `https://api.dofusdb.fr/img/monsters/${this.gfxId}.png`;
        await PicturesManager.fetchImageIfNeeded(img, `${this.id}.png`, '/monsters/');

        return join(__dirname, '..', '..', 'public', 'monsters', `${this.id}.png`)
    }
}

Monster.init({
    id: {type: DataTypes.INTEGER, primaryKey: true},
    name: {type: DataTypes.STRING},
    isBoss: {type: DataTypes.BOOLEAN},
    isMiniBoss: {type: DataTypes.BOOLEAN},
    gfxId: {type: DataTypes.INTEGER}
}, {
    sequelize, modelName: 'monster'
})

export default Monster;