const Sequelize = require('sequelize');
const sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    // SQLite only
    storage: 'database.sqlite',
});

module.exports = sequelize.define('capture', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    rollUserId: {
        type: Sequelize.STRING,
        allowNull: false
    },
    catchUserId: {
        type: Sequelize.STRING,
        allowNull: true
    },
    monsterId : {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    monsterName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    catchDate: {
        type: Sequelize.DATE,
        allowNull: true
    }
});
