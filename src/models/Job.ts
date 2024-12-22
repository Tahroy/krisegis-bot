import {DataTypes, Model, Optional} from "sequelize";
import sequelize from '../utils/database';

interface JobAttributes {
    id: number;
    name: string;
    user_id: string;
    level: number;
    experience: number;
}

type JobCreationAttributes = Optional<JobAttributes, 'id' | 'experience'>

class Job extends Model<JobAttributes, JobCreationAttributes> implements JobAttributes {
    public id!: number;
    public name!: string;
    public user_id!: string;
    public level!: number;
    public experience!: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    getRessource(): "Fer" | "Frêne" | "Blé" | "Ortie" | null {
        switch (this.name) {
            case 'mineur':
                return "Fer";
            case 'bucheron':
                return "Frêne"
            case 'paysan':
                return "Blé"
            case "alchimiste":
                return "Ortie";
            default:
                return null;
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
        user_id: {
            type: DataTypes.STRING
        },
        level: {
            type: DataTypes.INTEGER,
        },
        experience: {
            type: DataTypes.INTEGER,
        }
    },
    {
        sequelize,
        modelName: 'Job',
        tableName: 'jobs',
        timestamps: true
    }
)

export default Job;

enum JobEnum {
    MINEUR = "mineur",
    BUCHERON = "bucheron",
    PAYSAN = "paysan",
    ALCHIMISTE = "alchimiste"
}

export {JobEnum};