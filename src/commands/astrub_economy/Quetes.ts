import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    MessageFlags,
    SlashCommandSubcommandBuilder
} from "discord.js";
import AbstractSubCommand from "../../utils/AbstractSubCommand";
import {QuestService} from "../../services/QuestService";
import JobUtil from "../../services/JobUtil";
import {QuestEnum, QuestTemplates} from "../../models/astrub_economy/QuestTemplate";
import Quest from "../../models/astrub_economy/Quest";

export default class Quetes extends AbstractSubCommand {
    name: string = 'quetes';
    description: string = "Gérer les quêtes d'Astrub";

    readonly OPTION_QUEST = 'quete';
    readonly OPTION_ITEM = 'objet';
    readonly OPTION_QUANTITY = 'quantite';

    async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
        const focusedOption = interaction.options.getFocused(true);

        if (focusedOption.name === this.OPTION_ITEM) {
            const questName = interaction.options.getString(this.OPTION_QUEST);
            const questTemplate = QuestTemplates[questName as QuestEnum];
            const value = focusedOption.value.toString().toLowerCase();
            const quest = await QuestService.getQuestByName(interaction.guildId as string, questName as string)

            if (!questName || !questTemplate || !quest) {
                await interaction.respond([]);
                return;
            }

            const requiredItems = Object.keys(questTemplate.requiredItems);

            const filteredItems = requiredItems
                .filter(itemName => itemName.toLowerCase().includes(value))
                .slice(0, 25);

            await interaction.respond(filteredItems.map(itemName => {
                const requiredQuantity = questTemplate.requiredItems[itemName];
                const providedQuantity = quest.itemsProvided[itemName] || 0;
                return {
                    name: `${itemName} (${providedQuantity}/${requiredQuantity})`, value: itemName
                };
            }));
            return;
        }

        if (focusedOption.name === this.OPTION_QUEST) {
            const value = focusedOption.value.toString().toLowerCase();

            const activeQuests = await QuestService.getActiveQuests(interaction.guildId as string);
            const filteredQuests = activeQuests
                .filter(quest => quest.name.toLowerCase().includes(value))
                .slice(0, 25);

            await interaction.respond(filteredQuests.map(quest => ({
                name: quest.name, value: quest.name
            })));
            return;
        }
        await interaction.respond([]);
        return;
    }

    protected addOptions(builder: SlashCommandSubcommandBuilder) {
        builder.addStringOption(option => option
            .setName(this.OPTION_QUEST)
            .setDescription('Nom de la quête à compléter')
            .setRequired(true)
            .setAutocomplete(true));

        builder.addStringOption(option => option
            .setName(this.OPTION_ITEM)
            .setDescription('Objet à fournir pour la quête')
            .setRequired(true)
            .setAutocomplete(true));

        builder.addIntegerOption(option => option
            .setName(this.OPTION_QUANTITY)
            .setDescription("Quantité d'objets à fournir")
            .setRequired(true)
            .setMinValue(1));
    }

    public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        await this.completeQuest(interaction);
    }

    private async completeQuest(interaction: ChatInputCommandInteraction): Promise<void> {
        let quest: Quest|undefined;

        if (typeof interaction.guildId !== "string") {
            return;
        }

        // Sinon, utiliser le nom de la quête
        const questName = interaction.options.getString(this.OPTION_QUEST);
        if (!questName) {
            await interaction.reply({
                content: 'Il faut choisir une quête !', flags: MessageFlags.Ephemeral
            });
            return;
        }

        const activeQuests = await QuestService.getActiveQuests(interaction.guildId);
        quest = activeQuests.find(q => q.name === questName);

        if (!quest) {
            await interaction.reply({content: "Cette quête n'est pas en cours !", flags: MessageFlags.Ephemeral});
            return;
        }

        const itemName = interaction.options.getString(this.OPTION_ITEM);
        if (!itemName) {
            await interaction.reply({content: "Il faut définir un objet à fournir !", flags: MessageFlags.Ephemeral});
            return;
        }

        const quantity = interaction.options.getInteger(this.OPTION_QUANTITY);
        if (!quantity || quantity <= 0) {
            await interaction.reply({content: 'Il faut renseigner une quantité !', flags: MessageFlags.Ephemeral});
            return;
        }

        const item = JobUtil.getItem(itemName);
        if (!item) {
            await interaction.reply({content: `L'objet "${itemName}" n'existe pas.`, flags: MessageFlags.Ephemeral});
            return;
        }

        try {
            await QuestService.contributeToQuest(quest.id, interaction.user, interaction.guildId, itemName, quantity);
            quest = await QuestService.getQuestByName(interaction.guildId, questName) as Quest;
        } catch (error) {
            await interaction.reply({
                content: `${error instanceof Error ? error.message : 'Une erreur est survenue'}`,
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        const isCompleted = await QuestService.checkQuestCompletion(quest)

        const guild = interaction.guild
        const user = interaction.user
        const memberCatch = await guild?.members.fetch(user.id)
        const userName = memberCatch?.nickname ?? user.globalName

        if (isCompleted) {
            const template = QuestTemplates[quest.name as QuestEnum];
            await QuestService.distributeRewards(quest, template, interaction.guildId);
            quest.status = 'completed';
            await quest.save();

            const amount = QuestService.calculReward(template)
            const reward = `${amount} ${template.rewardType === 'kamas' ? 'kamas' : 'joie'}`

            await interaction.reply({content: `🎉🎉 ${userName} a fourni ${quantity} ${itemName} et complété la quête. Les participants ont reçu ${reward} ! 🎉🎉`});
        } else {
            await interaction.reply({content: `${userName} a fourni ${quantity} ${itemName} pour la quête. Continuez à contribuer pour la compléter !`});
        }
    }
}
