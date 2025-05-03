import AbstractSubCommand from "../../utils/AbstractSubCommand";
import {CommandInteraction, EmbedBuilder} from "discord.js";
import Job from "../../models/astrub_economy/Job";
import JobUtil from "./JobUtil";

class Profil extends AbstractSubCommand {
    description: string = 'Vos métiers';
    name: string = 'profil';

    async execute(interaction: CommandInteraction): Promise<void> {
        const jobs = await Job.findAll({
            where: {
                userId: interaction.user.id,
                guildId: interaction.guild?.id
            },
            order: [['experience', 'DESC']]
        })
        const header    = `| Nom        | Niveau | Expérience |   Progression   |`;
        const separator = `|------------|--------|------------|-----------------|`;
    
        const rows = jobs.map(job => {
            const { level} = JobUtil.getLevelAndRemainingXP(job.experience);

            const nextLevelXP = (level + 1) ** 2 * 10;
            const actualLevelXP = (level) ** 2 * 10;
            const currentLevelXP = job.experience - actualLevelXP;

            const progressPercentage = Math.floor((currentLevelXP / nextLevelXP) * 100);
            
            const emptyLength = Math.floor((100 - progressPercentage) / 10)
            const filledLength = 10 - emptyLength;

            const filled = filledLength > 0 ? '█'.repeat(filledLength) : '';
            const empty = emptyLength > 0 ? '░'.repeat(emptyLength) : '';
            const progressBar = filled + empty;
            
            const xpDisplayColumn = `${currentLevelXP}/${nextLevelXP}`;
            const lastCol = `${progressBar} ${progressPercentage} %`.padEnd(15)
            
            return `| ${job.name.padEnd(10)} | ${job.level.toString().padStart(6)} | ${xpDisplayColumn.padStart(10)} | ${lastCol} |`;
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