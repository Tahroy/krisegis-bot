import {DataTypes, Model, Optional} from 'sequelize';
import sequelize from '../utils/database';

interface ServerAttributes {
    id: string;        // ID du serveur
    game?: string;     // Jeu associé (facultatif)
    guild: string;     // ID de la guilde
    tag: string;       // Tag du rôle serveur
    channel?: string;  // ID du canal (facultatif)
    name?: string;     // Nom du serveur (facultatif)
}

// Interface pour la création (exclut `id` car il doit être fourni manuellement)
type ServerCreationAttributes = Optional<ServerAttributes, 'game' | 'channel' | 'name'>;

// Classe Server pour le modèle
class Server extends Model<ServerAttributes, ServerCreationAttributes> implements ServerAttributes {
    public id!: string;
    public game?: string;
    public guild!: string;
    public tag!: string;
    public channel?: string;
    public name?: string;

    // Timestamps (ajoutés automatiquement si activé dans les options du modèle)
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

// Initialisation du modèle
Server.init({
    id: {
        type: DataTypes.STRING, allowNull: false, primaryKey: true,
    }, game: {
        type: DataTypes.STRING, allowNull: true,
    }, guild: {
        type: DataTypes.STRING, allowNull: false,
    }, tag: {
        type: DataTypes.STRING, allowNull: false,
    }, channel: {
        type: DataTypes.STRING, allowNull: true,
    }, name: {
        type: DataTypes.STRING, allowNull: true,
    },
}, {
    sequelize, // Instance Sequelize
    modelName: 'Server', // Nom du modèle
    timestamps: true, // Ajoute automatiquement createdAt et updatedAt
});

export default Server;
