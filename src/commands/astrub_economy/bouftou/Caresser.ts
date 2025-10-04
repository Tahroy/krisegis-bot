import AbstractSubCommand from "../../../utils/AbstractSubCommand";
import {
    ApplicationCommandOptionChoiceData,
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    MessageFlags,
} from "discord.js";
import {SlashCommandSubcommandBuilder} from "@discordjs/builders";
import BouftouModel from "../../../models/astrub_economy/Bouftou";
import JobUtil from "../../../services/JobUtil";

class Caresser extends AbstractSubCommand {
    name: string = 'caresser';
    description: string = "Caresser un bouftou";

    private readonly OPTION_NOM = 'nom';

    protected addOptions(builder: SlashCommandSubcommandBuilder) {
        builder
            .addStringOption(o => o.setName(this.OPTION_NOM)
                .setDescription('Nom du bouftou à caresser')
                .setAutocomplete(true)
                .setRequired(true));
    }

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const guild = interaction.guild;
        if (!guild) {
            await interaction.reply({
                content: 'Cette commande doit être utilisée dans un serveur.', flags: MessageFlags.Ephemeral
            });
            return;
        }

        const name = interaction.options.getString(this.OPTION_NOM);
        if (!name) {
            await interaction.reply({content: 'Veuillez préciser un nom de bouftou.', flags: MessageFlags.Ephemeral});
            return;
        }

        const bouftou = await BouftouModel.findOne({where: {guildId: guild.id, name: name}});
        if (!bouftou || !bouftou.isAlive) {
            await interaction.reply({content: `Ce bouftou est introuvable ou est mort. :(`, flags: MessageFlags.Ephemeral});
            return;
        }

        const bouftouEmoji = await JobUtil.getEmojiByName(bouftou.emoji, interaction.client);
        await interaction.reply({content: `:heart:${bouftouEmoji}:heart: **${bouftou.name}** semble content après cette caresse !`});
    }

    async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
        const focused = interaction.options.getFocused(true);
        if (focused.name !== this.OPTION_NOM) {
            await interaction.respond([]);
            return;
        }

        const guildId = interaction.guild?.id;
        if (!guildId) {
            await interaction.respond([]);
            return;
        }

        const search = String(focused.value ?? '').toLowerCase();
        const bouftous = await BouftouModel.findAll({where: {guildId, isAlive: true}, order: [['name', 'ASC']]});
        const results: ApplicationCommandOptionChoiceData[] = [];
        for (const bouftou of bouftous) {
            if (results.length >= 20) {
                break;
            }
            if (!search || bouftou.name.toLowerCase().includes(search)) {
                results.push({name: bouftou.name, value: bouftou.name});
            }
        }
        await interaction.respond(results);
    }
}

export default Caresser;
