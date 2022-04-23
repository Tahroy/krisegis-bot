const {version} = require('./../../config/config.json');
const cron = require("node-cron");
const Anniversaire = require("../database/Anniversaire");
const Variable = require("../database/Variable");

module.exports = async function (client) {
    client.once('ready', async () => {
        console.log(`Krisegis V${version} prêt !`);

        Variable.sync();
        Anniversaire.sync();


        const annivs = await Anniversaire.findAll();

        async function addAnniversaire(data) {
            const serverID = data.get('server');
            const date = data.get('date');
            const userID = data.get('userId');

            const dataDate = date.split('-');
            const month = dataDate[1];
            const day = dataDate[2];

            const channelVariable = await Variable.findOne({where: {server: serverID, name: 'birthdayChannel'}});

            const channelID = channelVariable.get('data');

            const channel = await client.channels.fetch(channelID)
            const cible = ('<@!' + userID + '>');


            let task = cron.schedule(`* * ${day} ${month} *`, () => {
                channel.send(`Aujourd'hui c'est l'anniversaire de ${cible}, bravo !`);
            }, 'Europe/Paris');

            task.start();
        }

        annivs.forEach(addAnniversaire);

    });
}