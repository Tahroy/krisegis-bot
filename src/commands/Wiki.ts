import AbstractCommand from "../utils/AbstractCommand";
import {AutocompleteInteraction, CommandInteraction, MessageFlags, SlashCommandBuilder} from "discord.js";
import Constantes from "../utils/Constantes";

class Wiki extends AbstractCommand {
    description: string = 'Rechercher une page Wiki';
    name: string = 'wiki';
    allowedGuildIds: string[] = Constantes.ALLOWED_GUILD_IDS;
    protected addOptions(builder: SlashCommandBuilder) {
        builder.addStringOption(option =>
            option
                .setName('search')
                .setDescription("Recherche une page")
                .setRequired(true)
                .setAutocomplete(true)
        );
    }

    async execute(interaction: CommandInteraction): Promise<void> {
        if (!interaction.isChatInputCommand()) {
            return;
        }

        const search = interaction.options.getString('search');
        if (!search || !parseInt(search)) {
            await interaction.reply({ content: "Page introuvable. Veuillez utiliser l'autocomplétion", flags: MessageFlags.Ephemeral });
            return;
        }

        try {
            const axios = require('axios');
            const { escapeHTML, sendLore } = require('../utils/Utils.js');
            const response = await axios.get(Constantes.WIKI_RP_BASE + `api.php?action=parse&pageid=${search}&format=json`);
            const data = response.data.parse;

            if (!data?.title) {
                await interaction.reply({ content: "Page introuvable", flags: MessageFlags.Ephemeral });
                return;
            }

            const title = data.title;
            const id = data.pageid;
            const text = escapeHTML(data.text['*']);

            const object = {
                name: title,
                content: [Constantes.WIKI_RP_BASE + `wiki/?curid=${data.pageid}`, text],
                id: id,
            };

            await sendLore(object, search, interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "Erreur lors de la récupération", flags: MessageFlags.Ephemeral });
        }
    }

    async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
        const search = interaction.options.getFocused();
        if (!search || search.length < 3) {
            await interaction.respond([]);
            return;
        }

        const axios = require('axios');
        const wikiResponse = await axios.get(Constantes.WIKI_RP_BASE + `api.php?action=query&list=search&srsearch=${search}&format=json`);
        const items = wikiResponse.data?.query?.search ?? [];
        const choices = items.map((item: any) => ({
            name: item.title + ` (${item.pageid})`,
            value: '' + item.pageid,
        })).slice(0, 25);
        await interaction.respond(choices);
    }
}

export default Wiki;
