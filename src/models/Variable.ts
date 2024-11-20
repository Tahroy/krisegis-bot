import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../utils/database';

// Interface pour les attributs de Variable
interface VariableAttributes {
    name: string;    // Nom de la variable
    data: string;    // Données de la variable
    server?: string; // Serveur associé (facultatif)
}

// Interface pour la création (exclut `server` car il est facultatif)
type VariableCreationAttributes = Optional<VariableAttributes, 'server'>;

// Classe Variable pour le modèle
class Variable extends Model<VariableAttributes, VariableCreationAttributes> implements VariableAttributes {
    public name!: string;
    public data!: string;
    public server?: string;

    // Timestamps (ajoutés automatiquement si activé dans les options du modèle)
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

// Initialisation du modèle
Variable.init(
    {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
        },
        data: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        server: {
            type: DataTypes.STRING,
            allowNull: true,
            primaryKey: true,  // Vous avez défini 'server' comme partie de la clé primaire
        },
    },
    {
        sequelize, // Instance Sequelize
        modelName: 'Variable', // Nom du modèle
        timestamps: true, // Ajoute automatiquement createdAt et updatedAt
    }
);

export default Variable;