import {
    AutocompleteInteraction,
    ButtonInteraction,
    CommandInteraction,
    MessageFlags,
    ModalSubmitInteraction
} from "discord.js";
import {SlashCommandSubcommandBuilder} from "@discordjs/builders";

abstract class AbstractSubCommand {
    abstract name: string;
    abstract description: string;

    abstract execute(interaction: CommandInteraction): Promise<void>;

    async executeButton(interaction: ButtonInteraction): Promise<void> {
        await interaction.reply({content: 'Not implemented', flags: MessageFlags.Ephemeral})
    };

    async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
        await interaction.respond([])
    };

    async gererModal(interaction: ModalSubmitInteraction): Promise<void> {
        await interaction.reply({content: `Not implemented`})
    }

    getSlashCommandBuild(): SlashCommandSubcommandBuilder {
        const slashCommandBuilder = new SlashCommandSubcommandBuilder()
            .setName(this.name)
            .setDescription(this.description);

        this.addOptions(slashCommandBuilder);

        return slashCommandBuilder;
    }

    protected addOptions(builder: SlashCommandSubcommandBuilder) {

    }
}

export default AbstractSubCommand;