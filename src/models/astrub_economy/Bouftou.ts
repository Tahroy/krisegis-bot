interface BouftouAttributes {
    id: number;
    name: string;
    guildId: string;
    feedUntil: Date;
    
}

/*
const Bouftou = sequelize.define('Bouftou', {
    ownerId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    farmId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    feedUntil: {
        type: DataTypes.DATE,
        allowNull: true // Jusqu'à quand il est nourri
    },
    woolStock: {
        type: DataTypes.INTEGER,
        defaultValue: 0 // Stock de laine cumulée
    }
});
 */