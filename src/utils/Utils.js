const {JSDOM} = require('jsdom')
const axios = require('axios')
const {api_lore} = require('../../config/config.json')
const {createEmbed} = require('./embed')

module.exports = {
    escapeHTML(str) {
        const dom = new JSDOM(str)
        const doc = dom.window.document
        // Extraire le texte brut en accédant à la propriété textContent de l'élément body
        const plainText = doc.body.textContent || ''
        // Retirer les espaces en début et en fin de chaîne
        str = plainText.trim()

        str = str.replace('\n', ' ')
        return str
    },

    substringContent(str) {
        if (str.length > 50) {
            str = str.substring(0, 50) + '...'
        }

        return str
    },

    decouperTexte(texte) {
        const longueurMax = 4000; // Nombre maximum de caractères par partie

        if (texte.length < 4000) {
            return [texte];
        }
        const phrases = texte.split('.'); // Séparer le texte en phrases
        let partieCourante = ''; // Partie courante en cours de construction
        const parties = []; // Tableau pour stocker les parties découpées

        phrases.forEach((phrase, index) => {
            if (partieCourante.length + phrase.length + 1 <= longueurMax) {
                // Ajouter la phrase à la partie courante si cela ne dépasse pas la longueur maximale
                partieCourante += (partieCourante ? ' ' : '') + phrase + '.';
            } else {
                // Ajouter la partie courante au tableau de parties
                parties.push(partieCourante);
                // Réinitialiser la partie courante avec la phrase actuelle
                partieCourante = phrase + '.';
            }

            // Ajouter la dernière partie courante au tableau de parties
            if (index === phrases.length - 1 && partieCourante) {
                parties.push(partieCourante);
            }
        });

        return parties;
    },

    async sendLore(item, search, interaction)  {

        let decoupeContent = [];

        for (let i = 0; i < item.content.length; i++) {
            let content = item.content[i]

            const dom = new JSDOM(content)
            const doc = dom.window.document
            // Extraire le texte brut en accédant à la propriété textContent de l'élément body
            const plainText = doc.body.textContent || ''
            // Retirer les espaces en début et en fin de chaîne
            content = plainText.trim()
            const {decouperTexte} = require("./Utils.js");
            decoupeContent = decoupeContent.concat(decouperTexte(content));
        }

        for (let i = 0; i < decoupeContent.length; i++) {
            let title = item.name + ` (${item.id})`
            if (decoupeContent.length > 1) {
                let num = i + 1;
                title += ` ${num}/${decoupeContent.length}`
            }

            const embed = createEmbed([], {
                title: title,
                description: decoupeContent[i],
                author: 'ID : ' + search
            })
            await interaction.channel.send({embeds: embed.embeds, files: embed.files})
        }

        return interaction.reply(`Voilà ce que j'ai trouvé !`)
    },
    async executeLore(interaction, endPoint = '') {
        const search = interaction.options.getString('query')

        const response = await axios.get(api_lore + '/' + endPoint + '?id=' + search)

        const items = response.data.data

        if (!items.length) {
            return interaction.reply('Aucun résultat trouvé')
        }

        const item = items[0]
        await this.sendLore(item, search, interaction);
    },
    async autocompleteLore(interaction, endPoint = '') {
        const search = interaction.options.getFocused()

        if (!search || search.length < 3) {
            await interaction.respond([])
            return
        }

        // Appel à l'API externe pour récupérer les objets correspondants à la recherche
        const response = await axios.get(api_lore + '/' + endPoint + '?name=' + search)

        // Traitement des résultats de l'API
        const items = response.data.data

        // Construction de la réponse avec les résultats sous forme d'autocomplétions
        const choices = items.map(item => ({
            name: item.name + ` (${item.id})`,
            value: '' + item.id
        })).slice(0, 25)

        await interaction.respond(choices)
    }
}