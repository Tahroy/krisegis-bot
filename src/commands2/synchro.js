const {SlashCommandBuilder} = require("discord.js");
const axios = require("axios");
const {PermissionFlagsBits} = require("discord-api-types/v8");
const {
    escapeHTML,
    sendLore
} = require("../utils/Utils");

const WIKI_RP = "https://dofus-rp.fandom.com/fr/";

module.exports = {
    opts: {},
    data: new SlashCommandBuilder()
        .setName('synchro')
        .setDescription('Synchroniser les données')
        .addStringOption(option => option
            .setName('type')
            .setDescription("Recherche une page")
            .setRequired(true)
            .setAutocomplete(true)
            .setChoices({
                            name : 'Objets',
                            value: 'item'
                        }, {
                            name : 'PNJ',
                            value: 'npc'
                        }, {
                            name : 'Documents',
                            value: 'document'
                        }, {
                            name : 'Articles',
                            value: 'article'
                        })),

    async execute(interaction) {

        const type = interaction.options.getString('type');

        /*
         * On fait un appel à l'API et on parcourt les ID avec un delay de 1s tous les 10 appels.
         * Ensuite, on sauvegarde
         */


    }
};