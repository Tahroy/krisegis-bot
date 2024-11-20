"use strict";
const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const { PermissionFlagsBits } = require('discord-api-types/v8');
const { escapeHTML, sendLore } = require('../utils/Utils');
const { api_lore } = require('../../config/config_bot.json');
const LoreElement = require('../models/LoreElement').default;
module.exports = {
    opts: {
        admin: true
    },
    data: new SlashCommandBuilder()
        .setName('synchro')
        .setDescription('Synchroniser les données')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option => option
        .setName('type')
        .setDescription('Recherche une page')
        .setRequired(true)
        .setChoices({
        name: 'Objets',
        value: 'item'
    }, {
        name: 'PNJ',
        value: 'npc'
    }, {
        name: 'Documents',
        value: 'document'
    }, {
        name: 'Articles',
        value: 'article'
    })),
    async execute(interaction) {
        const type = interaction.options.getString('type');
        console.log(type);
        await interaction.reply({ content: 'La synchronisation est en cours', ephemeral: true });
        /*
         * On fait un appel à l'API et on parcourt les ID avec un delay de 1s tous les 10 appels.
         * Ensuite, on sauvegarde
         */
        const OFFSET = 100;
        let offset = 0;
        while (true) {
            const response = await axios.get(`${api_lore}/${type}?all=true&$limit=${OFFSET}&$offset=${offset}`);
            const items = response.data.data;
            //   console.log(items);
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const existingElement = await LoreElement.findOne({ where: { id: item.id, type: type } });
                if (existingElement) {
                    continue;
                }
                // join item.content en liste
                let content = item.content.map(line => `* ${line}`).join('\n');
                const loreElement = await LoreElement.create({
                    id: item.id,
                    name: item.name,
                    type: type,
                    content: content
                });
                console.log(`Sauvegarde de ${loreElement.name} (${loreElement.id})`);
            }
            if (items.length < OFFSET) {
                break;
            }
            offset += OFFSET;
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
};
