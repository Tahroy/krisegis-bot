const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js')
const { addPlayerItem } = require('../utils/Utils')
const { ButtonStyle } = require('discord-api-types/v8')

const larvesLabels = {
    'larveB': 'Larve bleue',
    'larveD': 'Larve dorée',
    'larveO': 'Larve orange',
    'larveV': 'Larve verte',
    'larveVio': 'Larve violette',
}

const LARVES = {
    'larve_bleue': {
        'name': 'Larve bleue',
        'id' : '1265760235977441365'
    }, 'larve_doree': {
        'name': 'Larve dorée',
        'id' : '1265760228947922986'
    }, 'larve_orange': {
        'name': 'Larve orange',
        'id' : '1265760504731668520'
    }, 'larve_verte': {
        'name': 'Larve verte',
        'id': '1265760497907794010'
    }, 'larve_violette': {
        'name': 'Larve violette',
        'id': '1265760402965397599'
    }, 'larve_rose': {
        'name': 'Larve rose',
        'id': '1265753280534020226'
    }, 'larve_grise': {
        'name': 'Larve grise',
        'id': '1265760658063102058'
    },
}

let partiesEnCours = []

module.exports = {
    opts: {},
    data: new SlashCommandBuilder()
        .setName('larve')
        .setDescription('Permet de jouer au jeu des larves')
        .setDMPermission(false)
    ,
    async execute (interaction) {
        // const subCommand = interaction.options.getSubcommand();
        this.client = interaction.client

        await this.displayLarvesButtons(interaction)
    },

    async displayLarvesButtons (interaction) {
        const channelId = interaction.channel.id

        if (partiesEnCours[channelId]) {
            await interaction.reply('Une partie est déjà en cours !')
            return
        }

        partiesEnCours[channelId] = new Game()

        partiesEnCours[channelId].message = await interaction.reply(partiesEnCours[channelId].getReplyButtons(interaction))
    },
    async executeButton (interaction, buttonName) {
        const game = partiesEnCours[interaction.channel.id]

        if (!game || game.status === 'ended') {
            interaction.reply({
                content: 'Aucune partie en cours',
                ephemeral: true
            })
            return;
        }

        if (buttonName === 'go') {
            await game.launchGame(interaction)
        } else {
            await game.addNewLarve(interaction, buttonName)
        }

    },
}

class Game {
    status = 'waiting'
    message = null
    larves = {}
    plateau = {}
    winner = null
    flag = ':checkered_flag:'
    sautLigne = '\n'

    async addNewLarve (interaction, buttonName) {
        if (this.status !== 'waiting') {
            interaction.reply({
                content: "La partie est déjà en cours !",
                ephemeral: true
            })
            return;
        }
        const userId = interaction.user.id
        const userName = interaction.member.nickname ?? interaction.member.user.globalName

        // On vérifie que la larve n'est pas déjà prise
        const larvesEnCours = this.larves

        if (larvesEnCours[buttonName]) {
            await interaction.reply({
                content: 'Cette larve a déjà été choisie !', ephemeral: true
            })
            return
        }

        if (Object.values(larvesEnCours).includes(userId)) {
            await interaction.reply({
                content: 'Vous avez déjà choisi une larve !', ephemeral: true
            })
            return
        }

        larvesEnCours[buttonName] = userId

        const larveName = LARVES[buttonName].name

        interaction.reply({
            content: `${userName} a pris la ${larveName}`, ephemeral: false
        })

        this.message.edit(this.getReplyButtons(interaction))
    }
    async launchGame (interaction) {
        // On vérifie qu'elle est bien en attente
        if (this.status !== 'waiting') {
            return interaction.reply({
                content: 'La partie est déjà lancée !', ephemeral: true
            })
        }

        this.status = 'started'
        this.plateau = {}
        for (const [key, value] of Object.entries(LARVES)) {
            this.plateau[key] = 0
        }

        const plateauMessage = await interaction.channel.send(this.getPlateau())
        interaction.reply({
            content: "C'est parti !",
            ephemeral: true
        })
        let game = this
        const interval = setInterval(async function () {
            game.updateLarves()
            await plateauMessage.edit(game.getPlateau())
            game.checkWinner()

            if (game.status === 'ended') {
                await game.annoncerGagnant(interaction)
                await clearInterval(interval)
            }
        }, 1000)
    }

