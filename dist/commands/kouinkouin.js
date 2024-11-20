"use strict";
// Nous importons les classes SlashCommandBuilder, ActionRowBuilder et ButtonBuilder de 'discord.js'
// ainsi que ButtonStyle de 'discord-api-types/v8'.
const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { ButtonStyle } = require('discord-api-types/v8');
const { readdirSync } = require('node:fs');
const { join, extname } = require('node:path');
const { addPlayerItem } = require('../utils/Utils');
// Nous déclarons un tableau vide 'games'.
let games = [];
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
 * À la fin du timer, un bouton apparaît avec écrit "Tirer !"
 * Le joueur a 1.2 secondes pour cliquer dessus, sinon il perd !
 * Selon le résultat, on envoie "Bravo !" ou "Perdu !"
 *
 * Lorsque quelqu'un clique sur "Tirer !" à temps, il est celui qui capture le kouinkouin.
 * Il gagne donc le kouinkouin dans son inventaire
 */
module.exports = {
    // Définition de la commande slash avec son nom et sa description
    data: new SlashCommandBuilder()
        .setName('kouinkouin')
        .setDescription('Permet de pêcher un kouinkouin')
        .setDMPermission(false),
    // Fonction d'exécution quand la commande est déclenchée
    async execute(interaction) {
        // On définit le serveur et l'utilisateur à partir de l'interaction
        const serverID = interaction.guild.id;
        const userID = interaction.member.user.id;
        const key = serverID + '-' + userID;
        // On vérifie si une partie est déjà en cours
        if (games[key]) {
            return interaction.reply('Une partie est déjà en cours !');
        }
        // Sinon on lance une nouvelle partie
        // On prend un kouinkouin dans la liste
        const images = readdirSync(join('assets', 'kouinkouins'))
            .filter(file => ['.jpg', '.png'].includes(extname(file)));
        const randomImg = images[Math.floor(Math.random() * images.length)];
        const imgPath = join('assets', 'kouinkouins', randomImg);
        // On stocke l'ID du kouinkouin dans le jeu
        games[key] = parseInt(randomImg.split('_')[1].replace('.png', ''));
        await interaction.reply('La partie débute !');
        let timer = Math.floor(Math.random() * (10 - 3 + 1)) + 3;
        let countdown = setInterval(function () {
            if (timer === 0) {
                // Si le timer est écoulé, on stoppe le décompte et on affiche le bouton
                clearInterval(countdown);
                let row = new ActionRowBuilder()
                    .addComponents(new ButtonBuilder()
                    .setStyle(ButtonStyle.Success)
                    .setLabel('Attraper !')
                    .setCustomId('kouinkouin-catch_' + userID));
                const userName = interaction.member.nickname ?? interaction.member.user.globalName;
                interaction.followUp({
                    content: `Le kouinkouin de ${userName} apparaît !`,
                    components: [row]
                });
                setTimeout(function () {
                    // Après 2 secondes, on annonce le résultat de la partie
                    if (games[key] === 'won') {
                        interaction.followUp({
                            content: 'Bravo !',
                            files: [{
                                    attachment: imgPath,
                                    name: randomImg
                                }]
                        });
                    }
                    else {
                        interaction.followUp({ content: 'Perdu !' });
                    }
                    delete games[key];
                }, 1200);
            }
            else {
                // Sinon on continue de décrémenter le timer
                timer--;
                interaction.followUp({
                    content: '...',
                    ephemeral: true
                });
            }
        }, 1000);
    },
    // Fonction exécutée lors du clic sur le bouton
    async executeButton(interaction, buttonName) {
        const action = buttonName.split('_')[0];
        const userID = buttonName.split('_')[1];
        // On vérifie que la personne qui clique est bien celle qui a lancé la partie
        /*
        if (userID !== interactionUserID) {
            return interaction.reply({
                content: 'Ceci n\'est pas votre kouinkouin !',
                ephemeral: true
            })
        }
        */
        const key = interaction.guild.id + '-' + interaction.member.user.id;
        // Si l'action est de 'catchkouinkouin', on marque la partie comme gagnée
        if (action === 'catch') {
            if (!games[key]) {
                return interaction.reply({
                    content: 'Aucune partie en cours pour vous !',
                    ephemeral: true
                });
            }
            if (Number.isInteger(games[interaction.guild.id + '-' + interaction.member.user.id])) {
                const key = interaction.guild.id + '-' + interaction.member.user.id;
                const kouinkouinID = games[key];
                games[key] = 'won';
                // Celui qui attrape le kouinkouin
                const catcher = interaction.member;
                const catcherName = catcher.nickname ?? catcher.user.globalName;
                // Celui qui a lancé la ligne
                if (userID === catcher.user.id) {
                    interaction.reply(`${catcherName} a attrapé son kouinkouin !`);
                }
                else {
                    interaction.reply(`${catcherName} a volé le kouinkouin !`);
                }
                const KOUINKOUINS = {
                    1: "Gros kouinkouin",
                    2: "Kouinkouin rétro",
                    3: "Kouinkouin de bain de Nagate",
                    4: "Faux kouinkouin",
                    5: "Kouinkouin fantôme",
                    6: "Kouinkouin noir",
                    7: "Kouinkouin"
                };
                await addPlayerItem(catcher.user, KOUINKOUINS[kouinkouinID], "kouinkouin");
            }
            else {
                interaction.reply('Raté !');
            }
            // on supprime l'interaction
        }
    }
};
