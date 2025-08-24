import {DataTypes, Model, Optional} from "sequelize";
import sequelize from '../../utils/database';

import {JobEnum} from "./Enums";

interface JobAttributes {
    id: number;
    name: string;
    userId: string;
    guildId: string;
    level: number;
    experience: number;
    createdAt: Date;
    updatedAt: Date;
}

type JobCreationAttributes = Optional<JobAttributes, 'id' | 'experience' | 'createdAt' | 'updatedAt'>

class Job extends Model<JobAttributes, JobCreationAttributes> implements JobAttributes {
    public id!: number;
    public name!: string;
    public userId!: string;
    public guildId!: string;
    public level!: number;
    public experience!: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static getEmoji(job: string): string {
        switch (job) {
            case JobEnum.ALCHIMISTE:
                return "🧪";
            case JobEnum.BUCHERON:
                return "🪓";
            case JobEnum.MINEUR:
                return "⛏️";
            case JobEnum.PAYSAN:
                return "🌾";
            case JobEnum.PECHEUR:
                return "🎣";
            default:
                return "❓";
        }
    }
}

Job.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        userId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        guildId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        level: {
            type: DataTypes.INTEGER,
        },
        experience: {
            type: DataTypes.INTEGER,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    },
    {
        sequelize,
        modelName: 'Job',
        tableName: 'jobs',
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['userId', 'guildId', 'name']
            }
        ]
    }
)

export default Job;