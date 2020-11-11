module.exports = {
    name: 'kick',
    description: 'Permet de retirer un membre du serveur.',
    args: 1,
    usage: `<tag>`,
    guildOnly: true,
    admin: true,
    execute(message, args) {
        const member = message.mentions.members.first();
        member.kick();
        return message.reply(`Tu as kick ${member.user.username} du serveur !`);
    },
};