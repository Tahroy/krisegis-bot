import {DataTypes, Model, Optional} from "sequelize";
import sequelize from '../../utils/database';
import Job from "./Job";

interface PlayerAttributes {
    id: string;
    lastHarvest: Date;
}

type PlayerCreationAttributes = Optional<PlayerAttributes, 'lastHarvest'>;

class Player extends Model<PlayerAttributes, PlayerCreationAttributes> implements PlayerAttributes{
    public id!: string;
    public lastHarvest!: Date;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    async getJob(job: string): Promise<Job> {
        const myJob = await Job.findOne({
            where: {
                name: job,
                user_id: this.id
            }
        })

        if (myJob) {
            return myJob;
        }

        return await Job.create({
            name: job,
            user_id: this.id,
            level: 1,
            experience: 0
        })
    }
}

Player.init(
    {
        id: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
            autoIncrement: false
        },
        lastHarvest: {
            type: DataTypes.DATE,
        }
    }, {
        sequelize,
        modelName: "Player",
        tableName: "players",
        timestamps: true
    }
)

export default Player;

