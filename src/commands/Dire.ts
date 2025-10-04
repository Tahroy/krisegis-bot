import AbstractCommand from "../utils/AbstractCommand";
import {
    CommandInteraction,
    EmbedBuilder,
    InteractionContextType,
    MessageFlags,
    SlashCommandBuilder,
    TextChannel
} from "discord.js";
import {PermissionFlagsBits} from "discord-api-types/v8";
import Constantes from "../utils/Constantes";

class Dire extends AbstractCommand {
    description: string = "Faire parler Krisegis";
    name: string = "dire";
    public: boolean = false;

    async execute(interaction: CommandInteraction): Promise<void> {
        if (!interaction.isChatInputCommand()) {
            return;
        }

        const channel = interaction.options.getChannel('canal') as TextChannel
        const message = interaction.options.getString('message') ?? ''
        if (!channel || !message) {
            await interaction.reply({content: `Salon ou message manquant`, flags: MessageFlags.Ephemeral})
            return
        }


        if (interaction.user.id !== Constantes.OWNER_ID) {
            await interaction.reply({
                content: "Vous n'avez pas les droits pour utiliser cette commande",
                flags: MessageFlags.Ephemeral
            })
        }

        const formattedMessage = message.replace(/\\n/g, '\n');

        const embed = new EmbedBuilder()
            .setTitle('Krisegis')
            .setColor(Constantes.EMBED_COLOR_PRIMARY)
            .setDescription(formattedMessage)

        try {
            await (channel as TextChannel).send({embeds: [embed]})
            await interaction.reply({content: `Message envoyé`, flags: MessageFlags.Ephemeral})
        } catch (throwable) {
            console.error(throwable)
            await interaction.reply({content: `Une erreur est survenue`, flags: MessageFlags.Ephemeral})
        }
    }

    protected addOptions(builder: SlashCommandBuilder) {
        builder.addChannelOption(
            option => option
                .setName('canal')
                .setDescription('Salon de destination')
                .setRequired(true)
        )

        builder.addStringOption(
            option => option
                .setName('message')
                .setDescription('Message à passer')
                .setRequired(true)
        )

        builder.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        builder.setContexts([InteractionContextType.Guild])
    }
}

export default Dire
