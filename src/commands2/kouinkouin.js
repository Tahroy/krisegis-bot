// Nous importons les classes SlashCommandBuilder, ActionRowBuilder et ButtonBuilder de 'discord.js'
// ainsi que ButtonStyle de 'discord-api-types/v8'.
const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js')
const { ButtonStyle } = require('discord-api-types/v8')
const { readdirSync } = require('node:fs')
const { join, extname } = require('node:path')

// Nous déclarons un tableau vide 'games'.
let games = []

/**
 * Un joueur peut demander une partie de pêche au kouinkouin.
 * S'il a déjà une partie en cours, la demande est refusée !
 *
 * Sinon, on indique au joueur qu'une partie est en cours.
 *
 * Un timer est alors défini entre 3 et 10 secondes.
 * Un message contenant "..." est envoyé.
 * Ce message est répété chaque seconde.
 *
 * À la fin du timer, une image de kouinkouin est envoyée avec un bouton "Tirer!".
 * Le joueur a 2 secondes pour cliquer dessus, sinon il perd!
 * Nous supprimons ensuite l'image du kouinkouin et envoyons un message "Bravo!" ou "Perdu!".
 *
 * NOTE : L'implémentation suivante n'inclut pas l'image du kouinkouin, car elle doit être servie depuis un certain emplacement.
 * Veuillez remplacer 'imageName' par le chemin réel de l'image.
 */
module.exports = {
    // Définition de la commande slash avec son nom et sa description
    data: new SlashCommandBuilder()
        .setName('kouinkouin')
        .setDescription('Permet de pêcher un kouinkouin'),

    // Fonction d'exécution quand la commande est déclenchée
    async execute (interaction) {
        // On définit le serveur et l'utilisateur à partir de l'interaction
        const serverID = interaction.guild.id
        const userID = interaction.member.user.id
        const key = serverID + '-' + userID

        // On vérifie si une partie est déjà en cours
        if (games[key]) {
            return interaction.reply('Une partie est déjà en cours !')
        }

        // Sinon on lance une nouvelle partie
        games[key] = true
        await interaction.reply('Une partie est en cours...')

        let timer = Math.floor(Math.random() * (10 - 3 + 1)) + 3

        let countdown = setInterval(function () {
            if (timer === 0) {
                // Si le timer est écoulé, on stoppe le décompte et on affiche le bouton
                clearInterval(countdown)

                let row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setStyle(ButtonStyle.Success)
                            .setLabel('Attraper !')
                            .setCustomId('kouinkouin-catch_' + userID)
                    )

                interaction.followUp({
                    content: 'kouinkouin apparaît !',
                    components: [row]
                })

                setTimeout(function () {
                    const images = readdirSync(join('assets', 'kouinkouins'))
                        .filter(file => ['.jpg', '.png'].includes(extname(file)))
                    const randomImg = images[Math.floor(Math.random() * images.length)]
                    const imgPath = join('assets', 'kouinkouins', randomImg)

                    // Après 2 secondes, on annonce le résultat de la partie
                    if (games[key] === 'won') {
                        interaction.followUp({
                            content: 'Bravo !',
                            files: [{
                                attachment: imgPath,
                                name: randomImg
                            }]
                        })
                    }
                    else {
                        interaction.followUp({ content: 'Perdu !' })
                    }


                    delete games[key]

                }, 1200)

            } else {
                // Sinon on continue de décrémenter le timer
                timer--
                interaction.followUp('...')
            }
        }, 1000)
    },

    // Fonction exécutée lors du clic sur le bouton
    async executeButton (interaction, buttonName) {
        const action = buttonName.split('_')[0]
        const userID = parseInt(buttonName.split('_')[1])

        const interactionUserID = parseInt(interaction.member.user.id)

        // On vérifie que la personne qui clique est bien celle qui a lancé la partie

        if (userID !== interactionUserID) {
            return interaction.reply({
                content: 'Ceci n\'est pas votre kouinkouin !',
                ephemeral: true
            })
        }

        const key = interaction.guild.id + '-' + interaction.member.user.id

        // Si l'action est de 'catchkouinkouin', on marque la partie comme gagnée
        if (action === 'catch') {
            if (!games[key]) {
                return interaction.reply('Aucune partie n\'est en cours !')
            }

            if (games[interaction.guild.id + '-' + interaction.member.user.id] === true) {
                const key = interaction.guild.id + '-' + interaction.member.user.id
                games[key] = 'won'
                interaction.reply('Le kouinkouin a été capturé !')
            }
            else {
                interaction.reply('Raté !')
            }

            // on supprime l'interaction
        }

    }
}