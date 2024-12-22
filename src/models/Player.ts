import {DataTypes, Model, Optional} from "sequelize";
import sequelize from '../utils/database';

interface PlayerAttributes {
    id: string;
    lastHarvest: Date;
}

type PlayerCreationAttributes = Optional<PlayerAttributes, 'lastHarvest'>;

class Player extends Model<PlayerAttributes, PlayerCreationAttributes> implements PlayerAttributes{
    public id!: string;
    public lastHarvest!: Date;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Player.init(
    {
        id: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
            autoIncrement: false
        },
        lastHarvest: {
            type: DataTypes.DATE,
        }
    }, {
        sequelize,
        modelName: "Player",
        tableName: "players",
        timestamps: true
    }
)

export default Player;

