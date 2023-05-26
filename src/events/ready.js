const {version} = require('./../../config/config.json');
const cron = require("node-cron");
const Anniversaire = require("../database/Anniversaire");
const Variable = require("../database/Variable");
const Server = require("../database/Server");

module.exports = async function (client) {
    client.once('ready', async () => {
        console.log(`Krisegis V${version} prêt !`);
        await Variable.sync();
        await Server.sync();
    });
}