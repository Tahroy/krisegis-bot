import AbstractSubCommand from "../../../utils/AbstractSubCommand";
import {
    ActionRowBuilder,
    ApplicationCommandOptionChoiceData,
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    MessageFlags, ModalBuilder, ModalSubmitInteraction, TextInputBuilder, TextInputStyle,
} from "discord.js";
import {SlashCommandSubcommandBuilder} from "@discordjs/builders";
import {BuildingEnum} from "../../../models/astrub_economy/Building";
import JobUtil from "../../../services/JobUtil";
import BouftouModel from "../../../models/astrub_economy/Bouftou";
import {PlayerService} from "../../../services/PlayerService";
import {ResourceEnum} from "../../../models/astrub_economy/Enums";
import {ItemType} from "../../../utils/Enums";
import {Ressources} from "../../../models/astrub_economy/Resource";
import BouftonnerieState from "../../../models/astrub_economy/BouftonnerieState";
import Bouftou from "../../../models/astrub_economy/Bouftou";

const MODAL_ID_PREFIX = 'astrub_economie|bouftou|ajouter|';
const bouftous = new Map<string, string>();

class Nourrir extends AbstractSubCommand {
    name: string = 'ajouter';
    description: string = "Ajouter un bouftou";

    private readonly OPTION_NOM = 'nom';

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {

        const guild = interaction.guild;
        if (!guild) {
            return;
        }

        // On met en place la bouftonnerie si elle n'existe pas encore
        let state = await BouftonnerieState.findOne({where: {guildId: guild.id}});
        if (!state) {
            state = await BouftonnerieState.create({guildId: guild.id, capacity: 3});
        }

        // S'il y a assez de bouftous, on ne peut plus en ajouter !
        const aliveCount = await Bouftou.count({where: {guildId: guild.id, isAlive: true}});
        if (aliveCount >= state.capacity) {
            await interaction.reply({
                content: `Capacité atteinte (${state.capacity}). Impossible d'ajouter un nouveau bouftou pour le moment.`,
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        // On vérifie que le joueur a un bouftou dans son inventaire
        const playerItem = await PlayerService.getItem(interaction.user, ResourceEnum.BOUFTOU, guild)

        if (!playerItem || playerItem.quantity < 1) {
            await interaction.reply({
                content: `Vous devez acheter un bouftou pour en ajouter`, flags: MessageFlags.Ephemeral
            });
            return;
        }


        const emojis = ['boufton_noir', 'bouftou', 'boufton_noir', 'bouloute', 'chef_de_guerre', 'boufette']
        const emoji = emojis[Math.floor(Math.random() * emojis.length)];

        bouftous.set(interaction.user.id, emoji);

        // Remplace les underscores par des espaces
        let type = emoji.replace(/_/g, " ");

        // Met une majuscule à la première lettre
        type = type.charAt(0).toUpperCase() + type.slice(1);

        console.log(type);
        // Afficher la modal
        const modal = new ModalBuilder()
            .setCustomId(`${MODAL_ID_PREFIX}${interaction.user.id}`)
            .setTitle(`Ajouter un bouftou`);

        const nameInput = new TextInputBuilder()
            .setCustomId(this.OPTION_NOM)
            .setLabel(`Nom du bouftou (${type})`)
            .setStyle(TextInputStyle.Short)
            .setMinLength(3)
            .setMaxLength(20)
            .setRequired(true);

        const row = new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput);
        modal.addComponents(row);

        await interaction.showModal(modal);
    }

    async gererModal(interaction: ModalSubmitInteraction): Promise<void> {
        if (!interaction.guild) {
            await interaction.reply({
                content: 'Cette commande doit être utilisée dans un serveur.', flags: MessageFlags.Ephemeral
            });
            return;
        }

        const guildId = interaction.guild.id;

        // Validation du nom
        const name: string = interaction.fields.getTextInputValue(this.OPTION_NOM)?.trim();

        // Re-check capacité et nom du bouftou dans le doute
        const state = await BouftonnerieState.findOne({where: {guildId}});
        const capacity = state?.capacity ?? 3;
        const aliveCount = await Bouftou.count({where: {guildId, isAlive: true}});

        if (aliveCount >= capacity) {
            await interaction.reply({
                content: `Capacité atteinte (${capacity}). Impossible d'ajouter un nouveau bouftou pour le moment.`,
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        const existing = await Bouftou.findOne({where: {guildId, name: name}});
        if (existing) {
            await interaction.reply({
                content: 'Un bouftou porte déjà ce nom sur ce serveur. Choisissez un autre nom.',
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        const emoji = bouftous.get(interaction.user.id) as string;

        bouftous.delete(interaction.user.id);

        const created = await Bouftou.create({
            guildId: guildId, userId: interaction.user.id, name: name, emoji: emoji
        });

        const emojiStr = await JobUtil.getEmojiByName(emoji, interaction.client);

        // On retire le bouftou au joueur
        await PlayerService.addPlayerItem(interaction.user, ResourceEnum.BOUFTOU, ItemType.RESSOURCE, -1, guildId);
        await interaction.reply({content: `${emojiStr} Bouftou "${created.name}" ajouté à la Bouftonnerie !`});
    }
}

export default Nourrir;
