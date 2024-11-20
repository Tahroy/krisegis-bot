import { DataTypes, Model } from 'sequelize';
import sequelize from '../utils/database';

// Interface pour les attributs de WelcomeMessage
interface WelcomeMessageAttributes {
    message: string;  // Message de bienvenue
    guild: string;    // ID du serveur (guild)
}

// Classe WelcomeMessage pour le modèle
class WelcomeMessage extends Model<WelcomeMessageAttributes> implements WelcomeMessageAttributes {
    public message!: string;
    public guild!: string;

    // Timestamps (créés automatiquement si activé dans les options du modèle)
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

// Initialisation du modèle
WelcomeMessage.init(
    {
        message: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        guild: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "185464480346537984", // Valeur par défaut
        },
    },
    {
        sequelize, // Instance Sequelize
        modelName: 'WelcomeMessage', // Nom du modèle
        timestamps: true, // Ajoute automatiquement createdAt et updatedAt
    }
);

export default WelcomeMessage;
