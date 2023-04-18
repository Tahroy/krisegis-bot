const {SlashCommandBuilder} = require("discord.js");
const {api_lore} = require('../../config/config.json');
const axios = require("axios");
const {PermissionFlagsBits} = require("discord-api-types/v8");
const {escapeHTML, substringContent } = require("../utils/Utils");
const embedData = require('../utils/embed')

module.exports = {
    opts: {
        admin: true
    }, data: new SlashCommandBuilder()
        .setName('lore')
        .setDescription('Cherche des objets, articles ou dialogues de PNJ')
        .addStringOption(option => option.setName('search')
                                         .setDescription(
                                             'recherche sur les objets, documents, articles ou dialogues de PNJ')
                                         .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction)
    {

        const search = interaction.options.getString('search');
        const response = await axios.get(api_lore + '?content=' + search);

        const embedData = require('../utils/embed');

        const data = response.data.data;

        let lines = [];

        await interaction.reply("Voici ce que j'ai !");
        await this.sendResults(interaction, data.items, 'objet');
        await this.sendResults(interaction, data.npcs, "PNJ");
        await this.sendResults(interaction, data.documents, "document");
        await this.sendResults(interaction, data.articles, "article", false);
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