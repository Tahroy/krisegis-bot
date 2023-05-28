const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    // SQLite only
    storage: 'database.sqlite',
});

const Participant = sequelize.define('participant', {
    id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true
    },
    event: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true
    }
});

module.exports = Participant;