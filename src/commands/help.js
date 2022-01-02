const {
    prefix
} = require('../../config/config.json');

module.exports = {
    name: 'help',
    description: 'Liste des commandes ou aide à une commande spécifique.',
    aliases: ['commands', 'man'],
    usage: '<Nom_commande>',
    execute(message, args) {
        const data = [];
        const {
            commands
        } = message.client;

        if (!args.length) {

            let retour = '**Voici toutes mes commandes :**\n';
            retour += commands.map(command => command.name).join(', ');

            retour += `\n*Vous pouvez utilisez ${prefix}man <nom_commande> pour obtenir plus d'informations sur une commande.*`;
            return message.reply({content: retour});
        }
        else {
            // On prépare la commande args[0]
            const name = args[0].toLowerCase();
            const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

            if (!command) {
                return message.reply('Cette commande n\'existe pas !');
            }

            data.push(`**Nom :** ${command.name}`);

            if (command.aliases) data.push(`**Alias :** ${command.aliases.join(', ')}`);
            if (command.description) data.push(`**Description :** ${command.description}`);
            if (command.usage) data.push(`**Utilisation :** ${prefix}${command.name} ${command.usage}`);

            message.channel.send(data.join('`\n'), {
                split: true
            });
        }
    },
};