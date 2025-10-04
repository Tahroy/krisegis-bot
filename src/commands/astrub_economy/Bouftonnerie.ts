import AbstractSubCommand from "../../utils/AbstractSubCommand";
import {
    ActionRowBuilder,
    ChatInputCommandInteraction,
    MessageFlags,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} from "discord.js";
import BuildingGuild from "../../models/astrub_economy/BuildingGuild";
import {BuildingEnum} from "../../models/astrub_economy/Building";
import BouftonnerieState from "../../models/astrub_economy/BouftonnerieState";
import Bouftou from "../../models/astrub_economy/Bouftou";
import JobUtil from "../../services/JobUtil";
import {PlayerService} from "../../services/PlayerService";
import {ResourceEnum} from "../../models/astrub_economy/Enums";
import {ItemType} from "../../utils/Enums";

const MODAL_ID_PREFIX = 'astrub_economie|bouftonnerie-ajouter_';

class Bouftonnerie extends AbstractSubCommand {
    name: string = 'bouftonnerie';
    description: string = "Gérer la bouftonnerie (ajouter un bouftou)";

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const guild = interaction.guild;
        if (!guild) {
            await interaction.reply({
                content: 'Cette commande doit être utilisée dans un serveur.', flags: MessageFlags.Ephemeral
            });
            return;
        }

        // Vérifier que la Bouftonnerie est construite
        const building = await BuildingGuild.findOne({where: {guildId: guild.id, name: BuildingEnum.BOUFTONNERIE}});
        if (!building || building.status !== 'completed') {
            await interaction.reply({
                content: "La Bouftonnerie n'est pas encore construite.", flags: MessageFlags.Ephemeral
            });
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
        const playerItem = await PlayerService.getItem(interaction.user, ResourceEnum.BOUFTOU, interaction.guild)

        if (!playerItem || playerItem.quantity < 1) {
            await interaction.reply({
                content: `Vous devez acheter un bouftou pour en ajouter`,
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        // Afficher la modal
        const modal = new ModalBuilder()
            .setCustomId(`${MODAL_ID_PREFIX}${interaction.user.id}`)
            .setTitle('Ajouter un bouftou');

        const nameInput = new TextInputBuilder()
            .setCustomId('name')
            .setLabel('Nom du bouftou')
            .setStyle(TextInputStyle.Short)
            .setMinLength(3)
            .setMaxLength(20)
            .setRequired(true);

        const row = new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput);
        modal.addComponents(row);

        await interaction.showModal(modal);
    }

    async gererModal(interaction: any): Promise<void> {
        if (!interaction.guild) {
            await interaction.reply({
                content: 'Cette commande doit être utilisée dans un serveur.', flags: MessageFlags.Ephemeral
            });
            return;
        }

        const [, modalFull] = interaction.customId.split('-', 2);
        if (!modalFull.startsWith('ajouter_')) {
            return;
        }

        const guildId = interaction.guild.id;

        // Validation du nom
        const name: string = interaction.fields.getTextInputValue('name')?.trim();

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

        const emojis = ['boufton_noir', 'bouftou', 'boufton_noir', 'bouloute', 'chef_guerre',]

        const emoji = emojis[Math.floor(Math.random() * emojis.length)];

        const created = await Bouftou.create({
            guildId: guildId, userId: interaction.user.id, name: name, emoji: emoji
        });

        const emojiStr = await JobUtil.getEmojiByName(emoji, interaction.client);

        // On retire le bouftou au joueur
        await PlayerService.addPlayerItem(interaction.user, ResourceEnum.BOUFTOU, ItemType.RESSOURCE, -1, guildId);
        await interaction.reply({content: `${emojiStr} Bouftou "${created.name}" ajouté à la Bouftonnerie !`});
    }
}

export default Bouftonnerie;
