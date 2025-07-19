import {CommandInteraction, MessageFlags, SlashCommandBuilder} from "discord.js";
import PlayerItem from "../../models/PlayerItem";
import JobUtil from "../../services/JobUtil";
import {Meteos} from "../../models/astrub_economy/Meteo";
import AbstractSubCommand from "../../utils/AbstractSubCommand";
import {SlashCommandSubcommandBuilder} from "@discordjs/builders";

export class Prier extends AbstractSubCommand {
    name = 'prier'
    description = 'Prier les dieux au sanctuaire'

    async execute(interaction: CommandInteraction): Promise<void> {
        if (!interaction.isChatInputCommand()) {
            return
        }

        const guildId = interaction.guild?.id;
        if (!guildId) {
            await interaction.reply({
                content: 'Cette commande ne peut être utilisée que dans un serveur',
                flags: MessageFlags.Ephemeral
            })
            return;
        }

        const prayer = interaction.options.getString('prayer')

        if (prayer !== 'meteo') {
            await interaction.reply({
                content: 'Priere inconnue',
                flags: MessageFlags.Ephemeral
            })
            return
        }

        // On vérifie que la personne a le bon nombre de kamas
        const user = interaction.user;
        const kamas = await PlayerItem.findOne({
            where: {
                name: 'Kamas',
                userId: user.id,
                guildId: guildId
            }
        })

        if (!kamas || kamas.quantity < 500) {
            await interaction.reply({
                content: "Vous n'avez pas assez de kamas",
                flags: MessageFlags.Ephemeral
            })
            return
        }

        // On retire les kamas
        await PlayerItem.update({quantity: kamas.quantity - 500}, {
            where: {
                name: 'Kamas',
                userId: user.id,
                guildId: guildId
            }
        })

        await interaction.reply({
            content: 'Les dieux vont ont entendu...',
            flags: MessageFlags.Ephemeral
        })

        // On recharge la météo
        await JobUtil.updateMeteo(guildId)

        if (interaction?.channel?.isSendable()) {
            const meteoName = await JobUtil.chargerMeteo(guildId);
            const meteo = Object.values(Meteos).find(r => r.name === meteoName) ?? null

            await interaction.channel.send({
                content: meteo?.getText() ?? "Aucune météo"
            });
        }
    }

    protected addOptions(builder: SlashCommandSubcommandBuilder) {
        builder.addStringOption(
            option => option
                .setName('prayer')
                .setDescription('Prière de votre choix')
                .setRequired(true)
                .setChoices({name: 'Changement de météo (500 kamas)', value: 'meteo'},)
        )
    }

}