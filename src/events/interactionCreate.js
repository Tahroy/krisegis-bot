const {owner} = require('../../config/config.json');

module.exports = function (client) {
    client.on('interactionCreate', async interaction => {
        if (!interaction.isCommand()) return;

        const {commandName} = interaction;

        const command = client.commands.get(commandName);
        try {
            if (command?.opts?.admin && interaction.member.user.id !== owner)
            {
                return await interaction.reply("Vous ne pouvez pas utiliser cette commande !");
            }
            return await command.execute(interaction);
        } catch (error) {
            console.error(error);
            return await interaction.reply({ content: `Erreur ${error.message}`, ephemeral: true });
        }
    });
};