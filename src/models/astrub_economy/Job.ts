import {DataTypes, Model, Optional} from "sequelize";
import sequelize from '../../utils/database';

import {JobEnum, RessourcesEnum} from "./Enums";

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

    getRessource(): string | undefined {
        switch (this.name) {
            case JobEnum.MINEUR:
                return RessourcesEnum.FER;
            case JobEnum.BUCHERON:
                return RessourcesEnum.FRENE
            case JobEnum.PAYSAN:
                return RessourcesEnum.BLE
            case JobEnum.ALCHIMISTE:
                return RessourcesEnum.ORTIE
            case JobEnum.PECHEUR:
                return RessourcesEnum.GOUJON
        }

        return undefined
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

