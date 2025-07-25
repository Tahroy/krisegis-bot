import Quest from "../models/astrub_economy/Quest";
import {QuestEnum, QuestTemplate, QuestTemplates} from "../models/astrub_economy/QuestTemplate";
import {PopulationService} from "./populationService";
import PlayerItem from "../models/PlayerItem";
import {ItemType} from "./playerItemService";
import {EmbedBuilder, User} from "discord.js";
import KrisegisClient from "../models/KrisegisClient";
import JobUtil from "./JobUtil";
import {Ressources} from "../models/astrub_economy/Ressource";
import {Crafts} from "../models/astrub_economy/Craft";
import {CraftEnum, RessourcesEnum} from "../models/astrub_economy/Enums";

export class QuestService {
    /**
     * Ajoute à une quête un objet venant d'un joueur
     * @throws Error
     */
    public static async contributeToQuest(questId: number, user: User, guildId: string, itemName: string, quantity: number): Promise<void> {
        // Vérifier si la quête existe et est active
        const quest = await Quest.findOne({
            where: {
                id: questId, guildId, status: 'active'
            }
        });

        if (!quest) {
            throw new Error("Quête introuvable ou déjà complétée.")
        }

        const questTemplate = QuestTemplates[quest.name as QuestEnum];
        if (!questTemplate) {
            throw new Error("Quête incorrecte.");
        }

        // Vérifier si l'objet est requis pour cette quête
        if (!questTemplate.requiredItems[itemName]) {
            throw new Error(`L'objet ${itemName} n'est pas requis pour cette quête.`)
        }

        // Vérifier si le joueur possède bien l'objet
        const playerItem = await PlayerItem.findOne({
            where: {
                userId: user.id, guildId, name: itemName
            }
        });

        if (!playerItem || playerItem.quantity < quantity) {
            throw new Error(`Vous ne possédez pas assez de ${itemName}. Requis: ${quantity}, Possédé: ${playerItem?.quantity || 0}.`)
        }

        const itemsProvided = quest.itemsProvided || {};
        const participants = quest.participants || {};

        // On vérifie qu'on ne dépasse pas le maximum
        const maxQuantity = questTemplate.requiredItems[itemName];
        if (quantity + (itemsProvided[itemName] || 0) > maxQuantity) {
            throw new Error(`Vous ne pouvez pas fournir plus de ${maxQuantity} ${itemName}.`)
        }

        playerItem.quantity -= quantity;
        await playerItem.save();

        // On met à jour les objets de la quête
        itemsProvided[itemName] = (itemsProvided[itemName] || 0) + quantity;

        // Mettre à jour les participants
        participants[user.id] = (participants[user.id] || 0) + quantity;

        await Quest.update({
            itemsProvided: itemsProvided,
            participants: participants
        }, {
            where: {
                id: questId, guildId
            }
        });
    }

    static async distributeRewards(quest: Quest, questTemplate: QuestTemplate, guildId: string): Promise<void> {
        const totalContributions = Object.values(quest.participants)
            .reduce((sum, value) => sum + value, 0);

        if (totalContributions === 0) {
            return;
        }

        const rewardAmount = QuestService.calculReward(questTemplate);

        // Si la récompense est de la joie, l'ajouter à la population
        if (questTemplate.rewardType === 'happiness') {
            await PopulationService.updateHappiness(guildId, rewardAmount);
            return;
        }

        // On boucle sur les participants et on distribue les kamas
        for (const [userId, contribution] of Object.entries(quest.participants)) {
            const rewardShare = Math.floor((contribution / totalContributions) * rewardAmount);

            if (rewardShare <= 0) {
                continue;
            }

            await PlayerItem.upsert({userId, guildId, name: 'Kamas', type: ItemType.RESSOURCE, quantity: rewardShare});
        }
    }

    public static async createQuest(guildId: string, questName: QuestEnum): Promise<Quest> {
        const questTemplate = QuestTemplates[questName];

        return await Quest.create({
            guildId, name: questTemplate.name, status: 'active'
        });
    }

    /**
     * Récupère toutes les quêtes actives pour un serveur
     */
    public static async getActiveQuests(guildId: string): Promise<Quest[]> {
        return await Quest.findAll({
            where: {
                guildId, status: 'active'
            }
        });
    }

    /**
     * Récupère une quête spécifique par son nom pour un serveur
     */
    public static async getQuestByName(guildId: string, questName: string): Promise<Quest | null> {
        return await Quest.findOne({
            where: {
                guildId:guildId,
                name: questName,
                status: 'active'
            }
        });
    }

