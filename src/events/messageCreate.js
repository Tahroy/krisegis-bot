const {prefix, owner} = require('./../../config/config.json');
module.exports = function (client) {
    client.on('messageCreate', message => {
        if (!message.content.startsWith(prefix) || message.author.bot) return;


        // On récupère les arguments et le nom de la commande.
        const args = message.content.slice(prefix.length).split(/ +/);
        const commandName = args.shift().toLowerCase();

        // On récupère la commande par son nom ou un de ses alias.
        const command = client.commands.get(commandName) ||
            client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        // On vérifie que la commande existe bien.
        if (!command) return;

        // On refuse l'utilisation s'il n'y a pas accès d'arguments.
        if (command.args > 0 && args.length < command.args) {
            let reply = `Vous devez indiquer des arguments (${command.args}) pour utiliser cette commande !`;

            // On en profite pour indiquer comment utiliser la commande.
            if (command.usage) {
                reply += `\nLa commande demande l'usage suivant : « ${prefix}${command.name} ${command.usage} »`;
            }

            return message.reply(reply);
        }

        // On refuse les commandes de serveur en MP.
        if (command.guildOnly && message.channel.type !== 'text') {
            return message.reply('Cette commande est indisponible en MP. :(');
        }

        // On refuse les commandes dans le cas où l'utilisateur n'a pas les droits nécessaires
        if (command.admin && message.author.id !== owner) {
            return message.reply('Tu n\'as pas l\'autorisation pour cette commande !');
        }

        try {
            command.execute(message, args);
        } catch (error) {
            console.log(error);
        }
    });

};