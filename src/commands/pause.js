module.exports = {
    name: 'pause',
    description: '',
    usage: '',
    execute(message, args) {
        message.client.player.pause(message);
    },
};