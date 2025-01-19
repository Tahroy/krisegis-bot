const { SlashCommandBuilder } = require('discord.js')
const Server = require('../models/Server').default
const Variable = require('../models/Variable').default
const { debugMessage } = require('../utils/Utils')

module.exports = {
    opts: {},
    data: new SlashCommandBuilder()
        .setName('roleplay - Discord RP')
        .setDMPermission(false)
        .setDescription('Annoncer du RP en jeu')
        .addStringOption(option => option
            .setName('serveur')
            .setDescription('Nom du serveur')
            .setRequired(true)
            .setAutocomplete(true)
        )
        .addStringOption(option => option
            .setName('message')
            .setDescription('Message à passer')
            .setRequired(true)
        ),
    async execute (interaction) {
        await this.sendGeneral(interaction);
        await this.sendServeur(interaction);

        await interaction.reply(`Annonce RP envoyée o/`, { ephemeral: true })
    },
    async autocomplete (interaction) {
        const guild = interaction.guild
        const serverString = interaction.options.getString('serveur')

        if (!serverString || serverString.length < 3) {
            await interaction.respond([])
            return
        }

        let retour = []

        await Server.findAll({
            where: { guild: guild.id, }
        }).then(async servers => {
            for (const server of servers) {
                const role = await guild.roles.cache.find(role => role.id === server.id)
                if (role.name && role.name.includes(serverString)) {
                    retour.push({
                        name: role.name,
                        value: role.name
                    })
                }
            }
        })

        await interaction.respond(retour)
    },
    async sendGeneral (interaction) {
        const guild = interaction.guild
        const serveur = interaction.options.getString('serveur')

        const roleRPID = await Variable.findOne({ where: { name: 'alerte_rp_generale', server: guild.id } })

        if (!roleRPID) {
            debugMessage(interaction.guild, "Pas de rôle RP général");
            return;
        }

        const channelID = await Variable.findOne({ where: { name: 'rp_channel', server: guild.id } });

        if (!channelID) {
            debugMessage(interaction.guild, "Pas de rôle channel général");
            return;
        }

        const roleRP = await guild.roles.cache.find(role => role.id === roleRPID.data)
        const channelRP = await guild.channels.cache.find(channel => channel.id === channelID.data)

        if (!roleRP || !channelRP) {
            debugMessage(interaction.guild, "Pas de rôle channel général");
            return;
        }

        const message = interaction.options.getString('message');
        channelRP.send(`Hey ${roleRP}, il y a du RP en cours sur **${serveur}** !\n ${message}`)
    },
    async sendServeur (interaction) {
        const guild = interaction.guild
        const serveur = interaction.options.getString('serveur')

        const roleRPID = await Variable.findOne({ where: { name: 'alerte_rp_serveur', server: guild.id } })

        if (!roleRPID) {
            debugMessage(interaction.guild, "Pas de rôle RP serveur");
            return;
        }

        const roleServer = await guild.roles.cache.find(role => role.name === serveur);
        const server = await Server.findOne({ where: { id: roleServer.id } });
        const channel = guild.channels.cache.find(channel => channel.id === server.channel);

        if (!channel) {
            debugMessage(interaction.guild, `Pas de rôle channel serveur pour ${channelName}`);
            return;
        }

        const roleRP = await guild.roles.cache.find(role => role.id === roleRPID.data)

        if (!roleRP) {
            debugMessage(interaction.guild, "Pas de rôle RP serveur");
            return;
        }

        const message = interaction.options.getString('message');

        channel.send(`Hey ${roleRP}, il y a du RP en cours sur **${serveur}** !\n ${message}`)
    }
}