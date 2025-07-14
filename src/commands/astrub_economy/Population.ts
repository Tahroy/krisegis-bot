import AbstractSubCommand from "../../utils/AbstractSubCommand";
import {CommandInteraction, EmbedBuilder, Guild, MessageFlags} from "discord.js";
import {PopulationService} from "../../services/populationService";

class Population extends AbstractSubCommand {
    description: string = "Affiche la population d'Astrub";
    name: string = "population";

    async execute(interaction: CommandInteraction): Promise<void> {
        const guildId = interaction.guild?.id;
        if (!guildId) {
            await interaction.reply({
                content: 'Cette commande ne peut être utilisée que dans un serveur',
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        const embed = await PopulationService.getEmbedPopulation(guildId);

        await interaction.reply({embeds: [embed]});
    }
}

export default Population;