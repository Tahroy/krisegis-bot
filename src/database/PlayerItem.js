const Sequelize = require('sequelize')

/**
 * @name sequelize
 * @type {Sequelize}
 * @description The Sequelize instance for connecting to a database.
 *
 * @property {String} database - The name of the database to connect to.
 * @property {String} username - The username for authenticating the database connection.
 * @property {String} password - The password for authenticating the database connection.
 * @property {Object} options - The options for configuring the Sequelize instance.
 * @property {String} options.host - The host of the database server.
 * @property {String} options.dialect - The dialect of the database to be used.
 * @property {Boolean} options.logging - Whether logging should be enabled or not. Default is false.
 * @property {String} options.storage - The path to the SQLite database file. Only applicable for SQLite databases.
 */
const sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    // SQLite only
    storage: 'database.sqlite',
})

/**
 *
 */
const PlayerItem = sequelize.define('PlayerItem', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    user_id: {
        type: Sequelize.STRING,
        allowNull: false
    },
    quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    type: {
        type: Sequelize.STRING,
        allowNull: false
    }
})

module.exports = PlayerItem