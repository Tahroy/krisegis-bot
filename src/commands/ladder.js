const { SlashCommandBuilder } = require('discord.js')
const PlayerItem = require('../models/PlayerItem').default
const { Op, Sequelize } = require('sequelize')
const Capture = require('../models/Capture').default

module.exports = {
    opts: {}, data: new SlashCommandBuilder()
        .setName('ladder')
        .setDescription('Affiche le ladder')
        .addStringOption(option => option
            .setName('type')
            .setDescription('Recherche par nom d\'objet')
            .setChoices({
                            name: 'Larves', value: 'larve'
                        }, {
                            name: 'Quizz', value: 'question'
                        }, {
                            name: 'Potions', value: 'potion'
                        }, {
                            name: 'Wabbits', value: 'wabbit'
                        }, {
                            name: 'Kouinkouins', value: 'kouinkouin'
                        }, {
                            name: 'Monstres', value: 'monstre'
                        })),

    async execute (interaction) {
        const type = interaction.options.getString('type')

        const scores = await this.getTopScores(type)

        let text = ''
        for (const score of scores) {
            const index = scores.indexOf(score)
            const pluriel = score.dataValues.total_quantity > 1 ? 's' : ''
            const typeObjects = type ?? 'objet'

            let userName = ''

            try {
                let user = await interaction.guild.members.fetch(score.user_id ?? score.catchUserId)
                userName = user.displayName
            } catch (error) {
                userName = 'Anonymous'
            }

            text += `${index + 1}. ${userName} : ${score.dataValues.total_quantity} ${typeObjects}${pluriel}\n`
        }

        await interaction.reply({ content: '**Top 3 !**\n' + text })
    },

    async getTopScores (type = null) {

        if (type === 'monstre') {
            return await Capture.findAll({
                                             attributes: ['catchUserId', [Sequelize.fn('count', Sequelize.col('id')), 'total_quantity']],
                                             where: { catchUserId: { [Op.ne]: null } },
                                             group: ['catchUserId'],
                                             order: [[Sequelize.fn('count', Sequelize.col('id')), 'DESC']],
                                             limit: 3
                                         })

        }

        const whereClause = {}  // Initialiser un objet vide pour le where

        // Ajouter la condition sur le type si elle est fournie
        if (type) {
            whereClause.type = {
                [Op.eq]: type
            }
        }

        return await PlayerItem.findAll({
                                            attributes: ['user_id',   // Garder l'user_id dans la sélection
                                                [Sequelize.fn('SUM', Sequelize.col('quantity')), 'total_quantity']  // Calculer la somme de 'quantity'
                                            ], where: whereClause,  // Ajouter le where conditionnel
                                            group: ['user_id'],  // Groupement par user_id
                                            order: [[Sequelize.fn('SUM', Sequelize.col('quantity')), 'DESC']],  // Tri par somme décroissante
                                            limit: 3  // Récupérer uniquement le meilleur score
                                        })
    }
}