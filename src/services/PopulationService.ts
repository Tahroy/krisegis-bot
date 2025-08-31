import Population from "../models/astrub_economy/Population";
import KrisegisClient from "../models/KrisegisClient";
import {EmbedBuilder} from "discord.js";
import JobUtil from "./JobUtil";
import Player from "../models/astrub_economy/Player";

export class PopulationService {
    public static async getOrCreatePopulation(guildId: string): Promise<Population> {
        let population = await Population.findOne({
            where: {guildId}
        });

        if (!population) {
            population = await Population.create({
                guildId, 
                population: 100,
                maxPopulation: 200,
                happiness: 50,
                lastUpdate: new Date()
            });
        }

        return population;
    }

    /**
     *
     * Met à jour la population d'Astrub selon la joie dans la cité
     * La joie est reset et la population augmente ou baisse selon la joie
     * À 0 de joie: -15 / +5
     * À 50 de joie: -10 / +10
     * À 100 de joie: -5 / +15
     */
    public static async updatePopulation(guildId: string): Promise<void> {
        // Uniquement si on a des récoltes sur le serveur ces dernières 24h
        const now = new Date();

        // On récupère le dernier joueur pour récupérer sa dernière récolte
        const lastUpdate = await Player.findOne({
            where: {
                guildId
            },
            order: [['lastHarvest', 'DESC']]
        })

        if (!lastUpdate || !lastUpdate.lastHarvest) {
            return;
        }

        const lastHarvest = lastUpdate.lastHarvest;
        const timeSinceLastHarvest = now.getTime() - lastHarvest.getTime();

        if (timeSinceLastHarvest > 24 * 60 * 60 * 1000) {
            return;
        }

        // On récupère ou on crée la population actuelle
        const population = await PopulationService.getOrCreatePopulation(guildId);

        // Calcul du changement de population basé sur le niveau de joie
        const happinessInfluence = (population.happiness - 50) / 100;

        // La joie permet à 0 d'aller de -15 à 5 et à 100 d'aller de -5 à 15
        const min = -10 - (happinessInfluence * 5);
        const max = 10 + (happinessInfluence * 5);
        const range = max - min;

        const change = Math.floor(Math.random() * range + min);

        // Mettre à jour la population en respectant la limite maximale
        population.population = Math.min(population.maxPopulation, Math.max(0, population.population + change));
        population.lastUpdate = now;

        // On tend vers 50 à coup de +/- 10
        /*
        if (population.happiness > 50) {
            population.happiness = Math.max(50, population.happiness - 5);
        }
        if (population.happiness < 50) {
            population.happiness = Math.min(50, population.happiness + 5);
        }
        */

        await population.save();
    }

    public static async annoncePopulation(client: KrisegisClient, guildId: string) {
        const channel = JobUtil.getChannel(client, guildId);

        if (channel && channel.isTextBased()) {
            const embed = await PopulationService.getEmbedPopulation(guildId);

            await channel.send({embeds: [embed]});
        }
    }

    /**
     * Mise à jour de la joie d'un serveur Discord
     */
    public static async updateHappiness(guildId: string, amount: number): Promise<Population> {
        const population = await PopulationService.getOrCreatePopulation(guildId);

        population.happiness = Math.max(0, Math.min(100, population.happiness + amount));
        await population.save();

        return population;
    }

    /**
     * Augmente la population maximale d'un serveur Discord
     * @param guildId ID du serveur Discord
     * @param amount Montant d'augmentation de la population maximale
     */
    public static async increaseMaxPopulation(guildId: string, amount: number): Promise<Population> {
        const population = await PopulationService.getOrCreatePopulation(guildId);

        population.maxPopulation += amount;
        await population.save();

        return population;
    }

    public static getHappinessDescription(happiness: number): string {
        let description = '';

        if (happiness === 100) {
            description = "🌟 La joie a rarement été aussi présente à Astrub, même les bouftous ont l'air d'avoir le sourire au visage. Brutas s'en reviendrait pas. Le mieux dans tout cela ? C'est grâce à vous !";
        } else if (happiness < 20) {
            description = "😡 L'ambiance est au point mort à Astrub. Les habitants rentrent chez eux le soir, la taverne se vide, les aires de jeux pour enfants n'accueillent plus personne. Astrub a connu de meilleurs jours !";
        } else if (happiness < 40) {
            description = "😔 Astrub est morose aujourd'hui. Le marché est boudé de la population et les habitants se contentent de se rendre à la taverne pour espérer que demain soit meilleur.";
        } else if (happiness < 60) {
            description = "😐 Les habitants d'Astrub vaquent à leurs occupations habituelles. La vie suit son cours, qu'elle soit belle ou triste !";
        } else if (happiness < 80) {
            description = "🙂 Les enfants sortent dans les rues pour s'amuser, quelle que soit la météo. Les cris de joie se font entendre à la taverne et le marché est rempli de curieux et de commerçants.";
        } else {
            description = "😄 La joie règne dans le village d'Astrub ! Les habitants chantent, dansent, organisent des distributions gratuites de nourriture... Tout va bien dans le Monde des Dix. ";
        }

        return description;
    }

    public static async getEmbedPopulation(guildId: string): Promise<EmbedBuilder> {
        const population = await PopulationService.getOrCreatePopulation(guildId);
        const happinessDescription = PopulationService.getHappinessDescription(population.happiness);


        return new EmbedBuilder()
            .setTitle(`Population d'Astrub`)
            .setColor("#0099ff")
            .setDescription(
                `La cité d'Astrub compte actuellement **${population.population}/${population.maxPopulation}** habitants.\n\n` +
                `**Niveau de joie:** ${population.happiness}/100\n` +
                `${happinessDescription}\n\n`
            )
            .setTimestamp();
    }
}
