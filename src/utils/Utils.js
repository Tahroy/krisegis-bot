const { JSDOM } = require('jsdom')
const axios = require('axios')
const { api_lore } = require('../../config/config_bot.json')
const { createEmbed } = require('./embed')
const { Op } = require('sequelize')

const LoreElement = require('../models/LoreElement').default
const PlayerItem = require('../models/PlayerItem').default
const Server = require('../models/Server').default
const Variable = require('../models/Variable').default

function htmlToMarkdown (texteHTML) {
    // Remplacer les balises de paragraphe par des sauts de ligne
    texteHTML = texteHTML.replace(/<p>/g, '\n')
    texteHTML = texteHTML.replace(/<\/p>/g, '')

    // Remplacer les sauts de ligne forcés par des sauts de ligne
    // texteHTML = texteHTML.replace(/<br\s*[/]?>/gi, "\n");

    return texteHTML

}

module.exports = {
    escapeHTML (str) {
        const dom = new JSDOM(str)
        const doc = dom.window.document
        // Extraire le texte brut en accédant à la propriété textContent de l'élément body
        const plainText = doc.body.textContent || ''
        // Retirer les espaces en début et en fin de chaîne
        str = plainText.trim()

        str = str.replace('\n', ' ')
        return str
    },

    substringContent (str) {
        if (str.length > 50) {
            str = str.substring(0, 50) + '...'
        }

        return str
    },

    decouperTexte (texte) {
        function decouperDocument (texte) {
            // Diviser le texte à chaque occurrence de <pagefeed />
            let parts = texte.split('<pagefeed />')

            // Retirer les occurrences vides
            parts = parts.filter(function (part) {
                return part.trim() !== ''
            })

            return parts
        }

        if (texte.includes('<pagefeed />')) {
            // return decouperDocument(texte);
        }
        const longueurMax = 4000 // Nombre maximum de caractères par partie

        if (texte.length < 4000) {
            return [texte]
        }
        const phrases = texte.split('.') // Séparer le texte en phrases
        let partieCourante = '' // Partie courante en cours de construction
        const parties = [] // Tableau pour stocker les parties découpées

        phrases.forEach((phrase, index) => {
            if (partieCourante.length + phrase.length + 1 <= longueurMax) {
                // Ajouter la phrase à la partie courante si cela ne dépasse pas la longueur maximale
                partieCourante += (partieCourante ? '' : '') + phrase + '.'
            } else {
                // Ajouter la partie courante au tableau de parties
                parties.push(partieCourante)
                // Réinitialiser la partie courante avec la phrase actuelle
                partieCourante = phrase + '.'
            }

            // Ajouter la dernière partie courante au tableau de parties
            if (index === phrases.length - 1 && partieCourante) {
                parties.push(partieCourante)
            }
        })

        return parties
    },

    debugMessage (guild, message) {
        const dateHeure = new Date().toLocaleString()
        const debugMessage = '[' + dateHeure + '] ' + message

        console.log(debugMessage)

        if (!guild) {
            console.log('guild non trouvé')
            return
        }

        Variable.findOne({
            where: {
                name: 'debugChannel',
                server: guild.id
            }
        }).then(async (debugChannel) => {
            if (!debugChannel) {
                console.log('debugChannel non trouvé')
                return
            }

            const debugChannelObj = await guild.channels.cache.get(debugChannel.data)
            debugChannelObj.send({ content: debugMessage })

        }).catch((err) => {
            console.log(err)
        })
    },

    async sendLore (item, search, interaction) {

        let decoupeContent = []

        let content = ''
        if (typeof item.content === 'string') {
            content = item.content
        }
        else if (item.content instanceof Array) {
            content = item.content.join("\n")
        }

        const markdown = htmlToMarkdown(content)
        const dom = new JSDOM(markdown)
        const doc = dom.window.document
        // Extraire le texte brut en accédant à la propriété textContent de l'élément body
        const plainText = doc.body.textContent || ''
        // Retirer les espaces en début et en fin de chaîne
        content = plainText.trim()
        const { decouperTexte } = require('./Utils.js')
        decoupeContent = decoupeContent.concat(decouperTexte(content))

        await interaction.reply(`Voilà ce que j'ai trouvé !`)

        for (let i = 0; i < decoupeContent.length; i++) {
            let title = item.name + ` (${item.id})`
            if (decoupeContent.length > 1) {
                let num = i + 1
                title += ` ${num}/${decoupeContent.length}`
            }

            const embed = createEmbed([], {
                title: title,
                description: decoupeContent[i],
                author: 'ID : ' + search
            })
            await interaction.channel.send({ embeds: embed.embeds, files: embed.files })
        }
    },
    async executeLore (interaction, endPoint = '') {
        let search = interaction.options.getString('query')

        console.log(`Recherche de ${search} (${endPoint}) par ${interaction.user.username}`)

        const item = await LoreElement.findOne({
            where: {
                id: search,
                type: endPoint
            }
        })

        const object = {
            'name': item.get('name'),
            'content': item.get('content'),
            'id': item.get('id')
        }

        const { sendLore } = require('./Utils.js')
        await sendLore(object, search, interaction)

    },
    async autocompleteLore (interaction, endPoint = '') {
        const search = interaction.options.getFocused()

        if (!search || search.length < 3) {
            await interaction.respond([])
            return
        }

        console.log(`Recherche de ${search} (${endPoint}) par ${interaction.user.username}`)

        let items = await LoreElement.findAll({
            where: {
                type: endPoint,
                [Op.or]: [
                    { name: { [Op.like]: `%${search}%` } },
                 //   { content: { [Op.like]: `%${search}%` } }
                ]
            },
            limit: 25
        })

        // Construction de la réponse avec les résultats sous forme d'autocomplétions
        const choices = items.map(item => ({
            name: item.name + ` (${item.id})`,
            value: '' + item.id
        })).slice(0, 25)

        await interaction.respond(choices)
    },

    async checkTags (member) {
        Server.findAll({
            where: { guild: member.guild.id }
        }).then(async (servers) => {
                var tag = ''
                for (const server of servers) {
                    const hasRole = await member.roles.cache.find(role => role.id === server.id)

                    if (hasRole) {
                        if (tag !== '') {
                            tag = 'Multi'
                            break
                        }
                        tag = server.tag
                    }
                }

                let nickName = member.nickname || member.user.username
                if (nickName.includes('[') && nickName.includes(']')) {
                    [, nickName] = nickName.split('] ', 2)
                }

                console.log(`Tag : ${tag} | Nickname : ${nickName}`)

                try {
                    if (tag) {
                        await member.setNickname(`[${tag}] ${nickName}`)
                    } else {
                        await member.setNickname(nickName)
                    }
                } catch (error) {
                    console.log(`Impossible de changer le nickname de ${nickName}`)
                }
            }
        )

    },

    /**
     * @deprecated
     * @use PlayerItemService.addPlayerItem
     * @param user
     * @param name
     * @param type
     * @returns {Promise<void>}
     */
    async addPlayerItem (user, name, type) {
        let playerItem = await PlayerItem.findOne({
            where: {
                name: name,
                userId: user.id
            }
        })

        if (playerItem) {
            playerItem.quantity += 1
            await playerItem.save()
        } else {
            playerItem = await PlayerItem.create({
                name: name,
                userId: user.id,
                quantity: 1,
                type: type
            })
        }
    }

}