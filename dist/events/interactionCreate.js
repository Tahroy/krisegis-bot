"use strict";
const { owner } = require('../../config/config_bot.json');
const { debugMessage } = require('../utils/Utils');
module.exports = (client) => {
    const gererCommande = async (interaction) => {
        const { commandName } = interaction;
        const command = client.commands.get(commandName);
        try {
            const userName = interaction.user.tag;
            const log = `\`${userName}\` a utilisé la commande \`${commandName}\``;
            debugMessage(interaction.guild, log);
            if (command?.opts?.admin && interaction.user.id !== owner) {
                await interaction.reply('Vous ne pouvez pas utiliser cette commande !');
                return;
            }
            if (!command) {
                return await interaction.reply('Cette commande n\'existe pas !');
            }
            await command.execute(interaction);
        }
        catch (error) {
            console.error(error);
        }
    };
    const gererBouton = async (interaction) => {
        const customID = interaction.customId;
        const [commandName, buttonName] = customID.split('-', 2);
        const userName = interaction.user.tag;
        const command = client.commands.get(commandName);
        const log = `${userName} a utilisé le bouton ${buttonName} dans la commande ${commandName}`;
        console.log(log);
        try {
            if (command?.opts?.admin && interaction.member.user.id !== owner) {
                return await interaction.reply('Vous ne pouvez pas utiliser cette commande !');
            }
            await command.executeButton(interaction);
        }
        catch (error) {
            console.error(error);
            if (interaction) {
                console.error(`Erreur de ${interaction.user.tag} avec la commande ${commandName} et bouton ${buttonName}`);
                await interaction.channel.send({
                    content: `Une erreur a eu lieu, contactez Tahroy !`, ephemeral: true,
                });
            }
        }
    };
    const autocomplete = async (interaction) => {
        const { commandName } = interaction;
        const command = client.commands.get(commandName);
        try {
            return await command.autocomplete(interaction);
        }
        catch (error) {
            console.error(error);
        }
    };
    const gererModal = async (interaction) => {
        const [commandName, modalName] = interaction.customId.split('-', 2);
        const command = client.commands.get(commandName);
        try {
            return await command.gererModal(interaction, modalName);
        }
        catch (error) {
            console.error(error);
        }
    };
    client.on('interactionCreate', async (interaction) => {
        if (interaction.isCommand()) {
            await gererCommande(interaction);
        }
        else if (interaction.isButton()) {
            await gererBouton(interaction);
        }
        else if (interaction.isAutocomplete()) {
            await autocomplete(interaction);
        }
        else if (interaction.isModalSubmit()) {
            await gererModal(interaction);
        }
    });
};
