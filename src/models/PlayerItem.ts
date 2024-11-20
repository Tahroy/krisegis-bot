import {DataTypes, Model, Optional} from 'sequelize';
import sequelize from '../utils/database';


// Interface pour les attributs de PlayerItem
interface PlayerItemAttributes {
    id: number;       // ID de l'item
    name: string;     // Nom de l'item
    user_id: string;  // ID de l'utilisateur
    quantity: number; // Quantité
    type: string;     // Type d'item
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
    },
    {
        sequelize, // Instance Sequelize
        modelName: 'PlayerItem', // Nom du modèle
        timestamps: true, // Ajoute automatiquement createdAt et updatedAt
    }
);

export default PlayerItem;