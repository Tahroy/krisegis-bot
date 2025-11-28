import { CommandInteraction, MessageFlags } from "discord.js";
import AbstractSubCommand from "../../utils/AbstractSubCommand";
import Nowel from "../../models/nowel/Nowel";

export default class Statut extends AbstractSubCommand {
    public name: string = "statut";
    public description: string = "Affiche votre statut pour l'événement de Nowel.";

    public async execute(interaction: CommandInteraction): Promise<void> {
        if (!interaction.guildId) {
            await interaction.reply({ content: "Cette commande doit être utilisée dans un serveur.", flags: MessageFlags.Ephemeral });
            return;
        }

        const [nowel] = await Nowel.findOrCreate({
            where: { userId: interaction.user.id, guildId: interaction.guildId },
        });

        await interaction.reply({
            content: `Il vous reste ${nowel.remainingThrows} boules de neige et ${nowel.remainingHP} points de vie.`,
            flags: MessageFlags.Ephemeral,
        });
    }
}
