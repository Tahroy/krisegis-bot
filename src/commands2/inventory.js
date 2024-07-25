const { SlashCommandBuilder } = require('discord.js')
const embedData = require('../utils/embed')
const PlayerItem = require('../database/PlayerItem')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('inventory')
        .setDescription('Permet de consulter son inventaire')
    ,
    async execute (interaction) {
        const user = interaction.user
        const member = interaction.member
        const memberName = member.nickname ?? user.globalName

        const playerItems = await PlayerItem.findAll({
            where: {
                user_id: user.id
            },
            order: [['name', 'ASC']]
        })

        if (playerItems.length === 0) {
            await interaction.reply('Votre inventaire est vide')
            return
        }

        let items = [];
        for (const playerItem of playerItems) {
            items.push(`${playerItem.get('quantity') } x ${playerItem.get('name')}`)
        }

        const embed = embedData.createEmbed([], {
            title: `Inventaire de ${memberName}`,
            description: items.join('\n')
        })

        await interaction.reply({ embeds: embed.embeds, files: embed.files })
    },
}