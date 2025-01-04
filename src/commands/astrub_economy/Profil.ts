import AbstractSubCommand from "../../utils/AbstractSubCommand";
import {CommandInteraction, EmbedBuilder} from "discord.js";
import Job from "../../models/Job";

class Profil extends AbstractSubCommand {
    description: string = 'Vos métiers';
    name: string = 'profil';

    async execute(interaction: CommandInteraction): Promise<void> {
        const jobs = await Job.findAll({
            where: {user_id: interaction.user.id},
            order: [['experience', 'DESC']]
        })
        const header    = `| Nom        | Niveau | Expérience |`;
        const separator = `|------------|--------|------------|`;

        const rows = jobs.map(job => {
            return `| ${job.name.padEnd(10)} | ${job.level.toString().padStart(6)} | ${job.experience.toString().padStart(10)} |`;
        })

        const table = `\`\`\`\n${header}\n${separator}\n${rows.join('\n')}\n\`\`\``

        const user = interaction.user;

        const guild = interaction.guild
        const memberCatch = await guild?.members.fetch(user.id)
        const userName = memberCatch?.nickname ?? user.globalName

        const embed = new EmbedBuilder()
            .setTitle(`Métiers de ${userName}`)
            .setColor("#0099ff")
            .setDescription(table)
            .setTimestamp()

        await interaction.reply({embeds: [embed]})
    }
}

export default Profil;