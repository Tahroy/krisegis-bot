const Sequelize = require('sequelize')

const sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    // SQLite only
    storage: 'database.sqlite',
})

const Event = sequelize.define('event', {
    id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true
    },
    guild: {
        type: Sequelize.STRING,
        allowNull: false
    },
    server: {
        type: Sequelize.STRING,
        allowNull: true
    },
    date: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    recalled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    name: {
        type: Sequelize.STRING,
        allowNull: true
    },
    serverName: {
        type: Sequelize.STRING,
        allowNull: true
    },
    description: {
        type: Sequelize.STRING,
        allowNull: true
    }
})

module.exports = Event