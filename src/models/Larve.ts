import {DataTypes, Model, Optional} from 'sequelize';
import sequelize from '../utils/database';

interface LarveAttributes {
    name: string;
    nb: number;
}

interface LarveCreationAttributes extends Optional<LarveAttributes, 'name'> {
}

class Larve extends Model<LarveAttributes, LarveCreationAttributes> implements LarveAttributes {
    public name!: string;
    public nb!: number;
}

Larve.init({
    name: {
        type: DataTypes.STRING, primaryKey: true
    }, nb: {
        type: DataTypes.INTEGER
    }
}, {
    sequelize, modelName: 'larve', timestamps: false
});
export default Larve