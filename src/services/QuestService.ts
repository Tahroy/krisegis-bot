import Quest from "../models/astrub_economy/Quest";
import {QuestEnum, QuestTemplate, QuestTemplates} from "../models/astrub_economy/QuestTemplate";
import {PopulationService} from "./PopulationService";
import PlayerItem from "../models/PlayerItem";
import {PlayerService} from "./PlayerService";
import {EmbedBuilder, User} from "discord.js";
import KrisegisClient from "../models/KrisegisClient";
import JobUtil from "./JobUtil";
import {Ressources} from "../models/astrub_economy/Resource";
import {Crafts} from "../models/astrub_economy/Craft";
import {CraftEnum, ResourceEnum} from "../models/astrub_economy/Enums";
import {MeteoService} from "./MeteoService";
import {MeteosEnum} from "../models/astrub_economy/Meteo";
import EconomyService from "./EconomyService";
import {ItemType} from "../utils/Enums";
import Job from "../models/astrub_economy/Job";
import {Op} from "sequelize";

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

            const user = {id: userId} as User;

            await PlayerService.addPlayerItem(user, 'Kamas', ItemType.RESSOURCE, rewardShare, guildId);
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

    // Détermine les prérequis de métiers (job -> niveau minimal) pour un objet (ressource ou craft)
    private static getJobRequirementsForItem(itemName: string, items: Set<string> = new Set()): Record<string, number> {
        if (items.has(itemName)) {
            return {};
        }
        items.add(itemName);

        const jobs: Record<string, number> = {};

        const resource = Ressources[itemName as ResourceEnum];
        if (resource) {
            if (resource.job) {
                jobs[resource.job] = Math.max(jobs[resource.job] ?? 0, Number(resource.level));
            }
            return jobs;
        }

        const craft = Crafts[itemName as CraftEnum];
        if (craft) {
            const recipe = craft.recipe as Record<string, number>;
            for (const ingredientName of Object.keys(recipe)) {
                const subJobs = this.getJobRequirementsForItem(ingredientName, items);
                for (const [jobName, lvl] of Object.entries(subJobs)) {
                    jobs[jobName] = Math.max(jobs[jobName] ?? 0, lvl);
                }
            }
        }

        return jobs;
    }

    // Vérifie qu'au moins un joueur sur le serveur possède les métiers requis
    private static async checkGuildJobsRequirements(guildId: string, jobsRequirements: Record<string, number>): Promise<boolean> {
        for (const [jobName, minLevel] of Object.entries(jobsRequirements)) {
            const found = await Job.findOne({
                where: {
                    guildId: guildId,
                    name: jobName,
                    level: { [Op.gte]: minLevel }
                }
            });
            if (!found) {
                return false;
            }
        }
        return true;
    }

    public static async generateRandomQuest(guildId: string): Promise<Quest|null> {
        // Pas plus de quêtes que de joueurs actifs
        const nbPlayers = await JobUtil.getNbActivesPlayers(guildId)
        const activesQuests = await QuestService.getActiveQuests(guildId);

        if (activesQuests.length >= (nbPlayers / 2)) {
            return null;
        }

        // Récupérer la météo actuelle
        const currentWeather: string|null = await MeteoService.chargerMeteo(guildId);
        // Récupérer la population actuelle
        const currentPopulationModel = await PopulationService.getOrCreatePopulation(guildId);
        const currentPopulation = currentPopulationModel.population;
        const currentHappiness = currentPopulationModel.happiness;

        const allQuestNames = Object.values(QuestEnum);
        const availableQuests: QuestEnum[] = [];

        // Récupération des quêtes valides
        for (const questName of allQuestNames) {
            const questTemplate = QuestTemplates[questName];
            
            // Vérifier si la quête est définie
            if (!questTemplate) {
                continue;
            }

            // On vérifie que la quête n'est pas déjà en cours sur le serveur
            const existingQuest = await this.getQuestByName(guildId, questName);
            if (existingQuest) {
                continue;
            }
           
            // On vérifie s'il y a une condition de météo
            if (questTemplate.weather && questTemplate.weather.length > 0) {
                if (!currentWeather || !questTemplate.weather.includes(currentWeather as MeteosEnum)) {
                    continue;
                }
            }

            // Vérifier la condition de population minimale
            if (questTemplate.minPopulation && currentPopulation < questTemplate.minPopulation) {
                continue;
            }

            // Les quêtes de joie sont inutiles si joie = 100
            if (questTemplate.rewardType === 'happiness' && currentHappiness === 100) {
                continue;
            }

            // Calcul des prérequis de métiers à partir des objets requis
            const jobsRequirements: Record<string, number> = {};
            for (const itemName of Object.keys(questTemplate.requiredItems)) {
                const jobsRequirementsItem = this.getJobRequirementsForItem(itemName);
                for (const [jobName, lvl] of Object.entries(jobsRequirementsItem)) {
                    jobsRequirements[jobName] = Math.max(jobsRequirements[jobName] ?? 0, lvl as number);
                }
            }

            // On vérifie que tous les bâtiments nécessaires sont construits
            let allBuildingsConstructed = true;
            for (const buildingName of (questTemplate.buildings || [])) {
                const isConstructed = await JobUtil.isBuildingConstructed(guildId, buildingName);
                if (!isConstructed) {
                    allBuildingsConstructed = false;
                    break;
                }
            }

            // On vérifie que tous les métiers requis sont atteints
            if (allBuildingsConstructed && await this.checkGuildJobsRequirements(guildId, jobsRequirements)) {
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
                .map(([itemName, quantity]) => `- ${itemName} : ${quantity}`)
                .join('\n');

            const rewardAmount = QuestService.calculReward(questTemplate);
            const rewardType = questTemplate.rewardType === 'kamas' ? 'kamas' : 'joie';

            const embed = new EmbedBuilder()
                .setTitle(`Nouvelle quête : ${quest.name}`)
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
                let reward = QuestService.calculReward(template) / 2;

                if (template.rewardType === 'kamas') {
                    reward /= 200;
                }

                happinessLost += Math.floor(reward);

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
            const item = Ressources[itemName as ResourceEnum] || Crafts[itemName as CraftEnum];

            if (item) {
                reward += EconomyService.calculSell(item) * quantity;
            }
        }

        reward *= 1.2;

        if (quest.rewardType === 'happiness') {
            reward /= 200
        }

        return Math.floor(reward);
    }

    /**
     * Génère une nouvelle quête pour un serveur et l'annonce
     */
    static async generateAndAnnounceQuest(client: KrisegisClient, guildId: string): Promise<void> {
        await QuestService.deleteOldQuests(client, guildId);

        // Une chance sur 12 de déclencher une quête
        const random = Math.random() * 12 < 1

        if (!random) {
            return;
        }

        const quest = await QuestService.generateRandomQuest(guildId);

        if (quest) {
            await QuestService.announceQuest(client, quest);
        }
    }
}
