import AbstractSubCommand from "../../utils/AbstractSubCommand";
import {CommandInteraction, MessageFlags} from "discord.js";
import JobUtil from "./JobUtil";
import KrisegisClient from "../../models/KrisegisClient";
import AbstractCommand from "../../utils/AbstractCommand";

class Meteo extends AbstractCommand {
    description: string = "Récupérer la météo actuelle";
    name: string = "meteo";

    async execute(interaction: CommandInteraction): Promise<void> {
        const meteo = await JobUtil.chargerMeteo(interaction.client as KrisegisClient);

        if (!meteo) {
            await interaction.reply({content: 'Aucune météo actuellement', flags: MessageFlags.Ephemeral})
        }

        const text = `**Météo du jour** : ${meteo}`;

        await interaction.reply({content: text, flags: MessageFlags.Ephemeral})
    }
}

export default Meteo