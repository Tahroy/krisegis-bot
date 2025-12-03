import {
    ButtonInteraction,
    CommandInteraction,
    InteractionContextType,
    MessageFlags,
    SlashCommandBuilder
} from 'discord.js';
import AbstractCommand from "../utils/AbstractCommand";
import SmashPassService from "../services/SmashPassService";
import {PermissionFlagsBits} from "discord-api-types/v8";

class SmashPass extends AbstractCommand {
    name = 'smashpass';
    description = 'Système Smash or Pass (boutons)';

    protected addOptions(builder: SlashCommandBuilder) {
        builder.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        builder.setContexts([InteractionContextType.Guild])
    }

    async execute(interaction: CommandInteraction): Promise<void> {
        await interaction.reply({ content: 'Aucune vraie commande pour Smash or Pass.', flags: MessageFlags.Ephemeral });
    }

    async executeButton(interaction: ButtonInteraction): Promise<void> {
        await SmashPassService.handleButton(interaction);
    }
}

export default SmashPass;
