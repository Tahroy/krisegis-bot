module.exports = {
    name: 'pause',
    description: 'Met en pause la musique actuelle.',
    usage: '',
    execute(message, args) {
        if (message.client.player.isPlaying(message)) {
            message.client.player.pause(message);
            return message.channel.send(`Musique en pause.`);
        } else {
            return message.channel.send('Aucune musique en cours.');
        }
    },
};