    /**
     * Iterates over the plateau object to determine the winner based on the maximum value.
     *
     */
    checkWinner () {
        let winner = null;
        let max = 14
        for (const [key, value] of Object.entries(this.plateau)) {
            if (value >= max) {
                winner = key
                max = value
                this.status = 'ended'
                this.winner = winner
            }
        }
    }

    annoncerGagnant (interaction) {
        if (!this.winner) {
            console.error("Aucun gagnant !")
            return
        }

        const channel = interaction.channel

        const playerId = this.larves[this.winner]
        const larveLabel = LARVES[this.winner]

        if (!playerId) {
            channel.send({content: `${larveLabel.name} a gagné, mais personne ne l'a choisie, dommage !` })
        }
        else {
            channel.send({content: `${larveLabel.name} a gagné ! Bravo à <@!${playerId}>`})
            addPlayerItem({id: playerId}, larveLabel.name)
        }

        partiesEnCours[channel.id] = null
    }

    getPlateau () {
        const base = this.flag + this.flag + this.flag + this.flag + this.flag + this.flag + this.sautLigne
        const larves =  [];
        for (const [key, value] of Object.entries(this.plateau)) {
            larves.push(this.getLarve(key))
        }

        const end = this.sautLigne + this.flag + this.flag + this.flag + this.flag + this.flag + this.flag

        return base + larves.join(this.sautLigne) + end
    }

    updateLarves() {
        for (const [key, value] of Object.entries(this.plateau)) {
            switch(key) {
                case 'larve_violette':
                    this.plateau[key] += Math.floor(Math.random() * 5) - 1
                    break
                case 'larve_rose':
                    this.plateau[key] += Math.floor(Math.random()) + 1
                    break
                default:
                    this.plateau[key] += Math.floor(Math.random() * 3)
            }
        }
    }
    /**
     * Permet de générer le message avec les boutons des larves
     *
     * @param interaction
     * @returns {{components: *[], content: string}}
     */
    getReplyButtons (interaction) {
        const larves = this.larves

        // On va créer un bouton par larve
        let buttons = []
        let row1 = new ActionRowBuilder()
        let row2 = new ActionRowBuilder()

        let count = 0
        for (const [key, value] of Object.entries(LARVES)) {
            count++
            if (count <= 5) {
                row1.addComponents(new ButtonBuilder()
                    .setCustomId(`larve-${key}`)
                    .setLabel(value.name)
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji(`<:${key}:${LARVES[key].id}>`)
                    .setDisabled(!!larves[key]))
            } else {
                row2.addComponents(new ButtonBuilder()
                    .setCustomId(`larve-${key}`)
                    .setLabel(value.name)
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji(`<:${key}:${LARVES[key].id}>`)
                    .setDisabled(!!larves[key]))
            }
        }

        row2.addComponents(new ButtonBuilder()
            .setCustomId(`larve-go`)
            .setLabel('Lancer la course')
            .setStyle(ButtonStyle.Success)
            .setEmoji('➡️')
            .setDisabled(this.status !== 'waiting'))

        buttons.push(row1, row2)

        return {
            content: 'Veuillez choisir une larve ou lancer la course', components: buttons
        }
    }

    getLarve (key) {
        let retour = this.flag;

        const larve = this.plateau[key]
        for (let i = 0; i < larve; i++) {
            retour += '-'
        }

        const id = LARVES[key].id

        return retour + `<:${key}:${id}>`
    }
}