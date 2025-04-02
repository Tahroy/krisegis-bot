import {DataTypes, Model, Optional} from "sequelize";
import sequelize from '../../utils/database';
import {BuildingEnum} from "./Building";

interface BuildingGuildAttributes {
    id: number;
    name: string;
    guildId: string;
    status: string;
    resourcesContributed: Record<string, number>;
}

type BuildingGuildCreationAttributes = Optional<BuildingGuildAttributes, 'id' | 'status' | 'resourcesContributed'>;

class BuildingGuild extends Model<BuildingGuildAttributes, BuildingGuildCreationAttributes> implements BuildingGuildAttributes {
    public id!: number;
    public name!: string;
    public guildId!: string;
    public status!: string;
    public resourcesContributed!: Record<string, number>;
}

BuildingGuild.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    guildId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'En construction'
    },
    resourcesContributed: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {}
    }
}, {
    sequelize,
    modelName: 'BuildingGuild',
    tableName: 'building_guilds',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['guildId', 'name']
        }
    ]
})

export default BuildingGuild;