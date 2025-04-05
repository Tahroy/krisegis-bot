import AbstractSubCommand from "../../utils/AbstractSubCommand";
import {CommandInteraction, EmbedBuilder} from "discord.js";
import {SlashCommandSubcommandBuilder} from "@discordjs/builders";
import PlayerHouse from "../../models/astrub_economy/PlayerHouse";
import {join} from "path";
import {Houses, HousesEnum} from "../../models/astrub_economy/House";

class Housing extends AbstractSubCommand {
    description: string = 'Votre maison'
    name: string = 'housing'

    async execute(interaction: CommandInteraction): Promise<void> {
        const playerHouse = await PlayerHouse.findOne({
            where: {
                userId: interaction.user.id
            }
        })

        if (!playerHouse) {

            console.log('no house')
            await this.replyListHouses(interaction)
            return;
        }

        console.log(playerHouse)
        await interaction.reply({content: `Not implemented`})
    }

    private async replyListHouses(interaction: CommandInteraction) {
        const house = Object.values(Houses).find(h => h.type === HousesEnum.ASTRUB)

        console.log(house, Houses)
        if (!house) {
            await interaction.reply({content: `Not implemented`})
            return
        }
        const image = join(__dirname, '..', '..', '..', 'assets', 'houses', `${(house?.type)?.toLowerCase()}-1.png`)

        const embed = new EmbedBuilder()
            .setTitle(`Voulez-vous acheter une maison ?`)
            .setColor("#0099ff")
            .setImage(`attachment://${image}`)

        await interaction.reply({embeds: [embed], files: [image]})
    }
}

export default Housing