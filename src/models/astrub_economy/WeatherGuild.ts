import {DataTypes, Model, Optional} from "sequelize";
import sequelize from '../../utils/database';

interface WeatherGuildAttributes {
    id: number;
    guildId: string;
    name: string;
    lastUpdate: Date;
}

type WeatherGuildCreationAttributes = Optional<WeatherGuildAttributes, 'id' | 'lastUpdate'>;

class WeatherGuild extends Model<WeatherGuildAttributes, WeatherGuildCreationAttributes> implements WeatherGuildAttributes {
    public id!: number;
    public guildId!: string;
    public name!: string;
    public lastUpdate!: Date;
}

WeatherGuild.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    guildId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    lastUpdate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: new Date()
    }
}, {
    sequelize,
    tableName: 'weathersGuild',
    timestamps: true,
});

export default WeatherGuild;