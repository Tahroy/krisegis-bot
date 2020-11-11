const logger = require("../../index");

module.exports = {
    name: 'role',
    description: 'Ajoute ou supprime un rôle à un utilisateur',
    args: 3,
    usage: `<add|remove> <tag> <role>`,
    guildOnly: true,
    admin: true,
    execute(message, args) {
        const member = message.mentions.members.first();
        const addRemove = args.shift();
        args.shift();
        const roleName = args.join(' ');

        if (addRemove === 'add') {
            if (member.roles.cache.some(role => role.name.startsWith(roleName))) {
                return message.reply('Cet utilisateur possède déjà ce rôle !');
            }
            const role = message.guild.roles.cache.find(role => role.name.startsWith(roleName));

            if (role) {
                member.roles.add(role);
                return message.channel.send(`Le rôle a été ajouté !`);
            } else {
                return message.reply('Aucun rôle ajouté, vérifiez l\'orthographe.');
            }
        } else if (addRemove === 'remove') {
            if (!member.roles.cache.some(role => role.name.startsWith(roleName))) {
                return message.reply('Cet utilisateur ne possède pas ce rôle !');
            }

            const role = message.guild.roles.cache.find(role => role.name.startsWith(roleName));

            if (role) {
                member.roles.remove(role);
                return message.channel.send(`Le rôle a été retiré !`);
            } else {
                return message.reply('Aucun rôle retiré, vérifiez l\'orthographe.');
            }
        } else {
            return message.reply(`Mauvaise utilisation de la commande. :()`);
        }
    },
};