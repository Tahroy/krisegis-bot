import {DataTypes, Model} from "sequelize";
import sequelize from '../../utils/database';

interface FarmGuildAttributes {
    id: number;
    guildId: string;
    foodStock: number;
    lastHarvest: Date;
}

type FarmGuildCreationAttributes = Partial<FarmGuildAttributes>;

class FarmGuild extends Model<FarmGuildAttributes, FarmGuildCreationAttributes> implements FarmGuildAttributes {
    public id!: number;
    public guildId!: string;
    public foodStock!: number;
    public lastHarvest!: Date;
}

FarmGuild.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    guildId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    foodStock: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    lastHarvest: {
        type: DataTypes.DATE,
    }
}, {
    sequelize,
    modelName: "FarmGuild",
})

export default FarmGuild