import {
    DataTypes,
    Model,
    Optional,
    BelongsToGetAssociationMixin,
    BelongsToSetAssociationMixin,
    BelongsToCreateAssociationMixin,
    Association
} from 'sequelize';
import sequelize from '../utils/database';
import Player from "./astrub_economy/Player";


// Interface pour les attributs de PlayerItem
interface PlayerItemAttributes {
    id: number;       // ID de l'item
    name: string;     // Nom de l'item
    userId: string;
    quantity: number; // Quantité
    type: string;     // Type d'item
    guildId: string;
    durability?: number | null;
}

// Interface pour la création (exclut `id` car il est auto-incrémenté)
type PlayerItemCreationAttributes = Optional<PlayerItemAttributes, 'id'>;

// Classe PlayerItem pour le modèle
class PlayerItem extends Model<PlayerItemAttributes, PlayerItemCreationAttributes> implements PlayerItemAttributes {
    public id!: number;
    public name!: string;
    public userId!: string;
    public quantity!: number;
    public type!: string;
    public guildId!: string;
    public durability?: number | null;

    public getPlayer!: BelongsToGetAssociationMixin<Player>;
    public setPlayer!: BelongsToSetAssociationMixin<Player, number>;
    public createPlayer!: BelongsToCreateAssociationMixin<Player>;

    public readonly player?: Player;

    public static associations: {
        player: Association<PlayerItem, Player>;
    };

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

// Initialisation du modèle
PlayerItem.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        userId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        guildId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        durability: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        sequelize, // Instance Sequelize
        modelName: 'PlayerItem', // Nom du modèle
        tableName: 'player_items',
        timestamps: true, // Ajoute automatiquement createdAt et updatedAt
        indexes: [
            {
                unique: true,
                fields: ['userId', 'guildId', 'name']
            }
        ]
    }
);

export default PlayerItem;