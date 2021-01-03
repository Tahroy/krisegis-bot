module.exports = {
    name: 'current',
    description: 'Musique actuelle',
    usage: '',
    execute(message, args) {
        if (message.client.player.isPlaying(message)) {
            let currentSong = message.client.player.nowPlaying(message);
            let progressBar = message.client.player.createProgressBar(message, { 'timecodes': true });

            // [Link text](http://example.com)
            let retour = currentSong.title + ' : ' + currentSong.url;
            message.channel.send(retour);
            return message.channel.send(progressBar);
        } else {
            message.reply(`Aucune musique en cours...`);
        }
    },
};