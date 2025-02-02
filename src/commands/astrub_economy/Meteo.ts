import AbstractSubCommand from "../../utils/AbstractSubCommand";
import {CommandInteraction, MessageFlags} from "discord.js";
import JobUtil from "./JobUtil";
import KrisegisClient from "../../models/KrisegisClient";
import AbstractCommand from "../../utils/AbstractCommand";
import {Meteos} from "../../models/astrub_economy/Meteo";

class Meteo extends AbstractSubCommand {
    description: string = "Récupérer la météo actuelle";
    name: string = "meteo";

    async execute(interaction: CommandInteraction): Promise<void> {
        const meteoName = await JobUtil.chargerMeteo();

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