import {DataTypes, Model, Optional} from "sequelize";
import sequelize from '../../utils/database';
import {QuestEnum} from "./QuestTemplate";

interface QuestAttributes {
    id: number;
    guildId: string;
    name: string;
    itemsProvided: Record<string, number>;
    participants: Record<string, number>;
    status: 'active' | 'failed' | 'completed';
    createdAt?: Date;
    updatedAt?: Date;
}

type QuestCreationAttributes = Optional<QuestAttributes, 'id' | 'itemsProvided' | 'participants' | 'status'>;

class Quest extends Model<QuestAttributes, QuestCreationAttributes> implements QuestAttributes {
    public id!: number;
    public guildId!: string;
    public name!: string;
    public itemsProvided!: Record<string, number>;
    public participants!: Record<string, number>;
    public status!: 'active' | 'failed' | 'completed';
    public createdAt!: Date;
    public updatedAt!: Date;
}

Quest.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    guildId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    itemsProvided: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {}
    },
    participants: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {}
    },
    status: {
        type: DataTypes.ENUM('active', 'failed', 'completed'),
        allowNull: false,
        defaultValue: 'active'
    },
}, {
    sequelize,
    modelName: 'Quest',
    tableName: 'quests',
    timestamps: true,
});

export default Quest;
