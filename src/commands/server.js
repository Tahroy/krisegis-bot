const {SlashCommandBuilder, ActionRowBuilder, ButtonBuilder} = require('discord.js')
const {ButtonStyle} = require('discord-api-types/v10')
const {PermissionFlagsBits} = require('discord-api-types/v8')
const {debugMessage, checkTags} = require('../utils/Utils')
const Constantes = require("../utils/Constantes");

const Server = require('../models/Server').default
const Variable = require('../models/Variable').default
const WelcomeMessage = require('../models/WelcomeMessage').default

module.exports = {
    allowedGuildIds: Constantes.allowedGuildIds,
    opts: {}, data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Choisir son serveur - Discord RP')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .setDMPermission(false)
        .addSubcommand(subcommand => subcommand
            .setName('add')
            .setDescription('Ajouter un serveur - Discord RP')
            .addRoleOption(option => option
                .setName('server')
                .setDescription('Le serveur à ajouter')
                .setRequired(true))
            .addStringOption(option => option
                .setName('tag')
                .setDescription('Tag du serveur')
                .setRequired(true))
            .addStringOption(option => option
                .setName('name')
                .setDescription('Nom du serveur')
                .setRequired(true))
            .addChannelOption(option => option
                .setName('channel')
                .setDescription('Le channel du serveur')
                .setRequired(true))
            .addRoleOption(option => option
                .setName('game')
                .setDescription('Le jeu du serveur')
                .setRequired(true)))
        .addSubcommand(subcommand => subcommand
            .setName('remove')
            .setDescription('Retirer un serveur - Discord RP')
            .addRoleOption(option => option
                .setName('server')
                .setDescription('Le serveur à ajouter')
                .setRequired(true)))
        .addSubcommand(subcommand => subcommand
            .setName('list')
            .setDescription('Liste des serveurs - Discord RP'))
        .addSubcommand(subcommand => subcommand
            .setName('rp')
            .setDescription('Affiche les boutons pour le RP - Discord RP'))
        .addSubcommand(subcommand => subcommand
            .setName('roles')
            .setDescription('Afficher les rôles autres configurés - Discord RP'))
        .addSubcommand(subcommand => subcommand
            .setName('debug')
            .setDescription('Affiche la configuration actuelle - Discord RP'))

    , async execute(interaction) {
        const subCommand = interaction.options.getSubcommand()

        const commands = {
            add: () => this.addServer(interaction),
            remove: () => this.removeServer(interaction),
            list: () => this.listServers(interaction),
            rp: () => this.listRP(interaction),
            roles: () => this.listRoles(interaction),
            debug: () => this.debugAdmin(interaction),
            default: () => interaction.reply({content: 'Commande inconnue !', ephemeral: true})
        }

        const command = commands[subCommand] || commands.default
        await command()
    }, async executeButton(interaction, buttonName) {
        const rolesRP = ['horskrosmoz', 'hrp', 'event_server', 'event_all', 'rp_server', 'rp_all', 'international'];
        if (rolesRP.includes(buttonName)) {
            await this.addRemoveRP(interaction, buttonName)
            return;
        }

        await this.addRemoveServer(interaction, buttonName)
    },

    // Vérification des rôles de l'utilisateur
    async checkJeuxPrincipaux(member) {

        const guild = member.guild;

        const allServers = await Server.findAll({where: {guild: member.guild.id}});
        const allGames = await Server.findAll({attributes: ['game'], group: ['game'], where: {guild: member.guild.id}});

        // On récupère les rôles du membre
        const roles = member.roles.cache.map(role => role.id)

        // On note chaque serveur identifié et chaque jeu identifié
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
            } else {
                console.log("Retrait du jeu " + role.name + " au membre " + member.user.username);
                member.roles.remove(role);
            }
        })
    }, sendWelcomeMessage(interaction) {
        Variable.findOne({
            where: {
                name: 'welcomeChannel', server: interaction.guild.id
            }
        }).then(async (welcomeChannel) => {
            if (!welcomeChannel) {
                console.log('welcomeChannel non trouvé')
                return
            }

            const message = await this.getRandomWelcomeMessage(interaction.member)

            if (message) {
                const welcomeChannelObj = await interaction.guild.channels.cache.get(welcomeChannel.data)
                welcomeChannelObj.send({content: message})
            }

        }).catch((err) => {
            console.log(err)
        })
    },

    // Ajout / Retrait
    async addRemoveServer(interaction, buttonName) {
        const roleID = buttonName

        const member = interaction.member

        // Roles actuels du membre
        const rolesActuels = member.roles.cache.map(role => role.name)
        const role = await interaction.guild.roles.cache.find(role => role.id === roleID)

        if (!role) {
            debugMessage(interaction.guild, 'Aucun rôle trouvé !')
            await interaction.reply({content: 'Aucun rôle trouvé ! Contactez un admin', ephemeral: true})
            return
        }

        const action = await this.addRemoveRole(member, role, interaction)

        if (action === "error") {
            return;
        }

        // On ajoute le jeu
        await this.checkJeuxPrincipaux(member)
        // On ajoute le tag
        await checkTags(member)
        // On ajoute le message d'accueil

        if (action === 'add' && rolesActuels.length === 1) {
            this.sendWelcomeMessage(interaction)
        }

        const userName = member.nickname || member.user.username
        const roleName = role.name

        debugMessage(interaction.guild, '``' + userName + '`` ' + action + ' server ``' + roleName + '``')
        console.log(interaction.user.username + ` ${action} ${role.name}`)

    }, async addServer(interaction) {
        const server = interaction.options.getRole('server')
        const game = interaction.options.getRole('game')
        const tag = interaction.options.getString('tag')
        const name = interaction.options.getString('name')
        const channel = interaction.options.getChannel('channel').id

        await Server.create({
            id: server.id, game: game.id ?? '', guild: interaction.guild.id, tag: tag, name: name, channel: channel
        })

        interaction.reply({
            content: `Le serveur ${server.name} a été ajouté`, ephemeral: true
        })
    }, async removeServer(interaction) {
        const server = interaction.options.getRole('server')

        await Server.destroy({
            where: {id: server.id,}
        })

        interaction.reply({
            content: `Le serveur ${server.name} a été retiré`, ephemeral: true
        })
    },

    // Liste
    async listServers(interaction) {

        Server.findAll({
            attributes: ['game'], group: ['game'], where: {guild: interaction.guild.id}
        })
            .then(async (games) => {
                for (const game of games) {
                    await this.sendServers(interaction, game)
                }
            })
            .catch((error) => {
                console.error('Erreur lors de la récupération des jeux :', error)
            })

        await interaction.reply({content: 'Voici la liste', ephemeral: true})
    }, async sendServers(interaction, game) {
        const jeuPrincipal = interaction.guild.roles.cache.find(role => role.id === game.game)

        const nomJeuPrincipal = jeuPrincipal.name ?? ''

        if (!nomJeuPrincipal) {
            console.error(game)
        }

        const servers = await Server.findAll({
            where: {game: game.game},
        })

        await this.send(servers, interaction, nomJeuPrincipal)
    }, async send(servers, interaction, name) {
        let rowAjouter = new ActionRowBuilder()

        let count = 0
        for (const server of servers) {
            count++

            const serverName = await interaction.guild.roles.cache.find(role => role.id === server.id).name

            rowAjouter.addComponents(new ButtonBuilder()
                .setCustomId(`server-${server.id}`)
                .setLabel(serverName)
                .setStyle(ButtonStyle.Secondary))

            if (count === 5) {
                await interaction.channel.send({
                    content: `**Serveurs ${name} :**`, components: [rowAjouter]
                })
                count = 0
                rowAjouter = new ActionRowBuilder()
            }
        }

        if (count > 0) {
            const titre = count === servers.length ? `**Serveurs ${name} :**` : ''
            await interaction.channel.send({content: titre, components: [rowAjouter]})
        }
    },

    // Debug admin
    async debugAdmin(interaction) {
        await Server.findAll({
            where: {guild: interaction.guild.id}
        }).then(async (servers) => {
            await interaction.reply({content: 'Voici la liste', ephemeral: true})
            for (const server of servers) {
                const game = await interaction.guild.roles.cache.find(role => role.id === server.game)
                const role = await interaction.guild.roles.cache.find(role => role.id === server.id)
                const channel = await interaction.guild.channels.cache.find(channel => channel.id === server.channel)
                let line = `
* BDD name : ${server?.name ?? 'absent'}
* BDD ID : ${server?.id}
* BDD tag : ${server?.tag}
* BDD game : ${server?.game}                    
* Discord rôle : ${role.name}
* Discord game : ${game.name}
* Discord channel : ${channel?.name ?? 'absent'}`

                await interaction.channel.send({content: line})
                await interaction.channel.send({content: '-----------'})
            }
        })

    },

    // Role Play
    async listRP(interaction) {

        let rowAjouter = new ActionRowBuilder()

        rowAjouter.addComponents(new ButtonBuilder()
            .setCustomId('server-event_all')
            .setLabel('Tous les évènements')
            .setStyle(ButtonStyle.Secondary), new ButtonBuilder()
            .setCustomId('server-event_server')
            .setLabel('Uniquement ses serveurs')
            .setStyle(ButtonStyle.Secondary))

        await interaction.channel.send({
            content: '**S\'inscrire à l\'alerte évènements**', components: [rowAjouter]
        })

        // Rôle Play
        rowAjouter = new ActionRowBuilder()

        rowAjouter.addComponents(new ButtonBuilder()
            .setCustomId('server-rp_all')
            .setLabel('Toutes les alertes RP')
            .setStyle(ButtonStyle.Secondary), new ButtonBuilder()
            .setCustomId('server-rp_server')
            .setLabel('Uniquement ses serveurs')
            .setStyle(ButtonStyle.Secondary))

        await interaction.channel.send({
            content: '**S\'inscrire à l\'alertes RP**', components: [rowAjouter]
        })

        await interaction.reply({'content': 'Voilà !', 'ephemeral': true})
    }, async addRemoveRP(interaction, buttonName) {

        let roleKey = null

        switch (buttonName) {
            case 'rp_all':
                roleKey = 'alerte_rp_generale'
                break;
            case 'rp_server':
                roleKey = 'alerte_rp_serveur'
                break;
            case 'event_all':
                roleKey = 'alerte_event_generale'
                break;
            case 'event_server':
                roleKey = 'alerte_event_serveur'
                break;
            case 'hrp': {
                roleKey = 'role_hrp'
                break
            }
            case 'horskrosmoz': {
                roleKey = 'role_horskrosmoz'
                break
            }
            case 'international': {
                roleKey = 'role_international'
                break
            }
        }

        let roleID = await Variable.findOne({where: {name: roleKey}})
        roleID = roleID?.data ?? null

        console.log("Role ID " + roleID)

        if (!roleID) {
            debugMessage(interaction.guild, `Aucune configuration trouvée pour ${roleKey}`)
            await interaction.reply({content: 'Aucun rôle trouvé ! Contactez un admin', ephemeral: true})
            return

        }

        const role = await interaction.guild.roles.cache.find(role => role.id === roleID)

        if (!role) {
            debugMessage(interaction.guild, 'Aucun rôle trouvé !')
            await interaction.reply({content: 'Aucun rôle trouvé ! Contactez un admin', ephemeral: true})
            return
        }

        const member = interaction.member
        await this.addRemoveRole(member, role, interaction)
    },

    // get message welcome
    async getRandomWelcomeMessage(member) {
        const guild = member.guild;
        // Get variable from WelcomeMessage table
        const messages = await WelcomeMessage.findAll({where: {guild: guild.id}})
        const randomIndex = Math.floor(Math.random() * messages.length)
        let message = messages[randomIndex].get('message')
        return message.replaceAll('[nom]', `<@${member.id}>`)
    }, async listRoles(interaction) {
        await interaction.reply({'content': 'Liste des rôles', 'ephemeral': true})


        // Rôle Play
        const rowAjouter = new ActionRowBuilder()

        rowAjouter.addComponents(new ButtonBuilder()
            .setCustomId('server-hrp')
            .setLabel("Accéder au canal HRP (discussions autour d'Ankama)")
            .setStyle(ButtonStyle.Secondary), new ButtonBuilder()
            .setCustomId('server-horskrosmoz')
            .setLabel('Accéder au forum Hors Krosmoz (discussions générales)')
            .setStyle(ButtonStyle.Secondary), new ButtonBuilder()
            .setCustomId('server-international')
            .setLabel('Access the INT. channel. EN/ES/PT/Other')
            .setStyle(ButtonStyle.Secondary))

        await interaction.channel.send({
            content: '**Rôles supplémentaires**', components: [rowAjouter]
        })

    }, async addRemoveRole(member, role, interaction) {

        const hasRole = await member.roles.cache.find(roleSearch => roleSearch.id === role.id)

        if (hasRole) {
            await member.roles.remove(role)
            try {
                await interaction.reply({
                    content: `Le rôle ${role.name} a été retiré`, ephemeral: true
                })
                debugMessage(interaction.guild, 'Rôle ``' + role.name + '`` retiré pour ``' + interaction.user.tag + '``')
                return "remove";
            } catch (error) {
                console.error(error)
            }
        } else {
            await member.roles.add(role)
            try {
                await interaction.reply({
                    content: `Le rôle ${role.name} a été ajouté`, ephemeral: true
                })
                debugMessage(interaction.guild, 'Rôle ``' + role.name + '`` ajouté pour ``' + interaction.user.tag + '``')
                return "add";
            } catch (error) {
                console.error(error)
            }
        }

        return "error"
    }
}