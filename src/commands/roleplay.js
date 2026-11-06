const { SlashCommandBuilder } = require('discord.js')
const Server = require('../models/Server').default
const Variable = require('../models/Variable').default
const { debugMessage } = require('../utils/Utils')

module.exports = {
    public: false,
    opts: {},
    data: new SlashCommandBuilder()
        .setName('roleplay')
        .setDMPermission(false)
        .setDescription('Annoncer du RP en jeu - Discord RP')
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
        await interaction.deferReply({ ephemeral: true });

        await this.sendGeneral(interaction);
        await this.sendServeur(interaction);

        await interaction.editReply({ content: `Annonce RP envoyée o/` });
    },
    async autocomplete (interaction) {
        const guild = interaction.guild
        const serverString = interaction.options.getString('serveur')

        if (!serverString) {
            await interaction.respond([])
            return
        }

        const servers = await Server.findAll({ where: { guild: guild.id } })
        const retour = []

        for (const server of servers) {
            const role = guild.roles.cache.get(server.id)
            const name = server.name || role?.name
            if (name && name.toLowerCase().includes(serverString.toLowerCase())) {
                retour.push({ name, value: name })
            }
        }

        await interaction.respond(retour.slice(0, 25))
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

        const roleRP = guild.roles.cache.get(roleRPID.data) || await guild.roles.fetch(roleRPID.data).catch(() => null);
        const channelRP = guild.channels.cache.get(channelID.data) || await guild.channels.fetch(channelID.data).catch(() => null);

        if (!roleRP || !channelRP) {
            debugMessage(interaction.guild, "Pas de rôle channel général");
            return;
        }

        const message = interaction.options.getString('message');
        await channelRP.send(`Hey ${roleRP}, il y a du RP en cours sur **${serveur}** !\n ${message}`);
    },
    async sendServeur (interaction) {
        const guild = interaction.guild
        const serveur = interaction.options.getString('serveur')

        const roleRPID = await Variable.findOne({ where: { name: 'alerte_rp_serveur', server: guild.id } })
        if (!roleRPID) {
            debugMessage(interaction.guild, "Pas de rôle RP serveur");
            return;
        }

        const server = await Server.findOne({ where: { guild: guild.id, name: serveur } })
            || await Server.findOne({ where: { id: serveur } });

        if (!server || !server.channel) {
            debugMessage(interaction.guild, `Pas de configuration serveur pour ${serveur}`);
            return;
        }

        const channel = guild.channels.cache.get(server.channel) || await guild.channels.fetch(server.channel).catch(() => null);
        if (!channel) {
            debugMessage(interaction.guild, `Pas de channel serveur trouvé pour ${serveur}`);
            return;
        }

        const roleRP = guild.roles.cache.get(roleRPID.data) || await guild.roles.fetch(roleRPID.data).catch(() => null);
        if (!roleRP) {
            debugMessage(interaction.guild, "Pas de rôle RP serveur");
            return;
        }

        const message = interaction.options.getString('message');
        await channel.send(`Hey ${roleRP}, il y a du RP en cours sur **${serveur}** !\n ${message}`);
    }
}
