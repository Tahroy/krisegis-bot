module.exports = {
    name: 'play',
    description: 'Joue une musique',
    args: 1,
    usage: '<url>',
    execute(message, args) {
        if (message.client.player.isPlaying(message)) {
            message.client.player.resume(message);
        }
        message.client.player.play(message, args.join(' '), message.member.user);
        return message.channel.send(`La musique a été ajoutée !`);
    },
};