const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, EmbedBuilder } = require('discord.js')
const embedData = require('../utils/embed')
const { Axios } = require('axios')
const axios = require('axios')
const { ButtonStyle } = require('discord-api-types/v10')
const Capture = require('../database/Capture')
const { Op } = require('sequelize')
const { autocompleteLore } = require('../utils/Utils')

// 3 heyres
const timeBetweenCaptures = 60 * 60 * 1000 * 3
const timeBetweenResetRoll = 60 * 60 * 1000 * 3
const numberOfRolls = 10

/**
 * Jeu basé sur mudae.
 * Roll des monstres
 * Capture
 * Inventaire
 */
module.exports = {
    data: new SlashCommandBuilder()
        .setName('osatopia')
        .setDescription('Jeu de capture de monstres')
        .setDMPermission(false)
        .addSubcommand(subcommand => subcommand
            .setName('roll')
            .setDescription('Roll des monstres'))
        .addSubcommand(subcommand => subcommand
            .setName('captures')
            .setDescription('Liste de vos captures'))
        .addSubcommand(subcommand => subcommand
            .setName('view')
            .setDescription('Voir un monstre')
            .addIntegerOption(option => option
                .setName('id')
                .setDescription('ID du monstre')
                .setRequired(true)
                .setAutocomplete(true))),

    async execute (interaction) {
        const command = interaction.options.getSubcommand()

        switch (command) {
            case 'roll':
                await this.roll(interaction)
                break
            case 'captures':
                this.captures(interaction)
                break
            case 'view':
                await this.view(interaction)
                break
            default:
                break
        }
    },

    async roll (interaction) {
        // On vérifie que le user n'a pas déjà roll 3 fois depuis 3 heures
        const conditions = {
            createdAt: {
                [Op.gte]: timeBetweenResetRoll
            }, rollUserId: interaction.user.id
        }
        const captures = await Capture.findAll({ where: conditions })

        if (captures.length >= numberOfRolls) {
            await interaction.reply({ content: `Vous avez déjà fait vos rolls`, ephemeral: true })
            return
        }

        // Requête DofusDB via Axios
        const monstersTotalRequest = await axios.get('https://api.dofusdb.fr/monsters?$skip=0&$limit=1')
        const total = monstersTotalRequest.data.total

        const random = Math.floor(Math.random() * total) + 1

        const monsterRequest = await axios.get(`https://api.dofusdb.fr/monsters?$skip=${random}&$limit=1`)
        const monster = monsterRequest.data.data[0]

        const id = monster.id
        const name = monster.name.fr
        const look = monster.look

        const capture = { monsterId: id, date: new Date(), monsterName: name, rollUserId: interaction.user.id }
        const captureDB = await Capture.create(capture)

        const hexa = Buffer.from(look).toString('hex')
        const img = `https://renderer.dofusdb.fr/look/${hexa}/full/1/150_150.png`

        const timestamp = Date.now()

        const row = new ActionRowBuilder()
            .addComponents(new ButtonBuilder()
                               .setLabel('Capture')
                               .setCustomId(`osatopia-capture-${captureDB.id}-${timestamp}`)
                               .setStyle(ButtonStyle.Success))

        const embed = new EmbedBuilder()
            .setTitle(`${name}`)
            .setImage(img) // Ajouter l'image

        // JSON
        interaction.reply({ embeds: [embed], components: [row] })

    },

    async view (interaction) {
        const id = interaction.options.getInteger('id')

        const capture = await Capture.findOne({ where: { id: id } })

        if (!capture) {
            await interaction.reply({ content: 'Cette capture n\'existe pas !', ephemeral: true })
            return
        }

        const name = capture.monsterName
        const monsterId = capture.monsterId

        // Request DofusDB
        const monsterRequest = await axios.get(`https://api.dofusdb.fr/monsters/${monsterId}`)
        const monster = monsterRequest.data
        const look = monster.look

        const hexa = Buffer.from(look).toString('hex')
        const img = `https://renderer.dofusdb.fr/look/${hexa}/full/1/150_150.png`

        const dateFr = capture.catchDate.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })

        const embed = new EmbedBuilder()
            .setTitle(`${name}`)
            .setDescription(`Capturé le ${dateFr}`)
            .setImage(img)

        interaction.reply({ embeds: [embed] })
    },

    inventory (interaction) {
        interaction.reply('Inventaire')
    },

    captures (interaction) {
        const user = interaction.user

        Capture.findAll({ where: { catchUserId: user.id }, order: [['monsterName', 'DESC']] }).then(captures => {
            if (captures.length === 0) {
                interaction.reply('Vous n\'avez pas capturé de monstres !')
                return
            }

            let capturesArray = []
            for (const capture of captures) {
                const date = capture.catchDate
                // dd/mm/YY
                const dateString = date.toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                })
                capturesArray.push(`${dateString} - ${capture.monsterName}`)
            }

            const embed = new EmbedBuilder()
                .setTitle('Vos captures')

            interaction.reply({ embeds: [embed.setDescription(capturesArray.join('\n'))] })
        }).catch(error => {
            console.error(error)
        })
    },

    async executeButton (interaction, buttonName) {
        const id = interaction.customId.split('-')[2]
        const user = interaction.user

        const capture = await Capture.findOne({ where: { id: id } })

        if (!capture) {
            await interaction.reply({ content: 'Cette capture n\'existe pas !', ephemeral: true })
            return
        }

        // On vérifie que la capture n'est pas déjà prise
        if (capture.catchUserId) {
            await interaction.reply({ content: 'Cette capture a déjà été prise !', ephemeral: true })
            return
        }

        // On vérifie que la capture n'est pas trop vieille
        if (new Date() - capture.date > 60 * 60 * 1000) {
            await interaction.reply({ content: 'Cette capture est trop vieille !', ephemeral: true })
        }

        // On vérifie que le user n'a pas déjà roll il y a moins de 3h
        const conditions = { catchDate: { [Op.gte]: timeBetweenCaptures }, catchUserId: user.id }
        const captures = await Capture.findAll({ where: conditions })

        if (captures.length > 0) {
            await interaction.reply({ content: 'Vous avez capturé un monstre il y a moins de 3h !', ephemeral: true })
            return
        }

        const name = capture.monsterName

        await Capture.update({ catchUserId: user.id, catchDate: new Date() }, { where: { id: id } })

        interaction.reply(`${user.username} a capturé ${name} !`)
    },

    async autocomplete (interaction) {
        const user = interaction.user

        const captures = await Capture.findAll({ where: { catchUserId: user.id }, order: [['monsterName', 'DESC']] })

        const retours = []

        for (const capture of captures) {
            retours.push({
                             name: capture.monsterName, value: capture.id
                         })
        }

        await interaction.respond(retours)
    }
}