module.exports = {
    name: 'play',
    description: '',
    args: 1,
    usage: '',
    execute(message, args) {
        message.client.player.play(message, args[0], message.member.user);
    },
};