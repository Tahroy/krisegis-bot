import {Model, DataTypes, Optional} from 'sequelize';
import sequelize from '../utils/database';
import Monster from "./Monster";
import Npc from "./Npc";

interface CaptureAttributes {
    id: number;
    rollUserId: string;
    catchUserId?: string | null;
    monsterId: number | null;
    /**
     * @deprecated
     */
    monsterName: string | null;
    catchDate?: Date | null;
    guildId: string;
    npcId: number | null;

}

interface CaptureCreationAttributes extends Optional<CaptureAttributes, 'id' | 'catchUserId' | 'catchDate'> {
}

class Capture extends Model<CaptureAttributes, CaptureCreationAttributes> implements CaptureAttributes {
    public id!: number;
    public rollUserId!: string;
    public catchUserId!: string | null;
    public monsterId!: number | null;
    /**
     * @deprecated
     */
    public monsterName!: string | null;
    public catchDate!: Date | null;
    public guildId!: string;
    public npcId!: number | null;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public async getName(): Promise<string> {
        if (this.npcId) {
            const npc = await Npc.findOne({where: {id: this.npcId}})
            return npc?.name ?? '';
        }

        if (this.monsterId) {
            const monster = await Monster.findOne({where: {id: this.monsterId}})
            return monster?.name ?? '';
        }

        return '';
    }

    public async getImage(): Promise<string> {
        let imageUrl = '';
        if (this.npcId) {
            const npc = await Npc.findOne({ where: { id: this.npcId } });
            if (npc) {
                imageUrl = await npc.getImage();
            }
        }

        if (!imageUrl && this.monsterId) {
            const monster = await Monster.findOne({ where: { id: this.monsterId } });
            if (monster) {
                imageUrl = await monster.getImage();
            }
        }

        return imageUrl;
    }

}

Capture.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        rollUserId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        catchUserId: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        monsterId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        monsterName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        catchDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        guildId: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 0
        },
        npcId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'captures',
        timestamps: true,
    }
);

Capture.belongsTo(Monster, { as: 'monster', foreignKey: 'monsterId' });
Capture.belongsTo(Npc, { as: 'npc', foreignKey: 'npcId' });
export default Capture;
