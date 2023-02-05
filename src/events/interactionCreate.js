const {owner} = require('../../config/config.json');

module.exports = function (client) {
    this.gererCommande = async function (interaction) {
        const {commandName} = interaction;

        const command = client.commands.get(commandName);
        try {
            if (command?.opts?.admin && interaction.member.user.id !== owner) {
                return await interaction.reply("Vous ne pouvez pas utiliser cette commande !");
            }
            return await command.execute(interaction);
        } catch (error) {
            console.error(error);
            try {
                return await interaction.reply({content: `Erreur ${error.message}`, ephemeral: true});
            } catch (error) {
                console.error(error);
            }
        }
    }
    this.gererBouton = async function (interaction)
    {
        const customID = interaction.customId;
        const explode  = customID.split('-');

        const commandName = explode[0];
        const buttonName  = explode[1];
        const command = client.commands.get(commandName);

        try {
            if (command?.opts?.admin && interaction.member.user.id !== owner) {
                return await interaction.reply("Vous ne pouvez pas utiliser cette commande !");
            }
            return await command.executeButton(interaction, buttonName);
        } catch (error) {
            console.error(error);
            return await interaction.reply({content: `Erreur ${error.message}`, ephemeral: true});
        }
    }
    client.on('interactionCreate', async interaction => {
        if (interaction.isCommand()) {
            await this.gererCommande(interaction);
        }
        else if (interaction.isButton())
        {
            await this.gererBouton(interaction);
        }
    });
};