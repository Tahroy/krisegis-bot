module.exports = {
    name: 'play',
    description: 'Joue une musique',
    args: 1,
    usage: '<url>',
    execute(message, args) {
        message.client.player.play(message, args[0], message.member.user);
    },
};