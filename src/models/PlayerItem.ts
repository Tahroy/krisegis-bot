import {
    DataTypes,
    Model,
    Optional,
    ForeignKey,
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
    user_id: ForeignKey<Player['userId']>;  // ID de l'utilisateur
    quantity: number; // Quantité
    type: string;     // Type d'item
    guildId: string;
}

// Interface pour la création (exclut `id` car il est auto-incrémenté)
type PlayerItemCreationAttributes = Optional<PlayerItemAttributes, 'id'>;

// Classe PlayerItem pour le modèle
class PlayerItem extends Model<PlayerItemAttributes, PlayerItemCreationAttributes> implements PlayerItemAttributes {
    public id!: number;
    public name!: string;
    public user_id!: string;
    public quantity!: number;
    public type!: string;
    public guildId!: string;

    public getPlayer!: BelongsToGetAssociationMixin<Player>;
    public setPlayer!: BelongsToSetAssociationMixin<Player, number>;
    public createPlayer!: BelongsToCreateAssociationMixin<Player>;

    public readonly player?: Player;

    public static associations: {
        player: Association<PlayerItem, Player>;
    };

    // Timestamps (créés automatiquement si activé dans les options du modèle)
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
        user_id: {
            type: DataTypes.STRING,
            allowNull: false,
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

    },
    {
        sequelize, // Instance Sequelize
        modelName: 'PlayerItem', // Nom du modèle
        tableName: 'player_items',
        timestamps: true, // Ajoute automatiquement createdAt et updatedAt
        indexes: [
            {
                unique: true,
                fields: ['user_id', 'guildId', 'name']
            }
        ]
    }
);

PlayerItem.belongsTo(Player, {
    foreignKey: 'user_id',
    as: 'player',
    onDelete: 'CASCADE'
});

export default PlayerItem;