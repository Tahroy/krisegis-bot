import {DataTypes, Model, Optional} from 'sequelize';
import sequelize from '../utils/database';

export enum PetType {
    CHACHA = 'Chacha',
    BWAK = 'Bwak',
    TOFU = 'Tofu',
    GOBELIN = 'Gobelin',
    BOUFTOU = 'Bouftou',
    MINIKRONE = 'Minikrone',
}

interface PetAttributes {
    id: number;
    userId: string;
    guildId: string;
    name: string;
    type: PetType;
    isAlive: boolean;
    lastFeedAt: Date | null;    // Pour calculer la nourriture en temps réel
    lastCleanAt: Date | null;   // Pour calculer l'hygiène en temps réel
    lastPlayAt: Date | null;    // Pour calculer le bonheur en temps réel
    lastBeggedAt: Date | null;  // Pour éviter le spam de quémandage
    energy: number; // 0..100
    lives: number; // PV (0..10)
    level: number; // (1..100)
}

type PetCreationAttributes = Optional<
    PetAttributes,
    'id' | 'isAlive' | 'lastFeedAt' | 'lastCleanAt' | 'lastPlayAt' | 'lastBeggedAt' | 'energy' | 'lives' | 'level'
>;

class Pet extends Model<PetAttributes, PetCreationAttributes> implements PetAttributes {
    public id!: number;
    public userId!: string;
    public guildId!: string;
    public name!: string;
    public type!: PetType;
    public isAlive!: boolean;
    public lastFeedAt!: Date | null;
    public lastCleanAt!: Date | null;
    public lastPlayAt!: Date | null;
    public lastBeggedAt!: Date | null;
    public energy!: number;
    public lives!: number;
    public level!: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Pet.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    guildId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM(...Object.values(PetType)),
        allowNull: false,
    },
    isAlive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    lastFeedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
    },
    lastCleanAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
    },
    lastPlayAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
    },
    lastBeggedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
    },
    energy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 100,
    },
    lives: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 10,
    },
    level: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    }
}, {
    sequelize,
    modelName: 'Pet',
    tableName: 'pets',
    timestamps: true,
    indexes: [
        {fields: ['guildId']},
        {fields: ['userId']},
        {unique: true, fields: ['guildId', 'name']},
    ],
});

export default Pet;