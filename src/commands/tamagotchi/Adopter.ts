import AbstractSubCommand from "../../utils/AbstractSubCommand";
import {
    ChatInputCommandInteraction,
    MessageFlags,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    ModalSubmitInteraction
} from "discord.js";
import {SlashCommandSubcommandBuilder} from "@discordjs/builders";
import Pet, {PetType} from "../../models/Pet";
import {PetError} from "../../exceptions/PetError";

class Adopter extends AbstractSubCommand {
    name: string = 'adopter';
    description: string = 'Adopter un nouveau familier';

    private readonly OPTION_TYPE = 'type';
    private readonly MODAL_INPUT_NOM = 'nom_input';

    protected addOptions(builder: SlashCommandSubcommandBuilder) {
        builder
            .addStringOption(option =>
                option
                    .setName(this.OPTION_TYPE)
                    .setDescription('Le type de familier à adopter')
                    .setRequired(true)
                    .addChoices(
                        ...Object.values(PetType).map(type => ({name: type, value: type}))
                    )
            );
    }

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const guildId = interaction.guildId;
        if (!guildId) {
            await interaction.reply({
                content: 'Cette commande doit être utilisée dans un serveur.',
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        const type = interaction.options.getString(this.OPTION_TYPE) as PetType;
        const userId = interaction.user.id;

        // Vérifier si le joueur a déjà un familier vivant dans ce serveur (avant d'ouvrir la modal)
        const existingPet = await Pet.findOne({
            where: {
                guildId,
                userId,
                isAlive: true
            }
        });

        if (existingPet) {
            await interaction.reply({
                content: `⚠️ Vous avez déjà un familier vivant nommé **${existingPet.name}** (${existingPet.type}) sur ce serveur. Occupez-vous de lui d'abord !`,
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        // Créer la modal
        const modal = new ModalBuilder()
            .setCustomId(`familier|adopter-${type}`)
            .setTitle(`Adopter un ${type}`);

        const nameInput = new TextInputBuilder()
            .setCustomId(this.MODAL_INPUT_NOM)
            .setLabel("Nommez votre familier (3-20 caractères)")
            .setStyle(TextInputStyle.Short)
            .setMinLength(3)
            .setMaxLength(20)
            .setPlaceholder("Ex: Gribouille")
            .setRequired(true);

        const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput);
        modal.addComponents(firstActionRow);

        await interaction.showModal(modal);
    }

    async gererModal(interaction: ModalSubmitInteraction): Promise<void> {
        const guildId = interaction.guildId;
        if (!guildId) {
            await interaction.reply({
                content: 'Cette commande doit être utilisée dans un serveur.',
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        const customID = interaction.customId;
        const type = customID.split('-')[1] as PetType;
        const nom = interaction.fields.getTextInputValue(this.MODAL_INPUT_NOM)?.trim();

        try {
            if (!nom || nom.length < 3 || nom.length > 20) {
                throw new PetError('Le nom de votre familier doit contenir entre 3 et 20 caractères.');
            }

            // Validation du format du nom
            const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
            if (!nameRegex.test(nom)) {
                throw new PetError('Le nom du familier contient des caractères non autorisés (lettres, espaces, tirets et apostrophes uniquement).');
            }

            // Double vérification doublon de nom sur le serveur
            const nameDuplicate = await Pet.findOne({
                where: {
                    guildId,
                    name: nom
                }
            });

            if (nameDuplicate) {
                throw new PetError(`Le nom **${nom}** est déjà utilisé par un autre familier sur ce serveur. Veuillez en choisir un autre.`);
            }

            const userId = interaction.user.id;

            // Création du familier
            const now = new Date();
            const newPet = await Pet.create({
                userId,
                guildId,
                name: nom,
                type,
                isAlive: true,
                lastFeedAt: now,
                lastCleanAt: now,
                lastPlayAt: now,
                lastBeggedAt: null,
                energy: 100,
                lives: 10,
                level: 1
            });

            const user = interaction.user;
            const member = await interaction.guild?.members.fetch(user.id);
            const userName = member?.nickname ?? user.globalName ?? user.username;

            await interaction.reply({
                content: `🎉 Félicitations **${userName}** ! Vous venez d'adopter un magnifique **${newPet.type}** nommé **${newPet.name}** ! Prenez bien soin de lui ! ❤️`
            });
        } catch (error) {
            if (error instanceof PetError) {
                await interaction.reply({
                    content: `⚠️ **Erreur :** ${error.message}`,
                    flags: MessageFlags.Ephemeral
                });
            } else {
                console.error(error);
                await interaction.reply({
                    content: "❌ Une erreur interne est survenue lors de l'adoption de votre familier.",
                    flags: MessageFlags.Ephemeral
                });
            }
        }
    }
}

export default Adopter;
