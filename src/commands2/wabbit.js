const { SlashCommandBuilder } = require('@discordjs/builders')
const { ButtonBuilder, ActionRowBuilder } = require('discord.js')
const { ButtonStyle } = require('discord-api-types/v8')
const fs = require('fs')
const path = require('path')

let usersByChannel = {}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('wabbit')
        .setDescription('Commence une partie de tape-wabbit')
        .addIntegerOption(option =>
            option
                .setName('nombre')
                .setDescription('Nombre de wabbits')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(15)
        )
    ,
    async execute (interaction) {
        const channelId = interaction.channel.id

        if (usersByChannel[channelId]) {
            return interaction.reply('Une partie est déjà en cours dans ce salon.')
        }

        usersByChannel[channelId] = {
            users: {},
            nbWabbits: 0,
            nbCatched: 0,
            randomID: 0,
            maxWabbits: interaction.options.getInteger('nombre')
        }

        // Génération de wabbits à intervalles aléatoires
        const generateWabbits = () => {
            const randomDelay = Math.floor(Math.random() * 5000) + 5500 // Délai entre 2 et 10 secondes
            setTimeout(() => {
                if (usersByChannel[channelId].nbWabbits < usersByChannel[channelId].maxWabbits) {
                    console.log('On attend ' + (randomDelay) / 1000 + ' secondes')
                    usersByChannel[channelId].nbWabbits++
                    this.generateWabbit(interaction.channel)
                    generateWabbits() // Appel récursif pour le prochain wabbit
                } else {
                    this.endGame(interaction.channel)
                }
            }, randomDelay)
        }

        // Démarrez la première génération de wabbits
        generateWabbits()

        return interaction.reply('La partie a commencé !')
    },

    async executeButton (interaction, buttonName) {
        const user = interaction.user
        const userName = interaction.member.nickname ?? user.username

        const buttonType = buttonName.split('_')[0]
        const uniqueID = parseInt(buttonName.split('_')[1])

        const channelData = usersByChannel[interaction.channel.id]

        if (uniqueID === channelData.randomID) {

            if (buttonType !== 'hit') {
                return interaction.reply({
                    content: `Mais, tu viens de lui faire un ${buttonType} ?`,
                    ephemeral: true
                })
            }
            // On vide le randomID
            channelData.randomID = 0

            // On récupère les scores du channel
            // Si l'utilisateur n'y est pas (id), on l'ajoute
            // On ajoute ensuite 1 point.
            if (!channelData.users[user.id]) {
                channelData.users[user.id] = {
                    score: 0,
                    username: userName,
                }
            }

            channelData.users[user.id].score++
            channelData.nbCatched++

            const userScore = channelData.users[user.id].score
            const plural = userScore > 1 ? 's' : ''

            return interaction.reply(`${userName} a eu le point ! Il a maintenant ${userScore} point${plural}`)
        }

        // Si le randomID est à 0, le wabbit a déjà été attrapé
        if (channelData.randomID === 0) {
            return interaction.reply({
                content: 'Ce wabbit a déjà été attrapé !',
                ephemeral: true
            })
        }

        // Sinon simplement trop tard !
        return interaction.reply({
            content: 'Trop tard !',
            ephemeral: true
        })
    },

    async generateWabbit (channel) {
        const wabbitFolder = path.join(__dirname, '..', '..', 'assets', 'wabbits')

        // Lire les fichiers du dossier wabbit
        const wabbitFiles = fs.readdirSync(wabbitFolder)

        // Choisir aléatoirement un fichier parmi la liste
        const randomFileName = wabbitFiles[Math.floor(Math.random() * wabbitFiles.length)]

        // Construire le chemin complet du fichier
        const imagePath = path.join(wabbitFolder, randomFileName)

        const randomID = Math.floor(Math.random() * 1000)

        usersByChannel[channel.id].randomID = randomID

        /*
         * Ajouter :
         * - Patawaii : - 4 points
         * - Krisegis : - 1 point
         * - Crâ bot  : + 2 points
         *
         * Ajouter image
         */

        let buttonHit = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`wabbit-hit_${randomID}`)
                .setEmoji('⛔')
                .setLabel('TAPER')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId(`wabbit-bisou_${randomID}`)
                .setEmoji('⛔')
                .setLabel('BISOUS')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId(`wabbit-câlin_${randomID}`)
                .setEmoji('⛔')
                .setLabel('Câlin')
                .setStyle(ButtonStyle.Danger),
        )

        buttonHit.components.sort(() => Math.random() - 0.5)

        const message = await channel.send({
            content: `Un wabbit est arrivé ! (${randomID})`,
            components: [buttonHit],
            files: [imagePath], // Attache le fichier (l'image) au message
        })

        // Supprimer le message après 5 secondes
        setTimeout(() => {
            if (!message.deleted) {
                message.delete().catch(error => console.error('Erreur lors de la suppression du message :', error))
            }
        }, 5000)
    },

    async endGame (channel) {
        let ladder = usersByChannel[channel.id].users

        let sorted = Object.entries(ladder).sort((a, b) => b[1].score - a[1].score)

        let ladderMessage = ''
        for (let i = 0; i < sorted.length; i++) {
            ladderMessage += `${i + 1}. ${sorted[i][1].username} : ${sorted[i][1].score} point${sorted[i][1].score > 1 ? 's' : ''}\n`
        }

        delete usersByChannel[channel.id]
        return channel.send(ladderMessage)
    },
}