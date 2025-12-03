import {DataTypes, Model, Optional} from 'sequelize';
import sequelize from '../utils/database';

type SmashPassSubjectType = 'monster' | 'npc';

interface SmashPassRoundAttributes {
    id: number;
    guildId: string;
    channelId: string;
    messageId: string | null;
    subjectType: SmashPassSubjectType;
    monsterId: number | null;
    npcId: number | null;
}

type SmashPassRoundCreation = Optional<SmashPassRoundAttributes, 'id' | 'messageId'>;

class SmashPassRound extends Model<SmashPassRoundAttributes, SmashPassRoundCreation> implements SmashPassRoundAttributes {
    public id!: number;
    public guildId!: string;
    public channelId!: string;
    public messageId!: string | null;
    public subjectType!: SmashPassSubjectType;
    public monsterId!: number | null;
    public npcId!: number | null;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

SmashPassRound.init({
    id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
    guildId: {type: DataTypes.STRING, allowNull: false},
    channelId: {type: DataTypes.STRING, allowNull: false},
    messageId: {type: DataTypes.STRING, allowNull: true},
    subjectType: {type: DataTypes.ENUM('monster', 'npc'), allowNull: false},
    monsterId: {type: DataTypes.INTEGER, allowNull: true},
    npcId: {type: DataTypes.INTEGER, allowNull: true},
}, {
    sequelize,
    timestamps: true,
});

export default SmashPassRound;
