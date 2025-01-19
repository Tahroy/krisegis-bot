import {CommandInteraction, EmbedBuilder} from "discord.js";
import AbstractSubCommand from "../../utils/AbstractSubCommand";

class Information extends AbstractSubCommand {
    description: string = 'Informations sur Astrub Economy'
    name: string = 'information'

    async execute(interaction: CommandInteraction): Promise<void> {
        if (!interaction.isCommand()) {
            return;
        }

        const text = `
**Astrub Économie**

Bienvenue à Astrub ! Cette fière petite ville est en plein essor depuis la mort de Brutas, son fondateur.
        
De partout récolteurs et artisans trouvent ici une nouvelle vie et un travail, avec pour objectif principal de s'enrichir et de vivre la belle vie.

Vous allez donc devoir travailler à votre tour pour gagner votre pain et nous aider à faire prosperer la ville.

Pour cela, rien de plus simple ! Prenez un métier et commencez à récolter. Vous pouvez vendre directement au marché vos ressources, mais il y a encore mieux !
Si vous avez assez de kamas en poche ou que vous connaissez un bon bûcheron ou mineur, vous pouvez utiliser des outils, comme une marmite ou un four pour fabriquer d'autres produits bien plus rentables !

Attention cependant, la météo a tendance à être Tumultueuse par ici. On dit qu'une déesse rieuse s'intéresse à nous...

Nous allons avoir besoin de toutes les mains disponibles ici, la ville a besoin de vous !
`;

        const embed = new EmbedBuilder()
            .setTitle("Informations sur Astrub Économie")
            .setColor("#0099ff")
            .setDescription(text)
            .setTimestamp()

        await interaction.reply({embeds: [embed]})
    }
}

export default Information;