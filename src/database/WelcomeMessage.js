const { Sequelize, DataTypes } = require('sequelize')

// Créez une instance de Sequelize et configurez-la pour utiliser SQLite
const sequelize = new Sequelize({
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    // SQLite only
    storage: 'database.sqlite',
})

// Définissez le modèle WelcomeMessage
const WelcomeMessage = sequelize.define('WelcomeMessage', {
    message: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    guild: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "185464480346537984"
    }
})

module.exports = WelcomeMessage