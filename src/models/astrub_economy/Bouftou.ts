import {DataTypes, Model, Optional} from 'sequelize';
import sequelize from '../../utils/database';

interface BouftouAttributes {
    id: number;
    userId: string;
    guildId: string;
    name: string;
    emoji: string;
    isAlive: boolean;
    feedCountToday: number; // 0..3
    livesLost: number; // 0..3
    lastFeedAt: Date | null; // dernière date de nourrissage
}

type BouftouCreationAttributes = Optional<BouftouAttributes, 'id' | 'isAlive' | 'feedCountToday' | 'livesLost' | 'lastFeedAt'>;

class Bouftou extends Model<BouftouAttributes, BouftouCreationAttributes> implements BouftouAttributes {
    public id!: number;
    public userId!: string;
    public guildId!: string;
    public name!: string;
    public emoji!: string;
    public isAlive!: boolean;
    public feedCountToday!: number;
    public livesLost!: number;
    public lastFeedAt!: Date | null;
}

Bouftou.init({
    id: {
        type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true,
    }, userId: {
        type: DataTypes.STRING, allowNull: false,
    }, guildId: {
        type: DataTypes.STRING, allowNull: false,
    }, name: {
        type: DataTypes.STRING(50), allowNull: false,
    }, emoji: {
        type: DataTypes.STRING(50), allowNull: false
    }, isAlive: {
        type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true,
    }, feedCountToday: {
        type: DataTypes.INTEGER, allowNull: false, defaultValue: 0,
    }, livesLost: {
        type: DataTypes.INTEGER, allowNull: false, defaultValue: 0,
    }, lastFeedAt: {
        type: DataTypes.DATE, allowNull: true, defaultValue: null,
    },
}, {
    sequelize,
    modelName: 'Bouftou',
    tableName: 'bouftous',
    timestamps: true,
    indexes: [{fields: ['guildId']}, {fields: ['userId']}, {unique: true, fields: ['guildId', 'name']},],
});

export default Bouftou;
