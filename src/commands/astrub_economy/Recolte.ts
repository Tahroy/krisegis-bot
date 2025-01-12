import {AutocompleteInteraction, CommandInteraction, CommandInteractionOptionResolver, User} from "discord.js";
import AbstractSubCommand from "../../utils/AbstractSubCommand";
import {SlashCommandSubcommandBuilder} from "@discordjs/builders";
import Job from '../../models/astrub_economy/Job'
import Player from "../../models/astrub_economy/Player";
import {ItemType, PlayerService} from "../../services/playerItemService";
import JobUtil from "./JobUtil";
import Ressource, {Ressources} from "../../models/astrub_economy/Ressource";

class Recolte extends AbstractSubCommand {
    description: string = "Récolter des ressources (toutes les 15 minutes)";
    name: string = "recolte";

    public async execute(interaction: CommandInteraction): Promise<void> {
        if (!interaction.isCommand() || !(interaction.options instanceof CommandInteractionOptionResolver)) {
            return;
        }

        const options = interaction.options;
        const ressourceChoice = options.getString('ressource');

        if (!ressourceChoice) {
            await interaction.reply({content: "Vous devez choisir une ressource !", ephemeral: true})
            return;
        }

        const item = JobUtil.getRessource(ressourceChoice);

        if (!item) {
            await interaction.reply({content: "Cette ressource n'existe pas !", ephemeral: true})
            return
        }

        const player: Player = await JobUtil.getPlayer(interaction.user);
        const job: Job = await player.getJob(item.job)

        // Si la dernière récolte était il y a moins de 15 min, on refuse
        if (player.lastHarvest && JobUtil.isLessThanXMinutesAgo(player.lastHarvest, 15)) {
            const timeBeforeNext = JobUtil.getTimeBeforeNextHarvest(player.lastHarvest, 15)

            const minutes = Math.floor((timeBeforeNext % 3600000) / 60000)
            const seconds = Math.floor((timeBeforeNext % 60000) / 1000)

            const pluralM = minutes <= 1 ? '' : 's'
            const pluralS = seconds <= 1 ? '' : 's'

            await interaction.reply({
                content: `Vous pourrez récolter dans ${minutes} minute${pluralM} et ${seconds} seconde${pluralS}.`,
                ephemeral: true
            })
            return;
        }

        const ressource = job.getRessource()
        if (!ressource) {
            await interaction.reply({
                content: 'Aucune ressource disponible',
                ephemeral: true
            })
            return;
        }

        if (item && item.level > job.level) {
            await interaction.reply({
                content: `Vous devez avoir un niveau ${item.level} pour récolter ${ressource} !`,
                ephemeral: true
            })
            return
        }

        const quantity: number = this.getQuantity(job.level, item?.level ?? 1)
        const xp: number = 10 + job.level/1.5 - item.level;

        job.experience += xp;


        await PlayerService.addPlayerItem(interaction.user, ressource, ItemType.RESSOURCE, quantity)
        await player.update({lastHarvest: new Date()})
        const user = interaction.user;

        const guild = interaction.guild
        const memberCatch = await guild?.members.fetch(user.id)
        const userName = memberCatch?.nickname ?? user.globalName
        const level = JobUtil.getLevelFromXP(job.experience)

        let text = `**${userName}** a récolté ${quantity} x ${ressource} !`;
        if (level != job.level) {
            text += `\n**${userName}** passe ${job.name} niveau ${level} !`
        }

        await job.update({experience: job.experience, level: level});

        await interaction.reply({content: text,});
    }

    protected addOptions(builder: SlashCommandSubcommandBuilder) {
        builder.addStringOption(
            option => option.setName("ressource").setRequired(true).setDescription("Ressource à récolter").setAutocomplete(true)
        )
    }

    async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
        const ressources: Ressource[] = Object.values(Ressources).sort((a, b) => a.name.localeCompare(b.name))

        const responses = [];
        for (const ressource of ressources) {

            // Si au-dessus du level 1, on vérifie
            if (ressource.level > 1) {
                const job = await Job.findOne({where: {user_id: interaction.user.id, name: ressource.name}})
                if (!job || job.level < ressource.level) {
                    continue
                }
            }

            responses.push({name: ressource.name, value: ressource.name})
        }

        await interaction.respond(responses)
    }

    private async getJob(user: User, jobChoice: string): Promise<Job> {
        let job = await Job.findOne({
            where: {
                user_id: user.id,
                name: jobChoice
            }
        });

        if (job) {
            return job;
        }

        return await Job.create({name: jobChoice, user_id: user.id, level: 1, experience: 0})
    }

    getRandomInt(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    private getQuantity(jobLevel: number, itemLevel: number): number {
        const randomBase = this.getRandomInt(1, 3); // Random entre 1 et 3
        const randomLevel = this.getRandomInt(Math.ceil(jobLevel / 2), jobLevel); // Random entre niveau/2 et niveau, arrondi au supérieur
        const quantity = randomBase + randomLevel - itemLevel;

        return Math.max(quantity, 0); // Assure que la quantité ne soit pas négative
    }

}

export default Recolte;