const Sequelize = require('sequelize');
const sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    // SQLite only
    storage: 'database.sqlite',
});

const Variable = sequelize.define('variable', {
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true
    },
    data: {
        type: Sequelize.STRING,
        allowNull: false
    },
    server: {
        type: Sequelize.STRING,
        allowNull: true,
        primaryKey: true
    },
});

module.exports = Variable;