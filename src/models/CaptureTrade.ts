import {DataTypes, Model, Optional} from 'sequelize';
import sequelize from '../utils/database';

interface CaptureTradeAttributes {
    id: number;
    user1Id: string;
    user2Id: string;
    capture1Id: number;
    capture2Id: number;
    status: string;
}

interface CaptureTradeCreationAttributes extends Optional<CaptureTradeAttributes, "id"> {}

class CaptureTrade extends Model<CaptureTradeAttributes, CaptureTradeCreationAttributes> implements CaptureTradeAttributes {
    public id!: number;
    public user1Id!: string;
    public user2Id!: string;
    public capture1Id!: number;
    public capture2Id!: number;
    public status!: string;
    public createdAt!: Date;
    public updatedAt!: Date;
}

CaptureTrade.init({
    id: {
        type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true
    }, user1Id: {
        type: DataTypes.STRING, allowNull: false
    }, user2Id: {
        type: DataTypes.STRING, allowNull: false
    }, capture1Id: {
        type: DataTypes.INTEGER, allowNull: false
    }, capture2Id: {
        type: DataTypes.INTEGER, allowNull: false
    }, status: {
        type: DataTypes.STRING, allowNull: false
    }
}, {
    sequelize, modelName: 'CaptureTrade', timestamps: true
});

export default CaptureTrade;