import {
    AutocompleteInteraction,
    ButtonInteraction, CommandInteraction, CommandInteractionOptionResolver,
    ModalSubmitInteraction,
    SlashCommandBuilder
} from "discord.js";
import AbstractSubCommand from "./AbstractSubCommand";

abstract class AbstractCommand {
    abstract name: string;
    abstract description: string;
    allowedGuildIds?: string[];
    subCommands: Map<string, new () => AbstractSubCommand> = new Map();

    async execute(interaction: CommandInteraction): Promise<void> {
        if (!interaction.isChatInputCommand() || !(interaction.options instanceof CommandInteractionOptionResolver)) {
            return;
        }

        const command = interaction.options.getSubcommand();

        const subCommand = this.subCommands.get(command);
        if (subCommand) {
            const subCommandInstance = new subCommand();
            await subCommandInstance.execute(interaction);
        }
    }

    async executeButton(interaction: ButtonInteraction): Promise<void> {
        const customID = interaction.customId;
        const split = customID.split('-');
        const subCommandName = split[0].split('|')[1] ?? null

        if (subCommandName) {
            const subCommand = this.subCommands.get(subCommandName);
            if (subCommand) {
                const subCommandInstance = new subCommand();
                await subCommandInstance.executeButton(interaction);
                return;
            }
        }
        await interaction.reply({content: 'Non implémenté', ephemeral: true})
    };

    async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
        const command = interaction.options.getSubcommand();

        const subCommand = this.subCommands.get(command);
        if (subCommand) {
            const subCommandInstance = new subCommand();
            await subCommandInstance.autocomplete(interaction);
        }
    };

    async gererModal(interaction: ModalSubmitInteraction): Promise<void> {
        await interaction.reply({content: `Non implémenté`})
    }

    addSubCommands(builder: SlashCommandBuilder): void {
        for (const [name, subCommand] of this.subCommands) {
            const subCommandInstance = new subCommand();
            builder.addSubcommand(subCommandInstance.getSlashCommandBuild());
        }
    }

    getSlashCommandBuild(): SlashCommandBuilder {
        const slashCommandBuilder = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description);

        this.addSubCommands(slashCommandBuilder);
        this.addOptions(slashCommandBuilder);

        return slashCommandBuilder;
    }

    protected addOptions(builder: SlashCommandBuilder) {

    }
}

export default AbstractCommand;
