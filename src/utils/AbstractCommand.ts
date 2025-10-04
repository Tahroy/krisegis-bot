import {
    AutocompleteInteraction,
    ButtonInteraction, CommandInteraction, CommandInteractionOptionResolver,
    ModalSubmitInteraction,
    SlashCommandBuilder
} from "discord.js";
import AbstractSubCommand from "./AbstractSubCommand";
import AbstractSubCommandGroup from "./AbstractSubCommandGroup";

abstract class AbstractCommand {
    abstract name: string;
    abstract description: string;
    public: boolean = true;
    subCommands: Map<string, new () => AbstractSubCommand> = new Map();
    subCommandGroups: Map<string, new () => AbstractSubCommandGroup> = new Map();

    async execute(interaction: CommandInteraction): Promise<void> {
        if (!interaction.isChatInputCommand() || !(interaction.options instanceof CommandInteractionOptionResolver)) {
            return;
        }

        const group = interaction.options.getSubcommandGroup(false);
        if (group) {
            const groupClass = this.subCommandGroups.get(group);
            if (groupClass) {
                const groupInstance = new groupClass();
                await groupInstance.execute(interaction);
                return;
            }
        }

        const command = interaction.options.getSubcommand(false);

        if (command) {
            const subCommand = this.subCommands.get(command);
            if (subCommand) {
                const subCommandInstance = new subCommand();
                await subCommandInstance.execute(interaction);
            }
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
        const group = interaction.options.getSubcommandGroup(false);
        if (group) {
            const groupClass = this.subCommandGroups.get(group);
            if (groupClass) {
                const groupInstance = new groupClass();
                await groupInstance.autocomplete(interaction);
                return;
            }
        }

        const command = interaction.options.getSubcommand(false);

        if (command) {
            const subCommand = this.subCommands.get(command);
            if (subCommand) {
                const subCommandInstance = new subCommand();
                await subCommandInstance.autocomplete(interaction);
            }
        }
    };

    async gererModal(interaction: ModalSubmitInteraction): Promise<void> {
        const customID = interaction.customId;
        const split = customID.split('-');
        const afterPipe = (split[0].split('|')[1] ?? null);

        if (afterPipe) {
            // 1) Tentative: c'est une sous-commande directe (non groupée)
            const subCommand = this.subCommands.get(afterPipe);
            if (subCommand) {
                const subCommandInstance = new subCommand();
                await subCommandInstance.gererModal(interaction);
                return;
            }

            // 2) Tentative: c'est un groupe de sous-commandes
            const groupClass = this.subCommandGroups.get(afterPipe);
            if (groupClass) {
                const groupInstance = new groupClass();
                await groupInstance.gererModal(interaction);
                return;
            }
        }
        await interaction.reply({content: 'Non implémenté'})
    }

    addSubCommands(builder: SlashCommandBuilder): void {
        for (const [name, subCommand] of this.subCommands) {
            const subCommandInstance = new subCommand();
            builder.addSubcommand(subCommandInstance.getSlashCommandBuild());
        }

        for (const [name, groupClass] of this.subCommandGroups) {
            const instance = new groupClass();
            builder.addSubcommandGroup(instance.getSlashCommandBuild());
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
