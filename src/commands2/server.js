const {
    MessageActionRow, SlashCommandBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonBuilder
} = require('discord.js')
const Server = require('../database/Server')
const { ButtonStyle } = require('discord-api-types/v10')
const { PermissionFlagsBits } = require('discord-api-types/v8')

module.exports = {
    opts: {},
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Choisir son serveur.')
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
                .addRoleOption(
                    option => option
                        .setName('game')
                        .setDescription('Le jeu du serveur')
                )
                .addStringOption(
                    option => option
                        .setName('tag')
                        .setDescription('Tag du serveur')
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
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .setDMPermission(false)
    ,
    async execute (interaction) {
        const subCommand = interaction.options.getSubcommand()

        switch (subCommand) {
            case 'add':
                await this.addServer(interaction)
                break
            case 'remove':
                await this.removeServer(interaction)
                break
            case 'list':
                await this.listServers(interaction)
                break
            default:
                await interaction.reply({ content: 'Commande inconnue !', ephemeral: true })
        }
    },
    async executeButton (interaction, buttonName) {
        const args = buttonName.split('_')

        const action = args[0]
        const roleID = args[1]

        const member = interaction.member
        const role = interaction.guild.roles.cache.find(role => role.id === roleID)

        if (action === 'add') {
            await member.roles.add(role)
        } else if (action === 'remove') {
            await member.roles.remove(role)
        }

        this.checkJeuxPrincipaux(member)

        return await interaction.deferUpdate();
        interaction.reply(interaction.user.username + ` ${action} ${role.name}`)
    },
    checkJeuxPrincipaux (member) {
        Server.findAll({
            attributes: ['game'],
            group: ['game'],
        }).then((games) => {
            for (const game of games) {

                // Le rôle du jeu (Dofus, Wakfu...)
                const roleGame = member.guild.roles.cache.find(role => role.id === game.game)

                console.log(`Check de ${roleGame.name}`)
                console.log('Jeu ID :', roleGame.id)
                // On récupère tous les serveurs de ce jeu
                const servers = Server.findAll({
                    where: { game: roleGame.id }
                }).then((servers) => {
                    if (!servers.length) {
                        console.log(`Aucun serveur trouvé pour le jeu ${roleGame.name}`)
                    }

                    for (const server of servers) {
                        console.log(`Check de ${server.id}`)

                        const hasRole = member.roles.cache.find(role => role.id === server.id)
                        if (hasRole) {
                            console.log('Le membre a un serveur correspondant. On lui ajoute le jeu')
                            member.roles.add(roleGame)
                            return
                        }
                    }

                    console.log('Aucun serveur trouvé, on lui retire le jeu')
                    member.roles.remove(roleGame)
                })
            }
        })
    },

    // Ajout / Retrait
    async addServer (interaction) {
        const server = interaction.options.getRole('server')
        const game = interaction.options.getRole('game')
        const tag = interaction.options.getString('tag');

        await Server.create({
            id: server.id,
            game: game.id ?? '',
            guild: interaction.guild.id,
            tag: tag
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
            .then((games) => {
                games.forEach((game) => {
                    this.sendServers(interaction, game)
                })
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
        const rowAjouter = new ActionRowBuilder()
        const rowRetirer = new ActionRowBuilder()

        for (const server of servers) {

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
        }

        await interaction.channel.send({ content: `Serveurs ${name}:`, components: [rowAjouter, rowRetirer] })
    },
}