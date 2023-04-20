const {SlashCommandBuilder} = require("discord.js");
const {api_lore} = require('../../config/config.json');
const axios = require("axios");
const {PermissionFlagsBits} = require("discord-api-types/v8");
const {escapeHTML, substringContent } = require("../utils/Utils");
const embedData = require('../utils/embed')

const WIKI_RP = "https://dofus-rp.fandom.com/fr/";

module.exports = {
    opts: {
        admin: true
    }, data: new SlashCommandBuilder()
        .setName('wiki')
        .setDescription('Cherche des données sur le wiki')
        .addStringOption(option => option.setName('search')
            .setDescription(
                'Mots clefs')
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction)
    {

        const search = interaction.options.getString('search');

        await interaction.reply("Voici ce que j'ai !");
        // https://dofus-rp.fandom.com/fr/api.php?action=query&list=search&srsearch=shariva&format=json
        try {
            const response = await axios.get(WIKI_RP + `api.php?action=query&list=search&srsearch=${search}&format=json`);

            const data = response.data.query.search;

            let pages = [];
            for (let i = 0; i < data.length; i++) {
                const item = data[i];
                pages.push({name: item.title, content: WIKI_RP + `wiki/?curid=${item.pageid}`});
            }

        } catch (error) {

            await interaction.channel.send("Erreur lors de la récupération");
        }

    },

    async sendResults (interaction, items = [], name = "", truncate = true) {
        let lines = [];
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const name = escapeHTML(item.name);

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