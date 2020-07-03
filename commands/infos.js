module.exports = {
    name: 'infos',
    description: 'Permet d\'obtenir des informations sur un élément (server, me, user)',
    execute(message, args) {
        if (!args[0]) {
            return message.reply('Vous devez renseigner un paramètre ! (server, me, user)');
        }
        switch (args[0]) {
            case 'server':
                const guilde = message.guild;
                return message.channel.send(`Serveur : ${guilde.name}\nTotal membres : ${guilde.memberCount}`);
            case 'me':
                const auteur = message.author;
                return message.channel.send(`Membre : ${auteur.username}\nID : ${auteur.id}`);
            case 'user':
                if (!args[1]) {
                    return message.reply('Vous devez taguer un membre !');
                } else {
                    const user = message.mentions.users.first();
                    return message.channel.send(`Membre : ${user.username}\nID : ${user.id}`);
                }
            default:
                return message.reply('Argument incorrect !');
        }
    },
};