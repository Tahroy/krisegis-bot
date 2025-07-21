import {DataTypes, Model, Optional} from "sequelize";
import sequelize from '../../utils/database';

interface PopulationAttributes {
    id: number;
    guildId: string;
    population: number;
    maxPopulation: number;
    happiness: number;
    lastUpdate: Date;
}

type PopulationCreationAttributes = Optional<PopulationAttributes, 'id' | 'population' | 'happiness' | 'lastUpdate'>;

class Population extends Model<PopulationAttributes, PopulationCreationAttributes> implements PopulationAttributes {
    public id!: number;
    public guildId!: string;
    public population!: number;
    public maxPopulation!: number;
    public happiness!: number;
    public lastUpdate!: Date;
}

Population.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    guildId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    population: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 100
    },
    maxPopulation: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 200
    },
    happiness: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 50 // Default neutral happiness
    },
    lastUpdate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize,
    modelName: 'Population',
    tableName: 'populations',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['guildId']
        }
    ]
})

export default Population;
