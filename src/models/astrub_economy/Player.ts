import {
    DataTypes,
    Model,
    Optional,
    Association,
    HasManyGetAssociationsMixin,
    HasManyAddAssociationMixin,
    HasManyHasAssociationMixin,
    HasManyCountAssociationsMixin,
    HasManyCreateAssociationMixin,
    ForeignKey
} from "sequelize";
import sequelize from '../../utils/database';
import Job from "./Job";

interface PlayerAttributes {
    id: number;
    userId: string;
    guildId: string;
    lastHarvest: Date | null;
}

type PlayerCreationAttributes = Optional<PlayerAttributes, 'id' | 'lastHarvest'>;

class Player extends Model<PlayerAttributes, PlayerCreationAttributes> implements PlayerAttributes {
    public id!: number;
    public userId!: string;
    public guildId!: string;
    public lastHarvest!: Date | null;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public getJobs!: HasManyGetAssociationsMixin<Job>;
    public addJob!: HasManyAddAssociationMixin<Job, number>;
    public hasJob!: HasManyHasAssociationMixin<Job, number>;
    public countJobs!: HasManyCountAssociationsMixin;
    public createJob!: HasManyCreateAssociationMixin<Job>;
    public readonly jobs?: Job[];

    public static associations: {
        jobs: Association<Player, Job>;
    };

    async getJob(jobName: string): Promise<Job> {
        const myJob = await Job.findOne({
            where: {
                name: jobName,
                user_id: this.userId,
                guildId: this.guildId
            }
        });

        if (myJob) {
            return myJob;
        }

        return await Job.create({
            name: jobName,
            user_id: this.userId,
            guildId: this.guildId,
            level: 1,
            experience: 0
        });
    }
}

Player.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        guildId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        lastHarvest: {
            type: DataTypes.DATE,
            allowNull: true,
        }
    }, {
        sequelize,
        modelName: "Player",
        tableName: "players",
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['userId', 'guildId']
            }
        ]
    }
);

Player.hasMany(Job, {
    foreignKey: 'user_id',
    as: 'jobs',
    onDelete: 'CASCADE'
});

export default Player;