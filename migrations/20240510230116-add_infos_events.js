'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up (queryInterface, Sequelize) {
        /**
         * Add altering commands here.
         *
         * Example:
         * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
         */
        await queryInterface.addColumn('events', 'name', {
            type: Sequelize.STRING,
            allowNull: true
        })

        await queryInterface.addColumn('events', 'description', {
            type: Sequelize.STRING,
            allowNull: true
        })

        await queryInterface.addColumn('events', 'serverName', {
            type: Sequelize.STRING,
            allowNull: true

        })

    },

    async down (queryInterface, Sequelize) {
        /**
         * Add reverting commands here.
         *
         * Example:
         * await queryInterface.dropTable('users');
         */
    }
}
