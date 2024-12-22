import {
    AutocompleteInteraction,
    ButtonInteraction, Collection,
    CommandInteraction, CommandInteractionOptionResolver,
    ModalSubmitInteraction,
    SlashCommandBuilder
} from "discord.js";
import AbstractSubCommand from "./AbstractSubCommand";

abstract class AbstractCommand {
    abstract name: string;
    abstract description: string;
    subCommands: Map<string, new () => AbstractSubCommand> = new Map();

    execute(interaction: CommandInteraction): void {
        if (!interaction.isCommand() || !(interaction.options instanceof CommandInteractionOptionResolver)) {
            return;
        }

        const command = interaction.options.getSubcommand();

        const subCommand = this.subCommands.get(command);
        if (subCommand) {
            const subCommandInstance = new subCommand();
            subCommandInstance.execute(interaction);
        }
    }

    async executeButton(interaction: ButtonInteraction): Promise<void> {
        await interaction.reply({content: 'Not implemented', ephemeral: true})
    };

    async automplete(interaction: AutocompleteInteraction): Promise<void> {
        await interaction.respond([])
    };

    async gererModal(interaction: ModalSubmitInteraction): Promise<void> {
        await interaction.reply({content: `Not implemented`})
    }

    addSubCommands(builder: SlashCommandBuilder): void {
        for (const [name, subCommand] of this.subCommands) {
            const subCommandInstance = new subCommand();
            builder.addSubcommand(subCommandInstance.getSlashCommandBuild());
        }
    }

    getSlashCommandBuild(): SlashCommandBuilder {
        console.log('getSlashCommandBuild')
        const slashCommandBuilder = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description);

        this.addSubCommands(slashCommandBuilder);

        return slashCommandBuilder;
    }
}

export default AbstractCommand;