module.exports = {
    name: 'resume',
    description: 'Relance la musique dans la queue.',
    usage: '',
    execute(message, args) {
        if (message.client.player.isPlaying(message)) {
            message.client.player.resume(message);
            return message.channel.send(`Je relance la musique !`);
        } else {
            return message.channel.send(`Mouais, t'es un peu idiot toi. Aucune musique en pause ou en cours.`);
        }
    },
};