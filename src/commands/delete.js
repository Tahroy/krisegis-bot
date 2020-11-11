const logger = require("../../index");

module.exports = {
    name: 'delete',
    description: 'Supprimer X messages (1er argument)',
    args: 1,
    usage: `<nombre>`,
    guildOnly: true,
    admin: true,
    execute(message, args) {
        const nombreMessages = Number.parseInt(args[0]);

        if (nombreMessages > 50 || nombreMessages < 1 || !Number.isInteger(nombreMessages)) {
            return message.reply('Vous devez mettre un nombre entre 1 et 50.');
        }

        try {
            message.channel.bulkDelete(nombreMessages + 1);
            logger.info(`${message.author.username} a supprimé ${nombreMessages} messages`);
            return message.channel.send(`${nombreMessages} messages ont été supprimés !`);
        } catch (error) {
            message.reply('Je n\'ai pas réussi à supprimer ces messages. :(');
        }

    },
};