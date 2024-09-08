const { SlashCommandBuilder } = require('discord.js')
const { PermissionFlagsBits } = require('discord-api-types/v8')
const { autocompleteLore, executeLore } = require('../utils/Utils')
const PlayerItem = require('../database/PlayerItem')
const { Op, Sequelize } = require("sequelize");

module.exports = {
    opts: {},
    data: new SlashCommandBuilder()
        .setName('ladder')
        .setDescription('Affiche le ladder')
        .addStringOption(
            option => option
                .setName('type')
                .setDescription('Recherche par nom d\'objet')
                .setChoices(
                    {
                        name: 'Tofus',
                        value: 'tofu'
                    }, {
                        name: 'Larves',
                        value: 'larve'
                    }, {
                        name: 'Questions',
                        value: 'question'
                    }, {
                        name: 'Potions',
                        value: 'potion'
                    },
                    {
                        name: "Wabbits",
                        value: "wabbit"
                    },
                    {
                        name: "Kouinkouins",
                        value: "kouinkouin"
                    }
                )
        ),
    async execute (interaction) {
        const type = interaction.options.getString('type')

        const scores = await this.getTopScores(type)

        let text = "";
        scores.forEach((score, index) => {
            const pluriel = score.dataValues.total_quantity > 1 ? "s" : "";
            const typeObjects = type ?? "objet";
            text += `${index + 1}. <@${score.user_id}> : ${score.dataValues.total_quantity} ${typeObjects}${pluriel}\n`;
        })

        await interaction.reply({content: "**Top 3 !**\n" + text})
    },

    async getTopScores (type = null) {
        const whereClause = {};  // Initialiser un objet vide pour le where

        // Ajouter la condition sur le type si elle est fournie
        if (type) {
            whereClause.type = {
                [Op.eq]: type
            };
        }

        return await PlayerItem.findAll({
            attributes: [
                'user_id',   // Garder l'user_id dans la sélection
                [Sequelize.fn('SUM', Sequelize.col('quantity')), 'total_quantity']  // Calculer la somme de 'quantity'
            ],
            where: whereClause,  // Ajouter le where conditionnel
            group: ['user_id'],  // Groupement par user_id
            order: [[Sequelize.fn('SUM', Sequelize.col('quantity')), 'DESC']],  // Tri par somme décroissante
            limit: 3  // Récupérer uniquement le meilleur score
        });
    }
}