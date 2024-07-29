const {SlashCommandBuilder} = require("discord.js");
const axios = require("axios");
const {PermissionFlagsBits} = require("discord-api-types/v8");
const {escapeHTML, sendLore} = require("../utils/Utils");

const WIKI_RP = "https://dofus-rp.fandom.com/fr/";

module.exports = {
    opts: {},
    data: new SlashCommandBuilder()
        .setName('wiki')
        .setDescription('Rechercher une page Wiki')
        .addStringOption(option =>
            option
                .setName('search')
                .setDescription("Recherche une page")
                .setRequired(true)
                .setAutocomplete(true)
        ),
    async execute(interaction)
    {

        const search = interaction.options.getString('search');

        // https://dofus-rp.fandom.com/fr/api.php?action=query&list=search&srsearch=shariva&format=json
        try {
            const response = await axios.get(WIKI_RP + `api.php?action=parse&pageid=${search}&format=json`);

            const data = response.data.parse;

            if (!data.title) {
                await interaction.channel.send("Page introuvable");
                return;
            }
            const title = data.title;
            const id = data.pageid;
            const text = escapeHTML(data.text['*']);

            const object = {
                name: title,
                content: [WIKI_RP + `wiki/?curid=${data.pageid}`, text],
                id: id,
            };

            await sendLore(object, search, interaction);

        } catch (error) {
            console.error(error);
            await interaction.channel.send("Erreur lors de la récupération");
        }

    },
    async autocomplete (interaction) {
        const search = interaction.options.getFocused()

        if (!search || search.length < 3) {
            await interaction.respond([])
            return
        }

        // Appel à l'API externe pour récupérer les objets correspondants à la recherche
        const wikiResponse = await axios.get(WIKI_RP + `api.php?action=query&list=search&srsearch=${search}&format=json`);

        // Traitement des résultats de l'API
        const items = wikiResponse.data.query.search;

        // Construction de la réponse avec les résultats sous forme d'autocomplétions
        const choices = items.map(item => ({
            name: item.title + ` (${item.pageid})`,
            value: '' + item.pageid
        })).slice(0, 25)

        await interaction.respond(choices)
    }
};