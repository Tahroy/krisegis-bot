import {DataTypes, Model, Optional} from 'sequelize';
import sequelize from '../utils/database';

interface EventAttributes {
    id: string;
    guild: string;
    server: string | null;
    date: number;
    recalled: boolean;
    name: string | null;
    serverName: string | null;
    description: string | null;
}

interface EventCreationAttributes extends Optional<EventAttributes, 'id'> {
}

class Event extends Model<EventAttributes, EventCreationAttributes> implements EventAttributes {
    public id!: string;
    public guild!: string;
    public server!: string;
    public date!: number;
    public recalled!: boolean;
    public name!: string | null;
    public serverName!: string | null;
    public description!: string | null;
}

Event.init({
    id: {
        type: DataTypes.STRING, allowNull: false, primaryKey: true
    }, guild: {
        type: DataTypes.STRING, allowNull: false
    }, server: {
        type: DataTypes.STRING, allowNull: true
    }, date: {
        type: DataTypes.INTEGER, allowNull: false
    }, recalled: {
        type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false
    }, name: {
        type: DataTypes.STRING, allowNull: true
    }, serverName: {
        type: DataTypes.STRING, allowNull: true
    }, description: {
        type: DataTypes.STRING, allowNull: true
    }
}, {
    sequelize, modelName: 'event', timestamps: true
});

export default Event