module.exports = {
    name: 'infos',
    description: 'Permet d\'obtenir des informations sur un élément.',
    args: 1,
    usage: '<element> (server, me, user) <arg_facultatif> (tag)',
    execute(message, args) {
        switch (args[0]) {
            case 'server':
                const guilde = message.guild;
                return message.channel.send(`**Serveur** : ${guilde.name}\n**Total membres** : ${guilde.memberCount}`);
            case 'me':
                const auteur = message.author;
                return message.channel.send(`**Membre** : ${auteur.username}\n**ID** : ${auteur.id}`);
            case 'user':
                if (!args[1]) {
                    return message.reply('Vous devez taguer un membre !');
                } else {
                    const user = message.mentions.users.first();
                    return message.channel.send(`**Membre** : ${user.username}\n**ID** : ${user.id}`);
                }
            default:
                return message.reply('Argument incorrect !');
        }
    },
};