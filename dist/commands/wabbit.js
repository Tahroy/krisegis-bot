"use strict";
const { SlashCommandBuilder } = require('@discordjs/builders');
const { ButtonBuilder, ActionRowBuilder } = require('discord.js');
const { ButtonStyle } = require('discord-api-types/v8');
const fs = require('fs');
const path = require('path');
const { addPlayerItem } = require('../utils/Utils');
const WABBITS_NAMES = {
    1: 'Wabbit',
    2: 'Black Wabbit',
    3: 'Tiwabbit',
    4: 'Tiwabbit Kiafin',
    5: 'Wabbit GM',
    6: 'Wabbit Vampire',
    7: 'Wabbit Fluo',
    8: 'Wabbit Garou',
    9: 'Black Wabbit Squelette',
    10: 'Tchô Wabbit',
    11: 'Esclave Wabbit',
    12: 'Black Tiwabbit',
    13: 'Tiwabbit',
    14: 'Wo Wabbit',
    15: 'Grand Pa Wabbit',
    16: 'Gawde Wabbit',
    17: 'Wa Wabbit',
    18: 'Black tiwabbitus',
    19: 'Gawdien Wabbit',
    20: 'Peluche Wabbit',
    21: 'Blanc Pa Wabbit',
    22: 'Black Wo Wabbit',
    23: 'Wabbit en wetawd',
    24: 'Wabbit Céphale',
    "malma": "Malma-Jeste",
};
let usersByChannel = {};
module.exports = {
    data: new SlashCommandBuilder()
        .setName('wabbit')
        .setDescription('Commence une partie de tape-wabbit')
        .addIntegerOption(option => option
        .setName('nombre')
        .setDescription('Nombre de wabbits')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(15))
        .setDMPermission(false),
    async execute(interaction) {
        const channelId = interaction.channel.id;
        if (usersByChannel[channelId]) {
            return interaction.reply('Une partie est déjà en cours dans ce salon.');
        }
        usersByChannel[channelId] = {
            users: {},
            nbWabbits: 0,
            nbCatched: 0,
            randomID: 0,
            image: '',
            maxWabbits: interaction.options.getInteger('nombre')
        };
        const MIN_TIME = 2500;
        const MAX_TIME = 3000;
        // Génération de wabbits à intervalles aléatoires
        const generateWabbits = () => {
            const randomDelay = Math.floor(Math.random() * MIN_TIME) + MAX_TIME; // Délai entre 2 et 10 secondes
            setTimeout(() => {
                if (usersByChannel[channelId].nbWabbits < usersByChannel[channelId].maxWabbits) {
                    console.log('On attend ' + (randomDelay) / 1000 + ' secondes');
                    usersByChannel[channelId].nbWabbits++;
                    this.generateWabbit(interaction.channel);
                    generateWabbits(); // Appel récursif pour le prochain wabbit
                }
                else {
                    this.endGame(interaction.channel);
                }
            }, randomDelay);
        };
        // Démarrez la première génération de wabbits
        generateWabbits();
        return interaction.reply('La partie a commencé !');
    },
    async executeButton(interaction, buttonName) {
        const user = interaction.user;
        const userName = interaction.member.nickname ?? user.username;
        const buttonType = buttonName.split('_')[0];
        const uniqueID = parseInt(buttonName.split('_')[1]);
        const channelData = usersByChannel[interaction.channel.id];
        if (uniqueID === channelData.randomID) {
            // On récupère les scores du channel
            // Si l'utilisateur n'y est pas (id), on l'ajoute
            // On ajoute ensuite 1 point.
            if (!channelData.users[user.id]) {
                channelData.users[user.id] = {
                    score: 0,
                    username: userName,
                };
            }
            // Si c'est Malma, on perd un point.
            if (channelData.image === 'malma') {
                channelData.users[user.id].score--;
                return interaction.reply(`${userName} s'est approché de Malma ! Il perd un point, ça pique...`);
            }
            if (buttonType !== 'hit') {
                return interaction.reply({
                    content: `Mais, tu viens de lui faire un ${buttonType} là ?`,
                    ephemeral: true
                });
            }
            // On vide le randomID
            channelData.randomID = 0;
            channelData.users[user.id].score++;
            channelData.nbCatched++;
            const userScore = channelData.users[user.id].score;
            const plural = userScore > 1 ? 's' : '';
            const wabbitName = WABBITS_NAMES[channelData.image];
            addPlayerItem(user, wabbitName, "wabbit");
            return interaction.reply(`${userName} a capturé un ${wabbitName} ! Il a maintenant ${userScore} point${plural}`);
        }
        // Si le randomID est à 0, le wabbit a déjà été attrapé
        if (channelData.randomID === 0) {
            return interaction.reply({
                content: 'Ce wabbit a déjà été attrapé !',
                ephemeral: true
            });
        }
        // Sinon simplement trop tard !
        return interaction.reply({
            content: 'Trop tard !',
            ephemeral: true
        });
    },
    async generateWabbit(channel) {
        const wabbitFolder = path.join(__dirname, '..', '..', 'assets', 'wabbits');
        // Lire les fichiers du dossier wabbit
        const wabbitFiles = fs.readdirSync(wabbitFolder);
        // Choisir aléatoirement un fichier parmi la liste
        const randomFileName = wabbitFiles[Math.floor(Math.random() * wabbitFiles.length)];
        // Je ne veux pas l'extension
        const fileName = randomFileName.split('.')[0];
        // Construire le chemin complet du fichier
        const imagePath = path.join(wabbitFolder, randomFileName);
        const randomID = Math.floor(Math.random() * 1000);
        usersByChannel[channel.id].randomID = randomID;
        usersByChannel[channel.id].image = fileName;
        /*
         * Ajouter :
         * - Patawaii : - 4 points
         * - Krisegis : - 1 point
         * - Crâ bot  : + 2 points
         *
         * Ajouter image
         */
        let buttonHit = new ActionRowBuilder().addComponents(new ButtonBuilder()
            .setCustomId(`wabbit-hit_${randomID}`)
            .setEmoji('⛔')
            .setLabel('TAPER')
            .setStyle(ButtonStyle.Danger), new ButtonBuilder()
            .setCustomId(`wabbit-bisou_${randomID}`)
            .setEmoji('⛔')
            .setLabel('BISOU')
            .setStyle(ButtonStyle.Danger), new ButtonBuilder()
            .setCustomId(`wabbit-câlin_${randomID}`)
            .setEmoji('⛔')
            .setLabel('CÂLIN')
            .setStyle(ButtonStyle.Danger));
        buttonHit.components.sort(() => Math.random() - 0.5);
        const wabbitName = WABBITS_NAMES[fileName];
        let content = `Un ${wabbitName} est arrivé !`;
        if (wabbitName === 'Malma-Jeste') {
            content = 'Malma-Jeste est arrivée !';
        }
        const message = await channel.send({
            content: content,
            components: [buttonHit],
            files: [imagePath], // Attache le fichier (l'image) au message
        });
        // Supprimer le message après 5 secondes
        setTimeout(() => {
            if (!message.deleted) {
                message.delete().catch(error => console.error('Erreur lors de la suppression du message :', error));
            }
        }, 5000);
    },
    async endGame(channel) {
        let ladder = usersByChannel[channel.id].users;
        let sorted = Object.entries(ladder).sort((a, b) => b[1].score - a[1].score);
        let ladderMessage = '';
        for (let i = 0; i < sorted.length; i++) {
            ladderMessage += `${i + 1}. ${sorted[i][1].username} : ${sorted[i][1].score} point${sorted[i][1].score > 1 ? 's' : ''}\n`;
        }
        delete usersByChannel[channel.id];
        return channel.send("**Classement**\n" + ladderMessage);
    },
};
