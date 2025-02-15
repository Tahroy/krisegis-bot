const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, InteractionContextType} = require('discord.js')
const { ButtonStyle } = require('discord-api-types/v8')
const { PlayerService, ItemType } = require('../services/playerItemService')
const Larve = require('../models/Larve').default

const LARVES = {
    'larve_bleue': {
        'name': 'Larve bleue', 'id': '1265760235977441365'
    }, 'larve_doree': {
        'name': 'Larve dorée', 'id': '1265760228947922986'
    }, 'larve_orange': {
        'name': 'Larve orange', 'id': '1265760504731668520'
    }, 'larve_verte': {
        'name': 'Larve verte', 'id': '1265760497907794010'
    }, 'larve_violette': {
        'name': 'Larve violette', 'id': '1265760402965397599'
    }, 'larve_rose': {
        'name': 'Larve rose', 'id': '1265753280534020226'
    }, 'larve_grise': {
        'name': 'Larve grise', 'id': '1265760658063102058'
    }, 'britalarve': {
        'name': 'Britalarve',
        'id': '1338228518861144077'
    },
    'larve_rushu': {
        'name': 'Larve de Rushu',
        'id': null
    }
}

const GAME_CONSTANTS = {
    MAX_SCORE: 30,
    MAX_PLAYERS: 7,
    DEATH_CHANCE: 200,
    UPDATE_INTERVAL: 1000,
    FLAG: ':checkered_flag:',
    NEW_LINE: '\n'
}

let partiesEnCours = new Map()
let emojis = {};

module.exports = {
    opts: {}, data: new SlashCommandBuilder()
        .setName('larve')
        .setDescription('Permet de jouer au jeu des larves')
        .setContexts(
            InteractionContextType.Guild
        ),

    async execute (interaction) {
        // const subCommand = interaction.options.getSubcommand();
        this.client = interaction.client

        await this.displayLarvesButtons(interaction)
        /* TEST */

        /*
        interaction.reply({ content: 'Termine !', ephemeral: true })

        for (let i = 0; i < 10000; i++) {

            partiesEnCours[i] = new Game(interaction.client)
            partiesEnCours[i].modeTest = true;
            partiesEnCours[i].channel = interaction.channel
            const game = partiesEnCours[i]
            for (const [key, value] of Object.entries(game.larvesGame)) {
                game.plateau[key] = 0
            }
            while (true) {
                game.updateLarves()
                game.checkWinner()

                console.log('Un tour !')

                if (game.status === 'ended') {
                    await game.annoncerGagnant(interaction)
                    break;
                }
            }
        }
        */

    },

    async displayLarvesButtons (interaction) {
        const channelId = interaction.channel.id

        if (partiesEnCours.has(channelId)) {
            await interaction.reply('Une partie est déjà en cours !')
            return
        }

        interaction.deferReply()

//        interaction.deferReply()
        partiesEnCours.set(channelId, new Game(interaction.client))
        const game = partiesEnCours.get(channelId)
        game.channel = interaction.channel

        const replyButtons = await game.getReplyButtons();

        try {
            game.message = await interaction.editReply(replyButtons)
        } catch (error) {
            console.error('Erreur lors de la récupération des boutons :', error)
        }
    }, 
    
    async executeButton (interaction, buttonName) {

        /**
         * @var Game game
         */
        const game = partiesEnCours.get(interaction.channel.id)

        if (!game || game.status === 'ended') {
            interaction.reply({
                content: 'Aucune partie en cours', ephemeral: true
            })
            return
        }

        if (buttonName === 'go') {
            await game.launchGame(interaction)
        } else {
            await game.addNewLarve(interaction, buttonName)
            if (Object.values(game.larves).length === GAME_CONSTANTS.MAX_PLAYERS) {
                await game.launchGame(interaction)
            }
        }

    },

}

class Game {
    larvesGame = {}
    status = 'waiting'
    message = null
    larves = {}
    plateau = {}
    winner = null
    flag = GAME_CONSTANTS.FLAG
    sautLigne = GAME_CONSTANTS.NEW_LINE
    deaths = {}
    channel = null
    client = null
    modeTest = false;

