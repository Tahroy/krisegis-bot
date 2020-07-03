module.exports = {
    name: 'delete',
    description: 'Supprimer X messages (1er argument)',
    execute(message, args) {
        if (!args[0]) {
            return message.reply('Vous devez indiquer un nombre de message à supprimer !');
        }
        const nombreMessages = args[0];
        message.channel.bulkDelete(nombreMessages);
        return message.channel.send(`${nombreMessages} messages ont été supprimés !`);
    },
};