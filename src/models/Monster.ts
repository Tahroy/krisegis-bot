import {DataTypes, Model} from "sequelize";
import sequelize from '../utils/database';
import Capture from "./Capture";

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