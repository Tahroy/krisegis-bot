"use strict";
module.exports = {
    execute(client) {
        let player = client.player;
        player.on('error', (queue, error) => {
            console.log(error);
            console.log(`Erreur, bloup : ${error.message}`);
        });
        player.on('connectionError', (queue, error) => {
            console.log(error);
            console.log(`Erreur de connexion, bloup : ${error.message}`);
        });
        player.on('trackStart', (queue, track) => {
            queue.metadata.send(`Lancement de ${track.title} dans **${queue.connection.channel.name}** 🎧`);
        });
        player.on('trackAdd', (queue, track) => {
            queue.metadata.send(`Musique ${track.title} ajoutée ! ✅`);
        });
        player.on('botDisconnect', (queue) => {
            queue.metadata.send('On m\'a kick... :( ❌');
        });
        player.on('channelEmpty', (queue) => {
            queue.metadata.send('WESH Y\'A PERSONNE, J\`ME CASSE !... ❌');
        });
        player.on('queueEnd', (queue) => {
            queue.metadata.send('Plus de musiques ? Bisou ! ✅');
        });
    }
};
