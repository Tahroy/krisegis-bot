import {AutocompleteInteraction, ButtonInteraction, ChatInputCommandInteraction, MessageFlags, ModalSubmitInteraction} from "discord.js";
import {SlashCommandSubcommandGroupBuilder} from "@discordjs/builders";
import AbstractSubCommand from "./AbstractSubCommand";

abstract class AbstractSubCommandGroup {
    abstract name: string;
    abstract description: string;

    subCommands: Map<string, new () => AbstractSubCommand> = new Map();

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const subName = interaction.options.getSubcommand();
        const subClass = this.subCommands.get(subName);
        if (!subClass) {
            await interaction.reply({content: 'Sous-commande introuvable', flags: MessageFlags.Ephemeral});
            return;
        }
        const instance = new subClass();
        await instance.execute(interaction);
    }

    async executeButton(interaction: ButtonInteraction): Promise<void> {
        await interaction.reply({content: 'Not implemented', flags: MessageFlags.Ephemeral});
    }

    async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
        const subName = interaction.options.getSubcommand();
        const subClass = this.subCommands.get(subName);
        if (!subClass) {
            await interaction.respond([]);
            return;
        }
        const instance = new subClass();
        await instance.autocomplete(interaction);
    }

    async gererModal(interaction: ModalSubmitInteraction): Promise<void> {
        // customId format attendu: `${command}|${group}|${sub}|${infos}`
        const customID = interaction.customId;
        const parts = customID.split('|');
        if (parts.length < 3) {
            await interaction.reply({content: 'Non implémenté'});
            return;
        }

        const subClass = this.subCommands.get(parts[2] ?? null);
        if (!subClass) {
            await interaction.reply({content: 'Non implémenté'});
            return;
        }
        const instance = new subClass();
        await instance.gererModal(interaction);
    }

    getSlashCommandBuild(): SlashCommandSubcommandGroupBuilder {
        const builder = new SlashCommandSubcommandGroupBuilder()
            .setName(this.name)
            .setDescription(this.description);

        for (const [name, Sub] of this.subCommands) {
            const instance = new Sub();
            builder.addSubcommand(instance.getSlashCommandBuild());
        }

        return builder;
    }
}

export default AbstractSubCommandGroup;
