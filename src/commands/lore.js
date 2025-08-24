const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js')
const { api_lore } = require('../../config/config_bot.json')
const axios = require('axios')
const { ButtonStyle } = require('discord-api-types/v8')
const { escapeHTML, substringContent } = require('../utils/Utils')
const embedData = require('../utils/embed')
const { Op } = require('sequelize')
const Constantes = require("../utils/Constantes");
const LoreElement = require('../models/LoreElement').default

const WIKI_RP = 'https://dofus-rp.fandom.com/fr/'

let interactionsCache = []

const NOMS = {
    item: 'Objets', npc: 'PNJ', document: 'Documents', article: 'Articles', page: 'Pages WIKI'
}

module.exports = {
    allowedGuildIds: Constantes.allowedGuildIds,
    opts: {}, data: new SlashCommandBuilder()
        .setName('lore')
        .setDescription('Cherche des objets, articles ou dialogues de PNJ')
        .addStringOption(option => option.setName('search')
                                         .setDescription('recherche sur les objets, documents, articles ou dialogues de PNJ')
                                         .setRequired(true)), interactions: [], async execute (interaction) {
        const search = interaction.options.getString('search')

        await interaction.reply('Voici ce que j\'ai !')

        await console.log(`Recherche de ${search} par ${interaction.user.username}`)

        const tab = [{ type: 'item', truncate: true }, { type: 'npc', truncate: true }, {
            type: 'document',
            truncate: true
        }, { type: 'article', truncate: true }]

        for (const item of tab) {
            const data = await this.getData(item.type, search)
            const send = await this.sendResults(interaction, data, item.type, item.truncate)
            if (send) {
                this.saveInteraction(send, data, item.type, search)
            }
        }

        try {
            const callWiki = WIKI_RP + `api.php?action=query&list=search&srsearch=${search}&format=json`

            const wikiResponse = await axios.get(callWiki)

            const WikiData = wikiResponse.data.query?.search ?? []

            let pages = []
            for (let i = 0; i < WikiData.length; i++) {
                const item = WikiData[i]
                pages.push({
                               name: item.title, content: [WIKI_RP + `wiki/?curid=${item.pageid}`]
                           })
            }

            let data = {
                'data': pages, 'limit': 10, 'offset': 0, 'total': pages.length,
            }

            await this.sendResults(interaction, data, 'page', true)
        } catch (error) {
            console.error(error)
            await interaction.channel.send('Erreur lors de la récupération des données WIKI')
        }
    }, /*

                [Sequelize.Op.or]: [
                    { nom: { [Sequelize.Op.like]: `%${search}%` } },
                    { texte: { [Sequelize.Op.like]: `%${search}%` } }
                ]
     */

    async getData (route, search, offset = 0) {
        const data = await LoreElement.findAll({
                                                   where: {
                                                       type: route,
                                                       [Op.or]: [{ name: { [Op.like]: `%${search}%` } }, { content: { [Op.like]: `%${search}%` } }]
                                                   }, limit: 20, offset: offset // Add offset for pagination
                                               })

        const dataFormatted = data.map(item => {
            return {
                name: item.get('name'), content: item.get('content')
            }
        })

        const count = await LoreElement.count({
                                                  where: {
                                                      type: route,
                                                      [Op.or]: [{ name: { [Op.like]: `%${search}%` } }, { content: { [Op.like]: `%${search}%` } }]
                                                  }
                                              })

        return {
            'data': dataFormatted, 'limit': 20, 'offset': offset, 'total': count
        }
    },

    async getResult (data, type = '', truncate = true) {
        const items = data.data
        const limit = parseInt(data.limit)
        const offset = parseInt(data.offset)
        const total = parseInt(data.total)

        let categorie = NOMS[type]

        if (!items.length) {
            return {
                content: `**${categorie}** : Aucun résultat`,
            }
        }

        const nombrePages = Math.ceil(total / limit) ? Math.ceil(total / limit) : 1
        const pageActuelle = Math.ceil(offset / limit) + 1

        let lines = []

        for (let i = 0; i < items.length; i++) {
            const item = items[i]
            const name = escapeHTML(item.name)

            let content = ''
            if (truncate) {
                content = substringContent(escapeHTML(item.content))
            } else {
                content = escapeHTML(item.content)
            }

            lines.push(`- **${name}** : ${content}`)
        }

        lines.push(`\nPage ${pageActuelle}/${nombrePages}`)

        let itemsEmbed = embedData.createEmbed([], {
            title: `**${total} ${categorie} :**`, description: lines.join('\n'),
        })

        let components = []

        if (nombrePages > 1) {
            const row = new ActionRowBuilder()

            const precedent = new ButtonBuilder()
                .setCustomId(`lore-last`)
                .setLabel('Précedent')
                .setStyle(ButtonStyle.Success)
                .setDisabled(offset === 0)
            const suivant = new ButtonBuilder()
                .setCustomId(`lore-next`)
                .setLabel('Suivant')
                .setStyle(ButtonStyle.Success)
                .setDisabled(offset + limit >= total)

            row.addComponents(precedent)
            row.addComponents(suivant)

            components = [row]
        }

        return {
            embeds: itemsEmbed.embeds, files: itemsEmbed.files, components: components,
        }
    },

    async executeButton (interaction, buttonName) {
        const interactionCache = interactionsCache[interaction.message.id]
        const message = interaction.message

        console.log()
        if (!interactionCache) {
            interaction.channel.send('Erreur lors de la récupération des données de la requête.')
        }

        let offset = parseInt(interactionCache.offset)

        if (buttonName === 'last') {
            offset -= interactionCache.limit
        } else if (buttonName === 'next') {
            offset += interactionCache.limit
        }

        const data = await this.getData(interactionCache.type, interactionCache.search, offset)
        await this.editResults(interactionCache.message, data, interactionCache.type, interactionCache.type !== 'article')
        this.saveInteraction(message, data, interactionCache.type, interactionCache.search)

        return await interaction.deferUpdate()
    }, saveInteraction (message, data, name = '', search = '') {
        const type = name
        const limit = parseInt(data.limit)
        const offset = parseInt(data.offset)
        const total = parseInt(data.total)

        interactionsCache[message.id] = {
            message: message, search: search, type: type, limit: limit, offset: offset, total: total
        }
    },

    async sendResults (interaction, data, type = '', truncate = true) {
        const retour = await this.getResult(data, type, truncate)
        if (retour) {
            return await interaction.channel.send(retour)
        }
        return null
    },

    async editResults (message, data, type, truncate) {
        const retour = await this.getResult(data, type, truncate)
        return await message.edit(retour)
    }
}