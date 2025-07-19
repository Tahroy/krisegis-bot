import AbstractSubCommand from "../../utils/AbstractSubCommand";
import {CommandInteraction, MessageFlags} from "discord.js";
import {Meteos} from "../../models/astrub_economy/Meteo";
import JobUtil from "../../services/JobUtil";

class Meteo extends AbstractSubCommand {
    description: string = "Récupérer la météo actuelle";
    name: string = "meteo";

    async execute(interaction: CommandInteraction): Promise<void> {
        const guildId = interaction.guild?.id;
        if (!guildId) {
            await interaction.reply({
                content: 'Cette commande ne peut être utilisée que dans un serveur',
                flags: MessageFlags.Ephemeral
            })
            return;
        }

        let meteoName = await JobUtil.chargerMeteo(guildId);

        if (!meteoName) {
            await JobUtil.updateMeteo(guildId);
            meteoName = await JobUtil.chargerMeteo(guildId);
        }

        if (!meteoName) {
            await interaction.reply({content: 'Aucune météo actuellement', flags: MessageFlags.Ephemeral})
            return;
        }

        const meteo = Object.values(Meteos).find(r => r.name === meteoName) ?? null

        if (!meteo) {
            await interaction.reply({content: 'Aucune météo actuellement', flags: MessageFlags.Ephemeral})
            return;
        }
        await interaction.reply({content: meteo?.getText()})
    }

}

export default Meteo