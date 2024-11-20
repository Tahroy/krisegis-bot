import {DataTypes, Model} from 'sequelize';
import sequelize from '../utils/database';

// Interface pour les attributs de Participant
interface ParticipantAttributes {
    id: string; // ID de l'utilisateur
    event: string; // ID de l'événement
}

// Interface pour la création (tous les champs requis ici, aucun champ optionnel)
type ParticipantCreationAttributes = ParticipantAttributes;

// Classe Participant pour le modèle
class Participant extends Model<ParticipantAttributes, ParticipantCreationAttributes> implements ParticipantAttributes {
    public id!: string;
    public event!: string;

    // Timestamps (créés automatiquement si activé dans les options du modèle)
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

// Initialisation du modèle
Participant.init(
    {
        id: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
        },
        event: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
        },
    },
    {
        sequelize, // Instance Sequelize
        modelName: 'Participant', // Nom du modèle
        tableName: 'participants', // Nom de la table (optionnel)
        timestamps: true, // Ajoute automatiquement createdAt et updatedAt
    }
);

export default Participant;
