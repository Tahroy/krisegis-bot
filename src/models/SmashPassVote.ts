import {DataTypes, Model, Optional} from 'sequelize';
import sequelize from '../utils/database';

export type SmashPassChoice = 'smash' | 'pass';

interface SmashPassVoteAttributes {
    id: number;
    roundId: number;
    userId: string;
    choice: SmashPassChoice;
}

type SmashPassVoteCreation = Optional<SmashPassVoteAttributes, 'id'>;

class SmashPassVote extends Model<SmashPassVoteAttributes, SmashPassVoteCreation> implements SmashPassVoteAttributes {
    public id!: number;
    public roundId!: number;
    public userId!: string;
    public choice!: SmashPassChoice;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

SmashPassVote.init({
    id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
    roundId: {type: DataTypes.INTEGER, allowNull: false},
    userId: {type: DataTypes.STRING, allowNull: false},
    choice: {type: DataTypes.ENUM('smash', 'pass'), allowNull: false},
}, {
    sequelize,
    timestamps: true,
    indexes: [
        {unique: true, fields: ['roundId', 'userId']}
    ]
});

export default SmashPassVote;
