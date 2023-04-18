const {SlashCommandBuilder} = require("discord.js");
const {api_lore} = require('../../config/config.json');
const axios = require("axios");
const {JSDOM} = require("jsdom");
const embedData = require("../utils/embed");
const {PermissionFlagsBits} = require("discord-api-types/v8");

module.exports = {
    opts: {
        admin: true
    },
    data: new SlashCommandBuilder()
        .setName('lore')
        .setDescription('Cherche des objets, articles ou dialogues de PNJ')
        .addStringOption(option =>
            option.setName('search')
                .setDescription('recherche sur les objets, documents, articles ou dialogues de PNJ')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    ,
    async execute(interaction) {
        const axiosConfig = {
            method: 'get',
            url: api_lore + '?search=' + interaction.options.getString('search'),
            headers: {}
        };

        console.log(axiosConfig);
        axios(axiosConfig)
            .then(function (response) {
                const embedData = require('../utils/embed');

                function escapeHTML(str) {
                    const dom = new JSDOM(str);
                    const doc = dom.window.document;
                    // Extraire le texte brut en accédant à la propriété textContent de l'élément body
                    const plainText = doc.body.textContent || '';
                    // Retirer les espaces en début et en fin de chaîne
                    str = plainText.trim();

                    str = str.replace("\n", ' ');

                    if (str.length > 50) {
                        str = str.substring(0, 50) + "...";
                    }
                    return str;
                }

                const data = response.data.data;

                let lines = [];

                for (let i = 0; i < data.items.length; i++) {
                    const item = data.items[i];
                    const name = escapeHTML(item.name);
                    const content = escapeHTML(item.content);
                    lines.push(`- **${name}** : ${content}`)
                }
                let itemsEmbed = embedData.get([], {
                    title: `**${data.items.length} objets :**`,
                    description: lines.join('\n'),
                    author: "Recherche : " + interaction.options.getString('search'),
                })

                interaction.channel.send({embeds: itemsEmbed.embeds, files: data.files});
                lines = [];

                for (let i = 0; i < data.npcs.length; i++) {
                    const item = data.npcs[i];
                    const name = escapeHTML(item.name);
                    const content = escapeHTML(item.content);
                    lines.push(`- **${name}** : ${content}`)
                }
                let npcsEmbed = embedData.get([], {
                    title: `**${data.npcs.length} PNJ :**`,
                    description: lines.join('\n'),
                    author: "Recherche : " + interaction.options.getString('search'),
                })

                interaction.channel.send({embeds: npcsEmbed.embeds, files: data.files});
                lines = [];

                for (let i = 0; i < data.documents.length; i++) {
                    const item = data.documents[i];
                    const name = escapeHTML(item.name);
                    let content = escapeHTML(item.content);
                    lines.push(`- **${name}** : ${content}`)
                }
                let documentsEmbed = embedData.get([], {
                    title: `**${data.documents.length} documents :**`,
                    description: lines.join('\n'),
                    author: "Recherche : " + interaction.options.getString('search'),
                })

                interaction.channel.send({embeds: documentsEmbed.embeds, files: data.files});
                lines = [];

                for (let i = 0; i < data.articles.length; i++) {
                    const item = data.articles[i];
                    const name = escapeHTML(item.name);
                    const content = item.content;
                    lines.push(`- **${name}** : ${content}`)
                }
                let articlesEmbed = embedData.get([], {
                    title: `**${data.articles.length} articles :**`,
                    description: lines.join('\n'),
                    author: "Recherche : " + interaction.options.getString('search'),
                })

                interaction.channel.send({embeds: articlesEmbed.embeds, files: data.files});
                lines = [];

                interaction.reply("Voici ce que j'ai !");
            });
    },
};