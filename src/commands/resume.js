module.exports = {
    name: 'resume',
    description: '',
    usage: '',
    execute(message, args) {
        message.client.player.resume(message);
    },
};