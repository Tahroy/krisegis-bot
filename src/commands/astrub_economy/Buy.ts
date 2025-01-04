import AbstractSubCommand from "../../utils/AbstractSubCommand";
import {AutocompleteInteraction, CommandInteraction, CommandInteractionOptionResolver} from "discord.js";
import PlayerItem from "../../models/PlayerItem";
import JobUtil from "./JobUtil";
import Job from "../../models/Job";
import {ItemType, PlayerService} from "../../services/playerItemService";
import {SlashCommandSubcommandBuilder} from "@discordjs/builders";
import {Ressources} from "../../models/Ressource";

class Sale extends AbstractSubCommand {
    description: string = 'Acheter un objet';
    name: string = 'buy';

    async execute(interaction: CommandInteraction): Promise<void> {
        if (!interaction.isCommand() || !(interaction.options instanceof CommandInteractionOptionResolver)) {
            return;
        }

        const options: CommandInteractionOptionResolver = interaction.options;

        const item: string | null = options.getString('item');
        const quantity: number | null = options.getInteger('quantity');

        if (!item || !quantity) {
            await interaction.reply({content: "Commande incorrecte", ephemeral: true})
            return;
        }
        const user = interaction.user;

        // On vérifie si la personne a le bon nombre d'objets

        let playerItem = await PlayerItem.findOne({where: {name: 'Kamas', user_id: user.id,},});

        const price = (JobUtil.getRessource(item)?.buy ?? 0);

        if (!price) {
            await interaction.reply({content: "Cet objet ne peut pas être acheté", ephemeral: true})
            return
        }

        if (!playerItem || playerItem.get('quantity') < quantity * price) {
            await interaction.reply({
                content: "Vous n'avez pas la quantité nécessaire de kamas pour acheter",
                ephemeral: true
            })
            return;
        }

        const guild = interaction.guild
        const memberCatch = await guild?.members.fetch(user.id)
        const userName = memberCatch?.nickname ?? user.globalName

        await interaction.reply({
            content: `${userName} a acheté ${quantity} x ${item} pour ${price * quantity} kamas`
        })

        await PlayerService.addPlayerItem(interaction.user, item, ItemType.RESSOURCE, quantity)
        await PlayerService.addPlayerItem(interaction.user, "Kamas", ItemType.RESSOURCE, -price * quantity)
    }

    protected addOptions(builder: SlashCommandSubcommandBuilder) {
        builder.addStringOption(
            option => option
                .setName('item')
                .setAutocomplete(true)
                .setRequired(true)
                .setDescription("Objet à acheter")
        )

        builder.addIntegerOption(
            option => option
                .setName('quantity')
                .setRequired(true)
                .setDescription("Quantité")
        )
    }

    async automplete(interaction: AutocompleteInteraction): Promise<void> {
        const options = interaction.options
        const focused = options.getFocused(true)
        const search = focused.value

        const retour = []

        switch (focused.name) {
            case 'item':
                const ressources = Object.values(Ressources);

                for (let ressource of ressources) {
                    if (ressource.buy === 0) continue;
                    if (ressource.name.toLowerCase().includes(search.toLowerCase()) || !search) {
                        if (retour.length >= 20) {
                            break;
                        }
                        retour.push({
                            name: `${ressource.name} (${ressource.buy} kamas)`,
                            value: ressource.name
                        })
                    }
                }
        }

        await interaction.respond(retour)
    }
}

export default Sale;