import {DataTypes, Model, Optional} from 'sequelize';
import sequelize from '../utils/database';

// Interface pour les attributs de Potion
interface PotionAttributes {
    id: number;
    name: string;
    user_id: string;
    ingredient_1: string;
    ingredient_2: string;
    ingredient_3: string;
    ingredient_4: string;
    ingredient_5: string;
}

// Interface pour la création (id est optionnel lors de la création)
interface PotionCreationAttributes extends Optional<PotionAttributes, 'id'> {
}

// Classe Potion pour le modèle
class Potion extends Model<PotionAttributes, PotionCreationAttributes> implements PotionAttributes {
    public id!: number;
    public name!: string;
    public user_id!: string;
    public ingredient_1!: string;
    public ingredient_2!: string;
    public ingredient_3!: string;
    public ingredient_4!: string;
    public ingredient_5!: string;

    // Timestamps (créé automatiquement si activé dans les options du modèle)
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

// Initialisation du modèle
Potion.init({
    id: {
        type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true,
    }, name: {
        type: DataTypes.STRING, allowNull: false,
    }, user_id: {
        type: DataTypes.STRING, allowNull: false,
    }, ingredient_1: {
        type: DataTypes.STRING, allowNull: false,
    }, ingredient_2: {
        type: DataTypes.STRING, allowNull: false,
    }, ingredient_3: {
        type: DataTypes.STRING, allowNull: false,
    }, ingredient_4: {
        type: DataTypes.STRING, allowNull: false,
    }, ingredient_5: {
        type: DataTypes.STRING, allowNull: false,
    },
}, {
    sequelize, // Instance de Sequelize
    modelName: 'Potion', // Nom du modèle
    timestamps: true, // Ajoute automatiquement les colonnes createdAt et updatedAt
});

export default Potion;
