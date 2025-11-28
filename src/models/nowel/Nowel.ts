import { DataTypes, Model } from 'sequelize';
import sequelize from '../../utils/database';

class Nowel extends Model {
    public userId!: string;
    public guildId!: string;
    public remainingThrows!: number;
    public remainingHP!: number;
}

Nowel.init({
    userId: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    guildId: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    remainingThrows: {
        type: DataTypes.INTEGER,
        defaultValue: 5,
        allowNull: false,
    },
    remainingHP: {
        type: DataTypes.INTEGER,
        defaultValue: 5,
        allowNull: false,
    },
}, {
    sequelize,
    modelName: 'Nowel',
    tableName: 'nowel',
});

export default Nowel;
