const { Sequelize, DataTypes } = require('sequelize');

// Créez une instance de Sequelize et configurez-la pour utiliser SQLite
const sequelize = new Sequelize({
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    // SQLite only
    storage: 'database.sqlite',
});

// Définissez le modèle Question
const Question = sequelize.define('Question', {
    question: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    answers: {
        type: DataTypes.JSON, // Utilisez le type JSON pour stocker un tableau d'answers
    },
    correctAnswer: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

module.exports = Question;