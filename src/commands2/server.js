const {
    SlashCommandBuilder, ActionRowBuilder, ButtonBuilder
} = require('discord.js')
const Server = require('../database/Server')
const { ButtonStyle } = require('discord-api-types/v10')
const { PermissionFlagsBits } = require('discord-api-types/v8')
const { debugMessage, checkTags } = require('../utils/Utils')
const Variable = require('../database/Variable')
const WelcomeMessage = require('../database/WelcomeMessage')

module.exports = {
    opts: {},
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Choisir son serveur.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .setDMPermission(false)
        .addSubcommand(
            subcommand => subcommand
                .setName('add')
                .setDescription('Ajouter un serveur')
                .addRoleOption(
                    option => option
                        .setName('server')
                        .setDescription('Le serveur à ajouter')
                        .setRequired(true)
                )
                .addStringOption(
                    option => option
                        .setName('tag')
                        .setDescription('Tag du serveur')
                        .setRequired(true)
                )
                .addStringOption(
                    option => option
                        .setName('name')
                        .setDescription('Nom du serveur')
                        .setRequired(true)
                )
                .addChannelOption(
                    option => option
                        .setName('channel')
                        .setDescription('Le channel du serveur')
                        .setRequired(true)
                )
                .addRoleOption(
                    option => option
                        .setName('game')
                        .setDescription('Le jeu du serveur')
                        .setRequired(true)
                )
        )
        .addSubcommand(
            subcommand => subcommand
                .setName('remove')
                .setDescription('Retirer un serveur')
                .addRoleOption(
                    option => option
                        .setName('server')
                        .setDescription('Le serveur à ajouter')
                        .setRequired(true)
                )
        )
        .addSubcommand(
            subcommand => subcommand
                .setName('list')
                .setDescription('Liste des serveurs')
        )
        .addSubcommand(
            subcommand => subcommand
                .setName('rp')
                .setDescription('Affiche les boutons pour le RP')
        )
        .addSubcommand(
            subcommand => subcommand
                .setName('debug')
                .setDescription('Affiche la configuration actuelle')
        )

    ,
    async execute (interaction) {
        const subCommand = interaction.options.getSubcommand()

        const commands = {
            add: () => this.addServer(interaction),
            remove: () => this.removeServer(interaction),
            list: () => this.listServers(interaction),
            rp: () => this.listRP(interaction),
            debug: () => this.debugAdmin(interaction),
            default: () => interaction.reply({ content: 'Commande inconnue !', ephemeral: true })
        }

        const command = commands[subCommand] || commands.default
        await command()
    },
    async executeButton (interaction, buttonName) {
        const args = buttonName.split('_')

        const action = args[0]
        const roleID = args[1]

        if (roleID === 'rp' || roleID === 'event') {
            await this.addRemoveRP(interaction, buttonName)
            return
        }

        await this.addRemoveServer(interaction, buttonName)

        // return await interaction.deferUpdate()
        // interaction.reply(interaction.user.username + ` ${action} ${role.name}`)
    },

    // Vérification des rôles de l'utilisateur
    async checkJeuxPrincipaux (member) {

        const guild = member.guild;

        const allServers = await Server.findAll({where: {guild: member.guild.id}});
        const allGames = await Server.findAll({ attributes: ['game'], group: ['game'], where: {guild: member.guild.id}});

        // On récupère les rôles du membre
        const roles = member.roles.cache.map(role => role.id)

        // On note chaque serveur identifié et chaque jeu identifié
        const servers = [];
        const games = [];

        // On regarde pour chaque serveur dans un premier temps
        allServers.forEach((server) => {
            const serverId = server.get('id');
            if (roles.includes(serverId)) {
                games.push(server.get('game'));
            }
        })

        // On boucle sur tous les jeux. Ceux qui ne sont pas dans game sont retirés, ceux dans dans game sontn ajoutés
        allGames.forEach((game) => {
            const gameID = game.get('game');
            const role = guild.roles.cache.get(gameID);
            if (!role) {
                return;
            }
            if (games.includes(gameID)) {
                console.log("Ajout du jeu " + role.name + " au membre " + member.user.username);
                member.roles.add(role);
            }
            else {
                console.log("Retrait du jeu " + role.name + " au membre " + member.user.username);
                member.roles.remove(role);
            }
        })
    },
    sendWelcomeMessage (roles, action, interaction, self) {
        if (action !== 'add') {
            return
        }
        if (roles.length !== 1) {
            return
        }
        Variable.findOne({
            where: {
                name: 'welcomeChannel',
                server: interaction.guild.id
            }
        }).then(async (welcomeChannel) => {
            if (!welcomeChannel) {
                console.log('welcomeChannel non trouvé')
                return
            }

            const message = await self.getRandomWelcomeMessage(interaction.member)

            if (message) {
                const welcomeChannelObj = await interaction.guild.channels.cache.get(welcomeChannel.data)
                welcomeChannelObj.send({ content: message })
            }

        }).catch((err) => {
            console.log(err)
        })
    },

    // Ajout / Retrait
    async addRemoveServer (interaction, buttonName) {
        const args = buttonName.split('_')

        const action = args[0]
        const roleID = args[1]

        const member = interaction.member

        // Roles actuels du membre
        const roles = member.roles.cache.map(role => role.name)
        const role = await interaction.guild.roles.cache.find(role => role.id === roleID)

        const hasRole = await member.roles.cache.find(role => role.id === roleID)

        const self = this
        if (action === 'add') {

            // On vérifie qu'il n'a pas déjà le rôle
            if (hasRole) {
                await interaction.reply({
                    content: `Vous avez déjà le rôle ${role.name}`,
                    ephemeral: true
                })
                return
            }

            await member.roles.add(role)

            try {
                await interaction.reply({
                    content: `Le serveur ${role.name} a été ajouté`,
                    ephemeral: true
                })
            } catch (error) {
                console.error(error)
            }
        } else if (action === 'remove') {

            // On vérifie qu'il a le rôle
            if (!hasRole) {
                await interaction.reply({
                    content: `Vous n'avez pas le rôle ${role.name}, impossible de vous le retirer.`,
                    ephemeral: true
                })
                return
            }
            await member.roles.remove(role)

            try {
                await interaction.reply({
                    content: `Le serveur ${role.name} a été retiré`,
                    ephemeral: true
                })
            } catch (error) {
                console.error(error)
            }
        } else {
            await interaction.deferReply()
        }

        // On ajoute le jeu
        await this.checkJeuxPrincipaux(member)
        // On ajoute le tag
        checkTags(member)
        // On ajoute le message d'accueil
        this.sendWelcomeMessage(roles, action, interaction, self)

        const userName = member.nickname || member.user.username
        const roleName = role.name

        debugMessage(interaction.guild, '``' + userName + '`` ' + action + ' server ``' + roleName + '``')
        console.log(interaction.user.username + ` ${action} ${role.name}`)

    },
    async addServer (interaction) {
        const server = interaction.options.getRole('server')
        const game = interaction.options.getRole('game')
        const tag = interaction.options.getString('tag')
        const name = interaction.options.getString('name')
        const channel = interaction.options.getChannel('channel').id

        await Server.create({
            id: server.id,
            game: game.id ?? '',
            guild: interaction.guild.id,
            tag: tag,
            name: name,
            channel: channel
        })

        interaction.reply({
            content: `Le serveur ${server.name} a été ajouté`,
            ephemeral: true
        })
    },
    async removeServer (interaction) {
        const server = interaction.options.getRole('server')

        await Server.destroy({
            where: { id: server.id, }
        })

        interaction.reply({
            content: `Le serveur ${server.name} a été retiré`,
            ephemeral: true
        })
    },

    // Liste
    async listServers (interaction) {

        Server.findAll({
            attributes: ['game'],
            group: ['game'],
        })
            .then(async (games) => {
                for (const game of games) {
                    await this.sendServers(interaction, game)
                }
            })
            .catch((error) => {
                console.error('Erreur lors de la récupération des jeux :', error)
            })

        await interaction.reply({ content: 'Voici la liste', ephemeral: true })
    },
    async sendServers (interaction, game) {
        const jeuPrincipal = interaction.guild.roles.cache.find(role => role.id === game.game)
        const nomJeuPrincipal = jeuPrincipal.name || ''

        const servers = await Server.findAll({
            where: { game: game.game },
        })

        await this.send(servers, interaction, nomJeuPrincipal)
    },
    async send (servers, interaction, name) {
        let rowAjouter = new ActionRowBuilder()
        let rowRetirer = new ActionRowBuilder()

        let count = 0
        for (const server of servers) {
            count++

            const serverName = await interaction.guild.roles.cache.find(role => role.id === server.id).name

            rowAjouter.addComponents(new ButtonBuilder()
                .setCustomId(`server-add_${server.id}`)
                .setLabel(serverName)
                .setEmoji('✅')
                .setStyle(ButtonStyle.Success))

            rowRetirer.addComponents(new ButtonBuilder()
                .setCustomId(`server-remove_${server.id}`)
                .setLabel(serverName)
                .setEmoji('⛔')
                .setStyle(ButtonStyle.Danger))

            if (count === 5) {
                await interaction.channel.send({
                    content: `**Serveurs ${name} :**`,
                    components: [rowAjouter, rowRetirer]
                })
                count = 0
                rowAjouter = new ActionRowBuilder()
                rowRetirer = new ActionRowBuilder()
            }
        }

        if (count > 0) {
            const titre = count === servers.length ? `**Serveurs ${name} :**` : ''
            await interaction.channel.send({ content: titre, components: [rowAjouter, rowRetirer] })
        }
    },

    // Debug admin
    async debugAdmin (interaction) {
        await Server.findAll({
            where: { guild: interaction.guild.id }
        }).then(async (servers) => {
            await interaction.reply({ content: 'Voici la liste', ephemeral: true })
            for (const server of servers) {
                const game = await interaction.guild.roles.cache.find(role => role.id === server.game)
                const role = await interaction.guild.roles.cache.find(role => role.id === server.id)
                const channel = await interaction.guild.channels.cache.find(channel => channel.id === server.channel)
                let line = `
* BDD name : ${server?.name ?? 'absent'}
* BDD ID : ${server?.id}
* BDD tag : ${server?.tag}
                    
* Discord rôle : ${role.name}
* Discord game : ${game.name}
* Discord channel : ${channel?.name ?? 'absent'}`

                await interaction.channel.send({ content: line })
                await interaction.channel.send({ content: '-----------' })
            }
        })

    },

    // Role Play
    async listRP (interaction) {

        let rowAjouter = new ActionRowBuilder()
        let rowRetirer = new ActionRowBuilder()

        rowAjouter.addComponents(
            new ButtonBuilder()
                .setCustomId('server-add_event_all')
                .setEmoji('✅')
                .setLabel('Tous les évènements')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('server-add_event_server')
                .setEmoji('✅')
                .setLabel('Uniquement ses serveurs')
                .setStyle(ButtonStyle.Success))

        rowRetirer.addComponents(
            new ButtonBuilder()
                .setCustomId('server-remove_event_all')
                .setEmoji('⛔')
                .setLabel('Tous les serveurs')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('server-remove_event_server')
                .setEmoji('⛔')
                .setLabel('Uniquement ses serveurs')
                .setStyle(ButtonStyle.Danger)
        )

        await interaction.channel.send({
            content: '**S\'inscrire à l\'alerte évènements**',
            components: [rowAjouter, rowRetirer]
        })

        // Rôle Play
        rowAjouter = new ActionRowBuilder()
        rowRetirer = new ActionRowBuilder()

        rowAjouter.addComponents(
            new ButtonBuilder()
                .setCustomId('server-add_rp_all')
                .setEmoji('✅')
                .setLabel('Toutes les alertes RP')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('server-add_rp_server')
                .setEmoji('✅')
                .setLabel('Uniquement ses serveurs')
                .setStyle(ButtonStyle.Success))

        rowRetirer.addComponents(
            new ButtonBuilder()
                .setCustomId('server-remove_rp_all')
                .setEmoji('⛔')
                .setLabel('Toutes les alertes RP')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('server-remove_rp_server')
                .setEmoji('⛔')
                .setLabel('Uniquement ses serveurs')
                .setStyle(ButtonStyle.Danger)
        )

        await interaction.channel.send({
            content: '**S\'inscrire à l\'alertes RP**',
            components: [rowAjouter, rowRetirer]
        })

        await interaction.reply({ 'content': 'Voilà !', 'ephemeral': true })
    },
    async addRemoveRP (interaction, buttonName) {
        const args = buttonName.split('_')

        const action = args[0]
        const eventRP = args[1]
        const allServer = args[2]

        let roleKey = null
        let message = ''

        if (eventRP === 'rp') {
            if (allServer === 'all') {
                roleKey = 'alerte_rp_generale'
                message = 'Rôle Alerte RP générale'
            } else {
                roleKey = 'alerte_rp_serveur'
                message = 'Rôle Alerte RP serveur'
            }
        } else {
            if (allServer === 'all') {
                roleKey = 'alerte_event_generale'
                message = 'Rôle Alerte évènement général'
            } else {
                roleKey = 'alerte_event_serveur'
                message = 'Rôle Alerte évènement serveur'
            }
        }

        let roleID = await Variable.findOne({ where: { name: roleKey } })
        roleID = roleID.data ?? null

        if (!roleID) {
            debugMessage(interaction.guild, `Aucune configuration role RP/event trouvée pour ${roleKey}`)
            await interaction.reply({ content: 'Aucun rôle RP/event trouvé ! Contactez un admin', ephemeral: true })
            return
        }

        const role = await interaction.guild.roles.cache.get(roleID)

        if (!role) {
            debugMessage(interaction.guild, 'Aucun rôle trouvé !')
            await interaction.reply({ content: 'Aucun rôle trouvé ! Contactez un admin', ephemeral: true })
            return
        }
        if (action === 'add') {
            message += ' ajouté !'
            await interaction.member.roles.add(role)
        } else {
            message += ' retiré !'
            await interaction.member.roles.remove(role)
        }

        debugMessage(interaction.guild, 'Rôle ``' + role.name + '`` ' + action + ' pour ``' + interaction.user.tag + '``')
        try {
            await interaction.reply({ content: message, ephemeral: true })
        } catch (error) {
            console.error(error)
        }
    },

    // get message welcome
    async getRandomWelcomeMessage (member) {
        // Get variable from WelcomeMessage table
        const messages = await WelcomeMessage.findAll({})
        const randomIndex = Math.floor(Math.random() * messages.length)
        let message = messages[randomIndex].get('message')
        return message.replaceAll('[nom]', `<@${member.id}>`)
    }
}