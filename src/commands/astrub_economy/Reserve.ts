import AbstractSubCommand from "../../utils/AbstractSubCommand";
import {
    ApplicationCommandOptionChoiceData,
    AutocompleteInteraction,
    CommandInteraction,
    EmbedBuilder,
    MessageFlags, User
} from "discord.js";
import {SlashCommandSubcommandBuilder} from "@discordjs/builders";
import {PlayerService} from "../../services/PlayerService";
import PlayerItem from "../../models/PlayerItem";
import JobUtil from "../../services/JobUtil";
import {ReserveService} from "../../services/ReserveService";
import {BuildingEnum} from "../../models/astrub_economy/Building";
import ItemService from "../../services/ItemService";
import {ItemType} from "../../utils/Enums";


class Reserve extends AbstractSubCommand {
    name = 'reserve';
    description = 'Gérer la réserve communautaire';

    static readonly OPTION_ACTION = 'action'
    static readonly OPTION_ITEM = 'objet'
    static readonly OPTION_QUANTITY = 'quantite'

    static readonly  ACTION_DEPOSE = 'deposer';
    static readonly  ACTION_TAKE = 'prendre';
    async execute(interaction: CommandInteraction): Promise<void> {
        if (!interaction.isChatInputCommand()) {
            return;
        }

        // Vérifier si le bâtiment Réserve est construit
        const buildings = await JobUtil.getBuildingsGuild(interaction.guild);
        if (!buildings.includes(BuildingEnum.RESERVE)) {
            await interaction.reply({
                content: "La réserve n'est pas encore construite.",
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        const action = interaction.options.getString(Reserve.OPTION_ACTION, true);
        const itemName = interaction.options.getString(Reserve.OPTION_ITEM);
        const quantity = interaction.options.getInteger(Reserve.OPTION_QUANTITY);

        switch (action) {
            case Reserve.ACTION_DEPOSE:
                if (!itemName || !quantity) {
                    await interaction.reply({
                        content: 'Il faut un objet et une quantité !',
                        flags: MessageFlags.Ephemeral
                    });
                    return;
                }
                await this.deposeToReserve(interaction, itemName, quantity);
                break;
            case Reserve.ACTION_TAKE:
                if (!itemName || !quantity) {
                    await interaction.reply({
                        content: 'Il faut un objet et une quantité !',
                        flags: MessageFlags.Ephemeral
                    });
                    return;
                }
                await this.takeFromReserve(interaction, itemName, quantity);
                break;
        }
    }

    protected addOptions(builder: SlashCommandSubcommandBuilder) {
        builder.addStringOption(
            option => option.setName(Reserve.OPTION_ACTION)
                .setDescription('Action à effectuer')
                .setRequired(true)
                .addChoices(
                    { name: 'Déposer des objets dans la réserve', value: Reserve.ACTION_DEPOSE },
                    { name: 'Prendre des objets de la réserve', value: Reserve.ACTION_TAKE }
                )
        );

        builder.addStringOption(
            option => option.setName(Reserve.OPTION_ITEM)
                .setDescription('Objet à déposer ou prendre')
                .setRequired(true)
                .setAutocomplete(true)
        );

        builder.addIntegerOption(
            option => option.setName(Reserve.OPTION_QUANTITY)
                .setDescription('Quantité à déposer ou prendre')
                .setRequired(true)
                .setMinValue(1)
        );
    }

    async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
        const guildId = interaction.guild?.id;

        if (!guildId) {
            await interaction.respond([]);
            return;
        }

        const options = interaction.options;
        const focused = options.getFocused(true);
        const action = options.getString(Reserve.OPTION_ACTION);
        const search = focused.value
        
        if (focused.name !== Reserve.OPTION_ITEM) {
            await interaction.respond([]);
            return;
        }

        // Par défaut, on propose l'inventaire du joueur pour le dépôt.
        // Si l'action est "prendre", on bascule sur la réserve (user = null)
        let user: User|null = interaction.user;
        if (action === Reserve.ACTION_TAKE) {
            user = null;
        }

        const guild = interaction.guild;
        const types = [ItemType.RESSOURCE, ItemType.FABRICATION, ItemType.OUTIL];

        const choices: ApplicationCommandOptionChoiceData[] = [];
        const items = await PlayerService.getItems(user, types, guild, search)

        for (const item of items) {
            if (item.quantity < 1) {
                continue;
            }

            if (choices.length >= 20) {
                break;
            }

            choices.push({
                name: `${item.name} (${item.quantity} maximum)`,
                value: item.name
            });
        }

        await interaction.respond(choices);
    }

    private formatReserveTable(items: PlayerItem[]): string {
        const header = `| Nom                    | Quantité |`;
        const separator = `|------------------------|----------|`;

        const rows = items.map(item => {
            return `| ${item.name.padEnd(22)} | ${item.quantity.toString().padStart(8)} |`;
        });

        return `\`\`\`\n${header}\n${separator}\n${rows.join('\n')}\n\`\`\``;
    }

    private async deposeToReserve(interaction: CommandInteraction, itemName: string, quantity: number): Promise<void> {
        if (!interaction.guild) {
            return;
        }

        const user = interaction.user;
        const guildId = interaction.guild.id;

        try {
            const item = ItemService.getItem(itemName);
            if (!item) {
                await interaction.reply({
                    content: `L'objet ${itemName} n'existe pas.`,
                    flags: MessageFlags.Ephemeral
                });
                return;
            }

            await ReserveService.deposeItem(user, itemName, item.type as ItemType, quantity, guildId);

            const guild = interaction.guild
            const userName = await JobUtil.getUsername(user.id, guild)

            await interaction.reply({
                content: `🫶 La porte de la réserve se referme derrière **${userName}** qui vient d'y déposer ${quantity} x ${itemName}. 🫶`
            });
        } catch (error) {
            await interaction.reply({
                content: `Erreur: ${error instanceof Error ? error.message : 'Une erreur est survenue'}`,
                flags: MessageFlags.Ephemeral
            });
        }
    }

    private async takeFromReserve(interaction: CommandInteraction, itemName: string, quantity: number): Promise<void> {
        if (!interaction.guild) {
            return;
        }

        const user = interaction.user;
        const guildId = interaction.guild.id;

        try {
            const item = ItemService.getItem(itemName);
            if (!item) {
                await interaction.reply({
                    content: `L'objet ${itemName} n'existe pas.`,
                    flags: MessageFlags.Ephemeral
                });
                return;
            }

            await ReserveService.takeItem(user, itemName, item.type as ItemType, quantity, guildId);

            const userName = await JobUtil.getUsername(user.id, interaction.guild)

            await interaction.reply({
                content: `🫣 **${userName}** vient de se faufiler dans la réserve et y a pris ${quantity} x ${itemName}. 🫣`
            });
        } catch (error) {
            await interaction.reply({
                content: `Erreur: ${error instanceof Error ? error.message : 'Une erreur est survenue'}`,
                flags: MessageFlags.Ephemeral
            });
        }
    }
}

export default Reserve;
