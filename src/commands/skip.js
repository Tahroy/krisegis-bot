module.exports = {
    name: 'skip',
    description: 'Skip la musique en cours.',
    usage: '',
    execute(message, args) {
        message.client.player.skip(message);
        message.channel.send('On skip !');
    },
};