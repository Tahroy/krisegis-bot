const {SlashCommandBuilder} = require("discord.js");
const {api_lore} = require('../../config/config.json');
const axios = require("axios");
const {PermissionFlagsBits} = require("discord-api-types/v8");
const {escapeHTML, substringContent } = require("../utils/Utils");
const embedData = require('../utils/embed')

const WIKI_RP = "https://dofus-rp.fandom.com/fr/";

module.exports = {
    opts: {},
    data: new SlashCommandBuilder()
        .setName('lore')
        .setDescription('Cherche des objets, articles ou dialogues de PNJ')
        .addStringOption(option => option.setName('search')
                                         .setDescription(
                                             'recherche sur les objets, documents, articles ou dialogues de PNJ')
                                         .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction)
    {

        const search = encodeURI(interaction.options.getString('search'));

        await interaction.reply("Voici ce que j'ai !");

        await console.log(`Recherche de ${search} par ${interaction.user.username}`);
        const response = await axios.get(api_lore + '?content=' + `"${search}"`);

        console.log(api_lore + '?content=' + `"${search}"`);

        const data = response.data.data
        await this.sendResults(interaction, data.items, 'objet');
        await this.sendResults(interaction, data.npcs, "PNJ");
        await this.sendResults(interaction, data.documents, "document");
        await this.sendResults(interaction, data.articles, "article", false);

        try {
            const wikiResponse = await axios.get(WIKI_RP + `api.php?action=query&list=search&srsearch=${search}&format=json`);

            const WikiData = wikiResponse.data.query.search;

            let pages = [];
            for (let i = 0; i < WikiData.length; i++) {
                const item = WikiData[i];
                pages.push({name: item.title, content: [WIKI_RP + `wiki/?curid=${item.pageid}`]});
            }
            await this.sendResults(interaction, pages, "page", false);
        } catch (error) {
            console.error(error);
            await interaction.channel.send("Erreur lors de la récupération des données WIKI");
        }
    },

    async sendResults (interaction, items = [], name = '', truncate = true) {
        let lines = []
        for (let i = 0; i < items.length; i++) {
            const item = items[i]
            const name = escapeHTML(item.name)

            let content = '';
            if (truncate) {
                content = substringContent(escapeHTML(item.content[0]));
            } else {
                content = escapeHTML(item.content[0]);
            }

            lines.push(`- **${name}** : ${content}`)

            if (i === 20) {
                lines.push(`*Certains résultats ont été masqués, précisez la requête*`);
                i = items.length;
            }
        }

        if (lines.length > 1) {
            name += "s";
        }

        let itemsEmbed = embedData.createEmbed([], {
            title: `**${items.length} ${name} :**`,
            description: lines.join('\n'),
            author: "Recherche : " + interaction.options.getString('search')
        })

        await interaction.channel.send({ embeds: itemsEmbed.embeds, files: itemsEmbed.files });
    }
};