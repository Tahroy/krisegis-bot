import AbstractCommand from "../../utils/AbstractCommand";
import {AutocompleteInteraction, CommandInteraction, MessageFlags, SlashCommandBuilder} from "discord.js";
import PlayerItem from "../../models/PlayerItem";
import JobUtil from "./JobUtil";
import KrisegisClient from "../../models/KrisegisClient";

class Pray extends AbstractCommand {
    name = 'pray'
    description = 'Prier les dieux au sanctuaire'

    async execute(interaction: CommandInteraction): Promise<void> {
        if (!interaction.isChatInputCommand()) {
            return
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
                user_id: user.id
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
                user_id: user.id
            }
        })

        await interaction.reply({
            content: 'Les dieux vont ont entendu...',
            flags: MessageFlags.Ephemeral
        })

        // On recharge la météo
        await JobUtil.updateMeteo(interaction.client as KrisegisClient)
    }

    protected addOptions(builder: SlashCommandBuilder) {
        builder.addStringOption(
            option => option
                .setName('prayer')
                .setDescription('Prière de votre choix')
                .setRequired(true)
                .setChoices({name: 'Changement de météo (500 kamas)', value: 'meteo'},)
        )
    }

}

export default Pray