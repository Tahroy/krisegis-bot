import {DataTypes, Model, Optional} from 'sequelize';
import sequelize from '../utils/database';

// Interface pour les attributs de LoreElement
interface LoreElementAttributes {
    id: number;
    name: string;
    type: 'npc' | 'item' | 'document' | 'article';
    content: string | null;
}

// Interface pour la création (id est optionnel lors de la création)
interface LoreElementCreationAttributes extends Optional<LoreElementAttributes, 'id' | 'content'> {
}

// Classe LoreElement pour le modèle
class LoreElement extends Model<LoreElementAttributes, LoreElementCreationAttributes> implements LoreElementAttributes {
    public id!: number;
    public name!: string;
    public type!: 'npc' | 'item' | 'document' | 'article';
    public content!: string | null;

    // Timestamps (créés automatiquement si activé dans les options du modèle)
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

// Initialisation du modèle
LoreElement.init({
    id: {
        type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true,
    }, name: {
        type: DataTypes.STRING, allowNull: false,
    }, type: {
        type: DataTypes.ENUM('npc', 'item', 'document', 'article'), allowNull: false,
    }, content: {
        type: DataTypes.TEXT, allowNull: true,
    },
}, {
    sequelize, // Instance Sequelize
    modelName: 'LoreElement', // Nom du modèle
    timestamps: true, // Ajoute automatiquement createdAt et updatedAt
});

export default LoreElement;