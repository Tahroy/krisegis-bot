const {
    prefix
} = require('../config/config.json');

module.exports = {
    name: 'help',
    description: 'List all of my commands or info about a specific command.',
    aliases: ['commands', 'man'],
    usage: '[command name]',
    execute(message, args) {
        const data = [];
        const {
            commands
        } = message.client;

        if (!args.length) {
            data.push('**Voici toutes mes commandes :**');
            data.push(commands.map(command => command.name).join(', '));
            data.push(`\n*Vous pouvez utilisez ${prefix}man <nom_commande> pour obtenir plus d'informations sur une commande.*`);

            return message.reply(data, {
                split: true
            });
            // On présente toutes les commandes
        } else {
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

            message.channel.send(data, {
                split: true
            });
        }
    },
};