    constructor(client) {
        this.larvesGame = this.getRandomLarves(LARVES)
        this.client = client;
    }
    async addNewLarve (interaction, buttonName) {
        if (this.status !== 'waiting') {
            interaction.reply({
                content: 'La partie est déjà en cours !', ephemeral: true
            })
            return
        }
        const userId = interaction.user.id
        const userName = interaction.member.nickname ?? interaction.member.user.globalName

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

        const larveName = this.larvesGame[buttonName].name

        interaction.reply({
            content: `${userName} a pris la ${larveName}`, ephemeral: false
        })

        if (this.message) {
            this.message.edit(await this.getReplyButtons())
        }
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

        for (const [key, value] of Object.entries(this.larvesGame)) {
            this.plateau[key] = 0
        }

        const plateau = await this.getPlateau();
        const plateauMessage = await interaction.channel.send(plateau)

        if (!this.modeTest) {
            interaction.reply({
                content: 'C\'est parti !', ephemeral: true
            })
        }

        let game = this

        const interval = setInterval(async function () {
            game.updateLarves()
            const plateau = await game.getPlateau();

            await plateauMessage.edit(plateau)

            await game.checkWinner()

            if (game.status === 'ended') {
                await game.annoncerGagnant(interaction)
                await clearInterval(interval)
            }
        }, GAME_CONSTANTS.UPDATE_INTERVAL)
    }

    /**
     * Iterates over the plateau object to determine the winner based on the maximum value.
     *
     */
    checkWinner () {
        const deathsCounter = Object.values(this.deaths).length
        const larvesCounter = Object.values(this.larvesGame).length
        if (deathsCounter === larvesCounter) {
            this.status = 'ended'
            this.winner = 'nobody'
            return
        }
        let winner = null
        let max = GAME_CONSTANTS.MAX_SCORE
        for (const [key, value] of Object.entries(this.plateau)) {
            if (value >= max) {
                winner = key
                max = value
                this.status = 'ended'
                this.winner = winner
                return;
            }
        }
    }

    async annoncerGagnant (interaction) {
        try {
            if (this.winner === 'nobody') {
                await this.channel.send({'content': 'Aucun gagnant !'})
                return
            }

            const channel = interaction.channel
            const playerId = this.larves[this.winner]
            const larveLabel = this.larvesGame[this.winner]

            // Vérification que larveLabel existe
            if (!larveLabel) {
                console.error(`Larve gagnante invalide: ${this.winner}`)
                await channel.send({content: 'Erreur lors de l\'annonce du gagnant'})
                return
            }

            let message = '';
            if (!playerId) {
                message = `${larveLabel.name} a gagné, mais personne ne l'a choisie, dommage !`;
            } else {
                message = `${larveLabel.name} a gagné ! Bravo à <@!${playerId}>`;

                try {
                    const user = await interaction.client.users.fetch(playerId)
                    await PlayerService.addPlayerItem(user, larveLabel.name, ItemType.LARVE)
                } catch (error) {
                    console.error('Erreur lors de l\'ajout de l\'item au joueur:', error)
                    // On continue quand même pour annoncer le gagnant
                }
            }

            if (!this.modeTest) {
                await channel.send({content: message})
            }

            try {
                // On enregistre dans la table larve laquelle a gagné
                let larve = await Larve.findOne({
                    where: { name: this.winner }
                })

                if (larve) {
                    larve.nb += 1
                    await larve.save()
                } else {
                    await Larve.create({
                        name: this.winner, nb: 1
                    })
                }
            } catch (error) {
                console.error('Erreur lors de l\'enregistrement de la victoire:', error)
            }

            partiesEnCours.delete(channel.id)
        } catch (error) {
            console.error('Erreur lors de l\'annonce du gagnant:', error)
            try {
                await this.channel.send({content: 'Une erreur est survenue lors de l\'annonce du gagnant'})
            } catch (e) {
                console.error('Impossible d\'envoyer le message d\'erreur:', e)
            }
        } finally {
            partiesEnCours.delete(interaction.channel.id)
        }
    }

    async getPlateau() {
        const flagLine = GAME_CONSTANTS.FLAG.repeat(11) + this.sautLigne
        const larves = await Promise.all(
            Object.entries(this.plateau).map(([key]) => this.getLarve(key))
        )
        
        return flagLine + larves.join(this.sautLigne) + this.sautLigne + flagLine
    }

