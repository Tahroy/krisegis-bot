import {Model, DataTypes, Optional, Op} from 'sequelize';
import sequelize from '../utils/database';
import Monster from "./Monster";
import Npc from "./Npc";
import {ActionRowBuilder, ButtonBuilder, EmbedBuilder, User} from "discord.js";
import {ButtonStyle} from "discord-api-types/v10";

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

Amél    public async getView(user: User): Promise<{
        embeds: EmbedBuilder[],
        files: string[],
        components: ActionRowBuilder<ButtonBuilder>[]
    }> {

        if (!this.catchDate) {
            throw new Error('Capture manquante !');
        }

        const imgName = this.monsterId ? `${this.monsterId}.png` : `${this.npcId}.png`;

        let name: string = await this.getName();
        let file: string = await this.getImage();

        const dateFr = this.catchDate.toLocaleDateString('fr-FR', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        })

        const before = await Capture.findOne({
            where: {
                id: {
                    [Op.lt]: this.id
                },
                guildId: this.guildId,
                catchUserId: user.id
            },
            order: [['id', 'DESC']]
        });
        const after = await Capture.findOne({
            where: {
                id: {
                    [Op.gt]: this.id
                },
                catchUserId: user.id,
                guildId: this.guildId
            },
            order: [['id', 'ASC']]
        });

        const updatedRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`osatopia-view-${user.id}_${before?.id ?? -1}`)
                    .setLabel('◀️ Précédent')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(before === null)
                ,
                new ButtonBuilder()
                    .setCustomId(`osatopia-view-${user.id}_${after?.id ?? 0}`)
                    .setLabel('▶️ Suivant')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(after === null)
            );

        const embed = new EmbedBuilder()
            .setTitle(`${name}`)
            .setDescription(`Capturé le ${dateFr}`)
            .setImage(`attachment://${imgName}`)

        return {
            embeds: [embed],
            files: [file],
            components: [updatedRow]
        }
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