    /**
     * Vérifie si une quête est complétée (tous les objets requis ont été fournis)
     */
    public static async checkQuestCompletion(quest: Quest): Promise<boolean> {
        const questTemplate = QuestTemplates[quest.name as QuestEnum];

        if (!questTemplate) {
            return false;
        }

        // Vérifier si tous les objets requis ont été fournis
        for (const [itemName, requiredQuantity] of Object.entries(questTemplate.requiredItems)) {
            const providedQuantity = quest.itemsProvided[itemName] || 0;
            if (providedQuantity < requiredQuantity) {
                return false;
            }
        }

        return true;
    }

    public static async generateRandomQuest(guildId: string): Promise<Quest|null> {
        // Pas plus de quêtes que de joueurs actifs
        const nbPlayers = await JobUtil.getNbActivesPlayers(guildId)
        const activesQuests = await QuestService.getActiveQuests(guildId);

        if (activesQuests.length >= nbPlayers) {
            return null;
        }

        const allQuestNames = Object.values(QuestEnum);
        const availableQuests: QuestEnum[] = [];

        // Récupération des quêtes valides
        for (const questName of allQuestNames) {
            const questTemplate = QuestTemplates[questName];

            // On vérifie que la quête n'est pas déjà en cours sur le serveur
            const existingQuest = await this.getQuestByName(guildId, questName);
            if (existingQuest) {
                continue;
            }

            if (!questTemplate.buildings || questTemplate.buildings.length === 0) {
                availableQuests.push(questName);
                continue;
            }

            // On vérifie que tous les bâtiments nécessaires sont construits
            let allBuildingsConstructed = true;
            for (const buildingName of questTemplate.buildings) {
                const isConstructed = await JobUtil.isBuildingConstructed(guildId, buildingName);
                if (!isConstructed) {
                    allBuildingsConstructed = false;
                    break;
                }
            }

            if (allBuildingsConstructed) {
                availableQuests.push(questName);
            }
        }

        if (!availableQuests.length) {
            return null;
        }
        // On fait une quête au hasard parmi les disponibles
        const randomQuestName = availableQuests[Math.floor(Math.random() * availableQuests.length)];
        return await this.createQuest(guildId, randomQuestName);
    }

    /**
     * Annonce une nouvelle quête dans le canal approprié
     */
    public static async announceQuest(client: KrisegisClient, quest: Quest): Promise<void> {
        const channel = JobUtil.getChannel(client, quest.guildId);

        const questTemplate = QuestTemplates[quest.name as QuestEnum];

        if (channel && channel.isTextBased()) {
            const requiredItemsText = Object.entries(questTemplate.requiredItems)
                .map(([itemName, quantity]) => `- ${itemName}: ${quantity}`)
                .join('\n');

            const rewardAmount = QuestService.calculReward(questTemplate);
            const rewardType = questTemplate.rewardType === 'kamas' ? 'kamas' : 'joie';

            const embed = new EmbedBuilder()
                .setTitle(`Nouvelle quête: ${quest.name}`)
                .setColor("#0099ff")
                .setDescription(`${questTemplate.description}\n\n` + `**Objets requis :**\n${requiredItemsText}\n\n` + `**Récompense :** ${rewardAmount} ${rewardType}`)
                .setTimestamp();

            await channel.send({embeds: [embed]});
        }
    }

    static async deleteOldQuests(client: KrisegisClient, guildId: string) {
        const allQuests = await this.getActiveQuests(guildId);

        let happinessLost = 0;
        for (const quest of allQuests) {
            // Si la quête a plus de 24h
            const maxTime = 24 * 60 * 60 * 1000; // Prod
            //const maxTime = 2 * 60 * 1000; // debug
            if (Date.now() - quest.createdAt.getTime() > maxTime) {

                // On supprime la quête
                quest.status = 'failed'
                await quest.save();

                const template = QuestTemplates[quest.name as QuestEnum];
                let reward = Math.floor(QuestService.calculReward(template) / 2);

                if (template.rewardType === 'kamas') {
                    reward /= 200;
                }

                happinessLost += reward;

                const channel = JobUtil.getChannel(client, guildId);

                if (channel && channel.isTextBased()) {
                    const embed = new EmbedBuilder()
                        .setTitle(`La quête ${quest.name} a échoué !`)
                        .setColor("#ff3333")
                        .setDescription(`La joie diminue de ${reward} dans le village`)
                        .setTimestamp();

                    await channel.send({embeds: [embed]});
                }
                console.log(`${quest.name} échouée`)
            }
        }

        await PopulationService.updateHappiness(guildId, -happinessLost);
    }

    static calculReward(quest: QuestTemplate) {
        let reward = 0;
        for (const [itemName, quantity] of Object.entries(quest.requiredItems)) {
            const item = Ressources[itemName as RessourcesEnum] || Crafts[itemName as CraftEnum];

            if (item) {
                reward += JobUtil.calculSell(item) * quantity;
            }
        }

        reward *= 1.2;

        if (quest.rewardType === 'happiness') {
            reward /= 200
        }

        return Math.floor(reward);
    }
}
