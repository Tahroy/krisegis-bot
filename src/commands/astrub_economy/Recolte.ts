import {AutocompleteInteraction, CommandInteraction, CommandInteractionOptionResolver, User} from "discord.js";
import AbstractSubCommand from "../../utils/AbstractSubCommand";
import {SlashCommandSubcommandBuilder} from "@discordjs/builders";
import Job, {JobEnum} from './../../models/Job'
import Player from "../../models/Player";
import {ItemType, PlayerService} from "../../services/playerItemService";
import JobUtil from "./JobUtil";

class Recolte extends AbstractSubCommand {
    description: string = "Récolter des ressources (toutes les 15 minutes)";
    name: string = "recolte";

    public async execute(interaction: CommandInteraction): Promise<void> {
        if (!interaction.isCommand() || !(interaction.options instanceof CommandInteractionOptionResolver)) {
            return;
        }

        const options = interaction.options;
        const jobChoice = options.getString('metier');

        if (!jobChoice) {
            await interaction.reply({content: "Vous devez choisir un métier !", ephemeral: true})
            return;
        }

        const player = await this.getPlayer(interaction.user);
        const job = await this.getJob(interaction.user, jobChoice);

        // Si la dernière récolte était il y a moins de 15 min, on refuse
        if (player.lastHarvest && JobUtil.isLessThanXMinutesAgo(player.lastHarvest, 15)) {
            await interaction.reply({
                content: "Vous ne pouvez récolter qu'une fois toutes les 15 minutes.",
                ephemeral: true
            })
            return;
        }

        // Quantity = Niveau + random(0,3)
        const quantity: number = job.level + Math.floor(Math.random() * 3);
        const xp: number = 10;

        job.experience += xp;

        const ressource = job.getRessource()

        if (!ressource) {
            await interaction.reply({
                content: 'Aucune ressource disponible',
                ephemeral: true
            })
            return;
        }

        await PlayerService.addPlayerItem(interaction.user, ressource, ItemType.RESSOURCE, quantity)
        await job.update({experience: job.experience});
        await player.update({lastHarvest: new Date()})

        const user = interaction.user;
        const guild = interaction.guild
        const memberCatch = await guild?.members.fetch(user.id)
        const userName = memberCatch?.nickname ?? user.globalName

        let text = `${userName} a récolté ${quantity} x ${ressource} !`;

        await interaction.reply({content: text,});
    }

    protected addOptions(builder: SlashCommandSubcommandBuilder) {
        const metiers: { name: string, value: string }[] = [
            {name: "Mineur", value: JobEnum.MINEUR},
            {name: "Bûcheron", value: JobEnum.BUCHERON},
            {name: "Paysan", value: JobEnum.PAYSAN},
            {name: "Alchimiste", value: JobEnum.ALCHIMISTE}
        ]

        builder.addStringOption(
            option => option.setName("metier").setDescription("Métier de récolte").addChoices(
                ...metiers.map((metier: { name: string, value: string }) => ({
                    name: metier.name,
                    value: metier.value,
                }))
            )
        )
    }

    private async getPlayer(user: User): Promise<Player> {
        let player = await Player.findOne({
            where: {
                id: user.id
            }
        })

        if (player) {
            return player;
        }

        return await Player.create({id: user.id})
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
}

export default Recolte;