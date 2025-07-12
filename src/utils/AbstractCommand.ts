import {
    AutocompleteInteraction,
    ButtonInteraction, Collection,
    CommandInteraction, CommandInteractionOptionResolver,
    ModalSubmitInteraction,
    SlashCommandBuilder
} from "discord.js";
import AbstractSubCommand from "./AbstractSubCommand";
import {SlashCommandSubcommandBuilder} from "@discordjs/builders";

abstract class AbstractCommand {
    abstract name: string;
    abstract description: string;
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
        await interaction.reply({content: 'Not implemented', ephemeral: true})
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
        await interaction.reply({content: `Not implemented`})
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