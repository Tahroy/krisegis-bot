const { owner } = require('../../config/config_bot.json')
const Variable = require('../database/Variable')
const { debugMessage } = require('../utils/Utils')
const {CommandInteraction} = require("discord.js");

module.exports = function (client) {
    this.gererCommande = async function (interaction) {
        const { commandName } = interaction

        const command = client.commands.get(commandName)
        try {
            const userName = interaction.user.tag;
            const commandName = command.data.name;

            const log = "``" + userName + "`` a utilisé la commande ``" + commandName + "``";
            debugMessage(interaction.guild, log);

            if (command?.opts?.admin && interaction.user.id !== owner) {
                interaction.reply('Vous ne pouvez pas utiliser cette commande !')
                return;
            }
            if (!command) {
                return await interaction.reply('Cette commande n\'existe pas !')
            }
            await command.execute(interaction)

        } catch (error) {
            console.log(error)
        }
    }
    this.gererBouton = async function (interaction) {
        const customID = interaction.customId
        const explode = customID.split('-', 2)

        const commandName = explode[0]
        const buttonName = explode[1]
        const command = client.commands.get(commandName)

        try {
            if (command?.opts?.admin && interaction.member.user.id !== owner) {
                return await interaction.reply('Vous ne pouvez pas utiliser cette commande !')
            }
            await command.executeButton(interaction, buttonName)
        } catch (error) {
            console.error(error)
            if (interaction) {
                console.error(`Erreur de ${interaction.user.tag} avec la commande ${commandName} et bouton ${buttonName}`)
                await interaction.channel.send({ content: `Une erreur a eu lieu, contactez Tahroy !`, ephemeral: true })
            }
//            interaction.deferUpdate()
        }
    }
    this.autocomplete = async function (interaction) {
        const { commandName } = interaction

        const command = client.commands.get(commandName)
        try {
            return await command.autocomplete(interaction)
        } catch (error) {
            console.error(error)
        }
    }
    client.on('interactionCreate', async interaction => {
        if (interaction.isCommand()) {
            await this.gererCommande(interaction)
        } else if (interaction.isButton()) {
            await this.gererBouton(interaction)
        } else if (interaction.isAutocomplete()) {
            await this.autocomplete(interaction)
        }
    })
}