import AbstractSubCommand from "../../../utils/AbstractSubCommand";
import {
    ApplicationCommandOptionChoiceData,
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    MessageFlags,
} from "discord.js";
import {SlashCommandSubcommandBuilder} from "@discordjs/builders";
import {BuildingEnum} from "../../../models/astrub_economy/Building";
import JobUtil from "../../../services/JobUtil";
import BouftouModel from "../../../models/astrub_economy/Bouftou";
import {PlayerService} from "../../../services/PlayerService";
import {ResourceEnum} from "../../../models/astrub_economy/Enums";
import {ItemType} from "../../../utils/Enums";
import {Ressources} from "../../../models/astrub_economy/Resource";

class Nourrir extends AbstractSubCommand {
    name: string = 'nourrir';
    description: string = "Nourrir un bouftou";

    private readonly OPTION_NOM = 'nom';
    private readonly OPTION_ALIMENT = 'aliment';

    protected addOptions(builder: SlashCommandSubcommandBuilder) {
        builder
            .addStringOption(o => o.setName(this.OPTION_NOM)
                .setDescription('Nom du bouftou à nourrir')
                .setAutocomplete(true)
                .setRequired(true))
            .addStringOption(o => o.setName(this.OPTION_ALIMENT)
                .setDescription('Aliment utilisé (10 unités)')
                .setRequired(true)
                .addChoices({name: ResourceEnum.BLE, value: ResourceEnum.BLE}, {
                    name: ResourceEnum.ORTIE, value: ResourceEnum.ORTIE
                }, {name: ResourceEnum.GOUJON, value: ResourceEnum.GOUJON}));
    }

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const guild = interaction.guild;
        if (!guild) {
            await interaction.reply({
                content: 'Cette commande doit être utilisée dans un serveur.', flags: MessageFlags.Ephemeral
            });
            return;
        }

        // Vérifier que la Bouftonnerie est construite
        const isBuilt = await JobUtil.isBuildingConstructed(guild.id, BuildingEnum.BOUFTONNERIE);
        if (!isBuilt) {
            await interaction.reply({
                content: "La Bouftonnerie n'est pas encore construite.", flags: MessageFlags.Ephemeral
            });
            return;
        }

        const name = interaction.options.getString(this.OPTION_NOM);
        const aliment = interaction.options.getString(this.OPTION_ALIMENT) as (ResourceEnum | null);

        if (!name || !aliment) {
            await interaction.reply({content: 'Veuillez préciser un nom de bouftou et un aliment.', flags: MessageFlags.Ephemeral});
            return;
        }

        const bouftou = await BouftouModel.findOne({where: {guildId: guild.id, name: name}});
        if (!bouftou || !bouftou.isAlive) {
            await interaction.reply({
                content: `Ce bouftou est introuvable ou est mort. :(.`, flags: MessageFlags.Ephemeral
            });
            return;
        }

        const bouftouEmoji = await JobUtil.getEmojiByName(bouftou.emoji, interaction.client);
        const bouftouName = `${bouftouEmoji} **${bouftou.name}**`;

        if (bouftou.feedCountToday >= 3) {
            await interaction.reply({
                content: `${bouftouName} a déjà mangé 3 fois aujourd'hui.`, flags: MessageFlags.Ephemeral
            });
            return;
        }

        // Vérifier le temps écoulé depuis le dernier repas
        if (bouftou.lastFeedAt) {
            const ThreeHours = 3 * 60 * 60 * 1000;
            const threeHoursAgo = new Date(Date.now() - ThreeHours);
            if (bouftou.lastFeedAt > threeHoursAgo) {
                const timeLeft = Math.ceil((bouftou.lastFeedAt.getTime() + ThreeHours - Date.now()) / (60 * 1000));
                await interaction.reply({
                    content: `${bouftouName} doit attendre encore ${timeLeft} minutes avant de pouvoir manger à nouveau.`,
                    flags: MessageFlags.Ephemeral
                });
                return;
            }
        }

        // Vérifier l'inventaire du joueur
        const item = await PlayerService.getItem(interaction.user, aliment, guild);
        if (!item || item.quantity < 10) {
            await interaction.reply({
                content: `Il vous faut 10x ${aliment} pour nourrir ${bouftouName}.`, flags: MessageFlags.Ephemeral
            });
            return;
        }

        // Consommer 10 unités
        await PlayerService.addPlayerItem(interaction.user, aliment, ItemType.RESSOURCE, -10, guild.id);

        // Mettre à jour le bouftou
        bouftou.feedCountToday += 1;
        bouftou.lastFeedAt = new Date();
        await bouftou.save();

        const alimentEmojiName = Ressources[aliment as ResourceEnum]?.emoji ?? '';
        const alimentEmoji = alimentEmojiName ? await JobUtil.getEmojiByName(alimentEmojiName, interaction.client) : '';

        await interaction.reply({content: `${bouftouName} a été nourri avec ${alimentEmoji} 10x ${aliment}. (${bouftou.feedCountToday}/3 aujourd'hui)`});
    }

    async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
        const focused = interaction.options.getFocused(true);
        if (focused.name !== this.OPTION_NOM) {
            await interaction.respond([]);
            return;
        }

        const guildId = interaction.guild?.id;
        if (!guildId) {
            await interaction.respond([]);
            return;
        }

        const search = String(focused.value ?? '').toLowerCase();
        const bouftous = await BouftouModel.findAll({where: {guildId, isAlive: true}, order: [['name', 'ASC']]});
        const results: ApplicationCommandOptionChoiceData[] = [];
        for (const bouftou of bouftous) {
            if (results.length >= 20) {
                break;
            }
            if (!search || bouftou.name.toLowerCase().includes(search)) {
                results.push({name: bouftou.name, value: bouftou.name});
            }
        }
        await interaction.respond(results);
    }
}

export default Nourrir;
