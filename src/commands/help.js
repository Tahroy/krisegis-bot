const { SlashCommandBuilder } = require('discord.js')
const embedData = require('../utils/embed')
const Constantes = require("../utils/Constantes");
module.exports = {
    allowedGuildIds: Constantes.allowedGuildIds,
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('L\'aide pour utiliser le bot')
    ,
    async execute (interaction) {
        const client = interaction.client;

        let lines = [];

        for (const [key, value] of client.commands) {
            const permission = value.data.default_member_permissions;
            let permInfo = '';
            if (permission) {
                permInfo = " (Admin)"

                const DMPermission = value.data.dm_permission;
                if (DMPermission) {
                    permInfo = " (MP)"
                }
            }
            lines.push(`* **${key}** : ${value.data.description} ${permInfo}`);
        }

        let embed = embedData.createEmbed([], {
            title: `**Voici mes commandes**`,
            description: lines.join('\n'),
        })

        await interaction.reply({ embeds: embed.embeds, files: embed.files })
    },
}