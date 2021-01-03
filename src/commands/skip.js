module.exports = {
    name: 'skip',
    description: 'Skip la musique en cours.',
    usage: '',
    execute(message, args) {
        if (message.client.player.isPlaying(message)) {
            message.client.player.skip(message);
            return message.channel.send('Je skip la musique actuelle !');
        } else {
            return message.channel.send('Aucune musique en cours.');
        }
    },
};