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

        const header    = `| Nom           | Description                                       |`;
        const separator = `|---------------|---------------------------------------------------|`;

        const rows = buildingsGuild.map(buildingName => {
            const building = JobUtil.getBuilding(buildingName);
            if (!building) return '';

            // Limiter la description à une longueur raisonnable pour le tableau
            const shortDescription = building.description.length > 45 
                ? building.description.substring(0, 42) + '...' 
                : building.description.padEnd(45);

            return `| ${building.name.padEnd(13)} | ${shortDescription} |`;
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