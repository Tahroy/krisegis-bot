import {Model, DataTypes, Optional} from 'sequelize';
import sequelize from '../utils/database';
import Monster from "./Monster";

interface CaptureAttributes {
    id: number;
    rollUserId: string;
    catchUserId?: string | null;
    monsterId: number;
    /**
     * @deprecated
     */
    monsterName: string;
    catchDate?: Date | null;
    guildId: string;
}

interface CaptureCreationAttributes extends Optional<CaptureAttributes, 'id' | 'catchUserId' | 'catchDate'> {
}

class Capture extends Model<CaptureAttributes, CaptureCreationAttributes> implements CaptureAttributes {
    public id!: number;
    public rollUserId!: string;
    public catchUserId!: string | null;
    public monsterId!: number;
    /**
     * @deprecated
     */
    public monsterName!: string;
    public catchDate!: Date | null;
    public guildId!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Capture.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        rollUserId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        catchUserId: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        monsterId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        monsterName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        catchDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        guildId: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 0
        }
    },
    {
        sequelize,
        tableName: 'captures',
        timestamps: true,
    }
);

Capture.belongsTo(Monster, {
    foreignKey: 'monsterId',
    as: 'monster',
});

export default Capture;
