import Population from "../models/astrub_economy/Population";
import KrisegisClient from "../models/KrisegisClient";
import {EmbedBuilder} from "discord.js";
import JobUtil from "./JobUtil";

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
        const population = await PopulationService.getOrCreatePopulation(guildId);

        const now = new Date();

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

        // Reset de la joie à 50 (niveau neutre)
       // population.happiness = 50;

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

    public static getPopulationDescription(population: number): string {
        let description = '';

        if (population < 50) {
            description = '📉 La cité est presque déserte. Les commerces ferment et les bâtiments se dégradent.';
        } else if (population < 100) {
            description = '📉 La population diminue. Certains habitants quittent la cité pour chercher fortune ailleurs.';
        } else if (population < 150) {
            description = '📊 La population est stable. La vie à Astrub suit son cours normal.';
        } else if (population < 200) {
            description = '📈 La population augmente. De nouveaux habitants s\'installent, attirés par les opportunités.';
        } else {
            description = '📈 La cité est florissante ! Les rues sont animées et l\'économie prospère.';
        }
        return description;
    }

    public static getHappinessDescription(happiness: number): string {
        let description = '';

        if (happiness < 20) {
            description = '😡 Les habitants sont mécontents et en colère. Des manifestations éclatent régulièrement.';
        } else if (happiness < 40) {
            description = '😔 Le moral est bas. Les habitants sont moroses et peu enclins à participer à la vie de la cité.';
        } else if (happiness < 60) {
            description = '😐 L\'ambiance est neutre. Les habitants vaquent à leurs occupations sans enthousiasme particulier.';
        } else if (happiness < 80) {
            description = '🙂 Les habitants sont plutôt satisfaits. On entend des rires dans les rues d\'Astrub.';
        } else {
            description = '😄 La joie règne dans la cité ! Les habitants sont enthousiastes et organisent régulièrement des festivités.';
        }

        return description;
    }

    public static async getEmbedPopulation(guildId: string): Promise<EmbedBuilder> {
        const population = await PopulationService.getOrCreatePopulation(guildId);
        const populationDescription = PopulationService.getPopulationDescription(population.population);
        const happinessDescription = PopulationService.getHappinessDescription(population.happiness);


        return new EmbedBuilder()
            .setTitle(`Population d'Astrub`)
            .setColor("#0099ff")
            .setDescription(
                `La cité d'Astrub compte actuellement **${population.population}/${population.maxPopulation}** habitants.\n\n` +
                `${populationDescription}\n\n` +
                `**Niveau de joie:** ${population.happiness}/100\n` +
                `${happinessDescription}\n\n` +
                `*Construisez des maisons pour augmenter la population maximale de la cité.*`
            )
            .setTimestamp();
    }
}
