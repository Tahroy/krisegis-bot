const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    // SQLite only
    storage: 'database.sqlite',
});

const Role = sequelize.define('server', {
    id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true
    },
    game: {
        type: Sequelize.STRING,
        allowNull: true
    },
    guild: {
        type: Sequelize.STRING,
        allowNull: false,
    }
});

module.exports = Role;