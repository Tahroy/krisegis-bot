import { Sequelize } from 'sequelize';
import path from "path";

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, './../../database.sqlite'), // Utilisation de __dirname pour construire un chemin absolu
    logging: false, // Désactiver les logs de Sequelize
});

export default sequelize;