    updateLarves () {
        for (const [key] of Object.entries(this.plateau)) {
            this.rollDeath(key);

            if (this.deaths[key]) {
                continue

            }

            let value = Math.random() * 2
            let bonus = 0
            switch (key) {
                case 'larve_violette':
                    value = value * 2
                    if (Math.random() < 0.52) {
                        bonus -= 1.5
                    } else {
                        bonus += 3
                    }
                    break
                case 'larve_rose':
                    value = value * 2
                    bonus += 1.05
                    break
                case 'larve_grise':
                    value = value * 2
                    if (Math.random() < 0.1) {
                        bonus += 7
                    }
                    break
                case 'britalarve':
                    // Britalarve a un % de chance d'arriver à la même place que le premier
                    if (Math.random() < 0.22) {
                        const maxPosition = Math.max(...Object.values(this.plateau))
                        if (maxPosition > this.plateau[key]) {
                            this.plateau[key] = maxPosition + value
                            continue;
                        }
                    }
                    break
                case 'larve_rushu': {
                    // La larve de rushu cible une autre larve. Si celle-ci est devant, elle échange de place avec elle
                    value = value * 2.5
                    if (Math.random() < 0.3) {
                        const autresLarves = Object.keys(this.plateau).filter(otherKey =>
                            otherKey !== key && !this.deaths[otherKey]
                        )

                        if (autresLarves.length > 0) {
                            const targetKey = autresLarves[Math.floor(Math.random() * autresLarves.length)]

                            if (this.plateau[targetKey] > this.plateau[key]) {
                                const tempPosition = this.plateau[key]
                                this.plateau[key] = this.plateau[targetKey]
                                this.plateau[targetKey] = tempPosition
                                value = 0
                            }
                        }
                    }
                    break;

                }
                default:
                    value = value * 2.90
            }

            value = Math.floor(bonus + value)
            this.plateau[key] += value
        }
    }

    /**
     * Permet de générer le message avec les boutons des larves
     *
     */
    async getReplyButtons() {
        const larves = this.larves

        // On va créer un bouton par larve
        let buttons = []
        let row1 = new ActionRowBuilder()
        let row2 = new ActionRowBuilder()

        let count = 0
        for (const [key, value] of Object.entries(this.larvesGame)) {
            count++
            const emoji = await this.getEmoji(key);
            if (count <= 5) {
                row1.addComponents(new ButtonBuilder()
                    .setCustomId(`larve-${key}`)
                    .setLabel(value.name)
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji(emoji)
                    .setDisabled(!!larves[key]))
            } else {
                row2.addComponents(new ButtonBuilder()
                    .setCustomId(`larve-${key}`)
                    .setLabel(value.name)
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji(emoji)
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

    async getLarve(key) {
        let retour = this.flag

        const larve = this.plateau[key]
        for (let i = 0; i < larve; i++) {
            retour += '-'
        }

        if (this.deaths[key]) {
            retour += await this.getEmoji('larve_chair')
            return retour
        }

        return retour + await this.getEmoji(key)
    }

    rollDeath (key) {
        if (this.deaths[key]) {
            return;
        }

        let chance = Math.floor(Math.random() * GAME_CONSTANTS.DEATH_CHANCE) + 1;

        if (chance === 1) {
            this.deaths[key] = true

            const label = LARVES[key].name;

            const DEATHS = [
                `Une dragodinde arrive en courant et dévore **${label}**.`,
                `Une mouette apparaît et emporte **${label}**.`,
                `Malma-Jeste marche sur **${label}.**`,
                `**${label}** a réalisé que le courses n'étaient pas sa vocation.`,
                `**${label}** est morte, simplement.`,
                `E-Bou appparaît, prêt à donner toutes les réponses du Krosmoz, avant de simplement s'enfuir avec **${label}**.`,
                `Euphie apparaît et emporte avec elle **${label}** pour la sauver des courses.`,
                `**${label}** a été écrasée par une grosse pierre.`,
            ];

            const randomIndex = Math.floor(Math.random() * DEATHS.length);

            if (!this.modeTest) {
                this.channel.send(DEATHS[randomIndex])
            }
        }
    }

    getRandomLarves(larves) {
        // Convertir l'objet en tableau
        const larvesArray = Object.entries(larves);

        // Mélanger le tableau (algorithme de Fisher-Yates)
        for (let i = larvesArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [larvesArray[i], larvesArray[j]] = [larvesArray[j], larvesArray[i]];
        }

        // Prendre les 7 premiers éléments et reconvertir en objet
        return Object.fromEntries(larvesArray.slice(0, 7));
    }

    async getEmoji(search) {
        if (emojis[search]) {
            return emojis[search]
        }
        
        try {
            const clientApplicationEmojis = await this.client.application.emojis.fetch()
            const searchEmoji = clientApplicationEmojis.find(emoji => emoji.name === search)
            
            if (!searchEmoji) {
                emojis[search] = ''
                return ''
            }
            
            const emoji = `<:${searchEmoji.name}:${searchEmoji.id}>`
            emojis[search] = emoji
            return emoji
        } catch (error) {
            console.error(`Erreur lors de la récupération de l'emoji ${search}:`, error)
            return ''
        }
    }
}