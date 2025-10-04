import {DataTypes, Model, Optional} from 'sequelize';
import sequelize from '../../utils/database';

interface BouftonnerieStateAttributes {
  id: number;
  guildId: string;
  capacity: number;
}

type BouftonnerieStateCreationAttributes = Optional<BouftonnerieStateAttributes, 'id' | 'capacity'>;

class BouftonnerieState extends Model<BouftonnerieStateAttributes, BouftonnerieStateCreationAttributes> implements BouftonnerieStateAttributes {
  public id!: number;
  public guildId!: string;
  public capacity!: number;
}

BouftonnerieState.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    guildId: { type: DataTypes.STRING, allowNull: false, unique: true },
    capacity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 3 },
  },
  {
    sequelize,
    modelName: 'BouftonnerieState',
    tableName: 'bouftonnerie_states',
    timestamps: true,
  }
);

export default BouftonnerieState;
