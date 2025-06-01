import AbstractSubCommand from "../../utils/AbstractSubCommand";
import {CommandInteraction, EmbedBuilder, Guild} from "discord.js";
import JobUtil from "./JobUtil";

class Status extends AbstractSubCommand {
    description: string = "Statut d'Astrub";
    name: string = "status";

    async execute(interaction: CommandInteraction): Promise<void> {
        const guild: Guild|null = interaction.guild;
        const buildingsGuild = await JobUtil.getBuildingsGuild(guild);

        if(!buildingsGuild || buildingsGuild.length === 0) {
            await interaction.reply({
                content: "Aucun bâtiment construit..."
            })
            return;
        }

        const header    = `| Nom        | Description                             |`;
        const separator = `|------------|-----------------------------------------|`;

        const rows = buildingsGuild.map(buildingName => {
            const building = JobUtil.getBuilding(buildingName);
            if (!building) return '';

            const shortDescription = building.shortDescription.length > 39
                ? building.shortDescription.substring(0, 36) + '...'
                : building.shortDescription.padEnd(39);

            return `| ${building.name.padEnd(10)} | ${shortDescription} |`;
        }).filter(row => row !== '');

        const table = `\`\`\`\n${header}\n${separator}\n${rows.join('\n')}\n\`\`\``

        const embed = new EmbedBuilder()
            .setTitle(`Bâtiments construits à Astrub`)
            .setColor("#0099ff")
            .setDescription(table)
            .setTimestamp()

        await interaction.reply({embeds: [embed]})


    }
}

export default Status;