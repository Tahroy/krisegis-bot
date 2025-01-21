import {DataTypes, Model} from "sequelize";
import sequelize from '../../utils/database';

interface PlayerHouseAttributes {
    type: string;
    user_id: string;
    level: number;
}

type PlayerHouseCreationAttributes = Partial<PlayerHouseAttributes>

class PlayerHouse extends Model<PlayerHouseAttributes, PlayerHouseCreationAttributes> implements PlayerHouseAttributes {
    public type!: string;
    public user_id!: string;
    public level!: number;
}

PlayerHouse.init(
    {
        type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        user_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        level: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    },
    {
        sequelize,
        modelName: 'PlayerHouse',
        tableName: 'player_houses',
        timestamps: true
    }
)

export default PlayerHouse

