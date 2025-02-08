import {DataTypes, Model} from "sequelize";
import sequelize from '../../utils/database';

interface BuilderGuildAttributes {
    id: number;
    name: string
    guildId: string
    status: string;
    resourcesContributed: Record<string, number>
}

type BuildingGuildCreationAttributes = Partial<BuilderGuildAttributes>;

class BuildingGuild extends Model<BuilderGuildAttributes, BuildingGuildCreationAttributes> implements BuilderGuildAttributes {
    public id!: number;
    public name!: string;
    public guildId!: string;
    public status!: string;
    public resourcesContributed!: Record<string, number>
}

BuildingGuild.init({
    id: {
        type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true
    }, name: {
        type: DataTypes.STRING, allowNull: false
    }, guildId: {
        type: DataTypes.STRING, allowNull: false
    }, status: {
        type: DataTypes.STRING, allowNull: false
    }, resourcesContributed: {
        type: DataTypes.JSON, allowNull: false
    }
}, {
    sequelize, modelName: 'BuildingGuild', timestamps: true
})

export default BuildingGuild