"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const builders_1 = require("@discordjs/builders");
const discord_js_1 = require("discord.js");
const axios_1 = __importDefault(require("axios"));
const v10_1 = require("discord-api-types/v10");
const sequelize_1 = require("sequelize");
const api_1 = require("../dofusdb/api");
const Capture = require('../models/Capture').default;
// 3 heyres
const timeBetweenCaptures = 60 * 60 * 1000 * 3;
const timeBetweenResetRoll = 60 * 60 * 1000 * 3;
const numberOfRolls = 5;
const subCommandRoll = new builders_1.SlashCommandSubcommandBuilder();
subCommandRoll.setName('roll').setDescription('Roll des monstres');
const subCommandCaptures = new builders_1.SlashCommandSubcommandBuilder();
subCommandCaptures.setName('captures').setDescription('Liste de vos captures');
const subCommandView = new builders_1.SlashCommandSubcommandBuilder();
subCommandView.setName('view').setDescription('Voir un monstre');
const subCommandTimer = new builders_1.SlashCommandSubcommandBuilder();
subCommandTimer.setName('timer').setDescription('Voir le temps restant pour roll ou capturer un monstre');
/**
 * Jeu basé sur mudae.
 * Roll des monstres
 * Capture
 * Inventaire
 */
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('osatopia')
        .setDescription('Jeu de capture de monstres')
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .addSubcommand(subCommandRoll)
        .addSubcommand(subCommandCaptures)
        .addSubcommand(subCommandView)
        .addSubcommand(subCommandTimer),
    async execute(interaction) {
        if (!interaction.isCommand() || !(interaction.options instanceof discord_js_1.CommandInteractionOptionResolver)) {
            return;
        }
        // Vérifier que l'interaction contient des sous-commandes avant d'essayer de les récupérer
        const command = interaction.options.getSubcommand();
        switch (command) {
            case subCommandRoll.name:
                await this.roll(interaction);
                break;
            case subCommandCaptures.name:
                this.captures(interaction);
                break;
            case subCommandView.name:
                await this.view(interaction);
                break;
            case subCommandTimer.name:
                await this.timer(interaction);
                break;
            default:
                break;
        }
    },
    async roll(interaction) {
        // On vérifie que le user n'a pas déjà roll 3 fois depuis 3 heures
        const conditions = {
            createdAt: {
                [sequelize_1.Op.gte]: new Date(Date.now() - timeBetweenResetRoll)
            }, rollUserId: interaction.user.id
        };
        const captures = await Capture.findAll({ where: conditions });
        if (captures.length >= numberOfRolls) {
            try {
                await interaction.reply({ content: `Vous avez déjà fait vos rolls`, ephemeral: true });
            }
            catch (error) {
                console.error(error);
            }
            return;
        }
        let conditionRequest = '&isBoss=false&isMiniBoss=false';
        // Nombre aléatoire entre 1 et 200
        const randomChanceBoss = Math.floor(Math.random() * 100) + 1;
        // Si c'est 1, on prend un boss
        if ([1, 2].includes(randomChanceBoss)) {
            conditionRequest = '&isBoss=true&isMiniBoss=false';
        }
        // Si c'est 2, on prend un mini boss
        if ([6, 7].includes(randomChanceBoss)) {
            conditionRequest = '&isBoss=false&isMiniBoss=true';
        }
        //  interaction.channel.send({ content: `Roll ${randomChanceBoss}` })
        console.log(`Roll boss chances: ${randomChanceBoss}`);
        // Requête DofusDB via Axios
        const conditionTotal = `?$skip=0&$limit=1${conditionRequest}`;
        const monstersTotalRequest = await (0, api_1.fetchMonsters)(conditionTotal);
        const total = monstersTotalRequest.total;
        const random = Math.floor(Math.random() * total) + 1;
        const conditionMonster = `?$skip=${random}&$limit=1${conditionRequest}`;
        const monstersRequest = await (0, api_1.fetchMonsters)(conditionMonster);
        const monster = monstersRequest.data[0];
        const id = monster.id;
        const name = monster.name.fr;
        const look = monster.look;
        const hexa = Buffer.from(look).toString('hex');
        const img = `https://renderer.dofusdb.fr/look/${hexa}/full/1/150_150.png`;
        const timestamp = Date.now();
        // check si déjà capturé (catchUserId != null)
        const conditionsCheckCapture = { monsterId: id, catchUserId: { [sequelize_1.Op.ne]: null } };
        const captureCheck = await Capture.findOne({ where: conditionsCheckCapture });
        const capture = { monsterId: id, date: new Date(), monsterName: name, rollUserId: interaction.user.id };
        const captureDB = await Capture.create(capture);
        if (captureCheck) {
            const guild = interaction.guild; // ou client.guilds.cache.get('GUILD_ID');
            const memberCatch = await guild?.members.fetch(captureCheck.catchUserId);
            const userCatch = await interaction.client.users.fetch(captureCheck.catchUserId);
            const userName = memberCatch?.nickname ?? userCatch.globalName;
            const description = `Capturé par ${userName}`;
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle(`${name}`)
                .setDescription(description)
                .setImage(img); // Ajouter l'image
            try {
                await interaction.reply({ embeds: [embed] });
            }
            catch (error) {
                console.error(error);
            }
        }
        else {
            const row = new discord_js_1.ActionRowBuilder()
                .addComponents(new discord_js_1.ButtonBuilder()
                .setLabel('Capture')
                .setCustomId(`osatopia-capture-${captureDB.id}-${timestamp}`)
                .setStyle(v10_1.ButtonStyle.Success));
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle(`${name}`)
                .setImage(img); // Ajouter l'image
            try {
                // JSON
                await interaction.reply({ embeds: [embed], components: [row] });
            }
            catch (error) {
                console.error(error);
            }
        }
    },
    async view(interaction) {
        if (!interaction.isCommand() || !(interaction.options instanceof discord_js_1.CommandInteractionOptionResolver)) {
            return;
        }
        const id = interaction.options.getInteger('id');
        const capture = await Capture.findOne({ where: { id: id } });
        if (!capture) {
            try {
                await interaction.reply({ content: 'Cette capture n\'existe pas !', ephemeral: true });
            }
            catch (error) {
                console.error(error);
            }
            return;
        }
        const name = capture.monsterName;
        const monsterId = capture.monsterId;
        // Request DofusDB
        const monsterRequest = await axios_1.default.get(`https://api.dofusdb.fr/monsters/${monsterId}`);
        const monster = monsterRequest.data;
        const look = monster.look;
        const hexa = Buffer.from(look).toString('hex');
        const img = `https://renderer.dofusdb.fr/look/${hexa}/full/1/150_150.png`;
        const dateFr = capture.catchDate.toLocaleDateString('fr-FR', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle(`${name}`)
            .setDescription(`Capturé le ${dateFr}`)
            .setImage(img);
        await interaction.reply({ embeds: [embed] });
    },
    captures(interaction) {
        const user = interaction.user;
        Capture.findAll({
            where: { catchUserId: user.id }, order: [['monsterName', 'DESC']]
        }).then(async (captures) => {
            if (captures.length === 0) {
                await interaction.reply('Vous n\'avez pas capturé de monstres !');
                return;
            }
            let capturesArray = [];
            for (const capture of captures) {
                const date = capture.catchDate;
                // dd/mm/YY
                const dateString = date.toLocaleDateString('fr-FR', {
                    day: '2-digit', month: '2-digit', year: 'numeric'
                });
                capturesArray.push(`${dateString} - ${capture.monsterName}`);
            }
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle('Vos captures');
            await interaction.reply({ embeds: [embed.setDescription(capturesArray.join('\n'))] });
        }).catch(function (error) {
            console.error(error);
        });
    },
    async timer(interaction) {
        const user = interaction.user;
        const timestamp = Date.now();
        // On récupère la dernière capture du user
        const lastCapture = await Capture.findOne({ where: { catchUserId: user.id }, order: [['catchDate', 'DESC']] });
        let timeBeforeCapture = 0;
        if (lastCapture) {
            timeBeforeCapture = timeBetweenCaptures - (timestamp - lastCapture.catchDate);
        }
        let catchMonsterString = '';
        if (timeBeforeCapture > 1) {
            const heures = Math.floor(timeBeforeCapture / 3600000);
            const minutes = Math.floor((timeBeforeCapture % 3600000) / 60000);
            const seconds = Math.floor((timeBeforeCapture % 60000) / 1000);
            const pluralH = heures <= 1 ? '' : 's';
            const pluralM = minutes <= 1 ? '' : 's';
            const pluralS = seconds <= 1 ? '' : 's';
            catchMonsterString = `Vous pourrez capturer un monstre dans ${heures} heure${pluralH}, ${minutes} minute${pluralM} et ${seconds} seconde${pluralS} !`;
        }
        else {
            catchMonsterString = 'Vous pouvez capturer un monstre !';
        }
        const conditionsLastRoll = {
            where: {
                rollUserId: user.id, createdAt: {
                    [sequelize_1.Op.gte]: new Date(Date.now() - timeBetweenResetRoll) // Filtrer les rolls créés il y a moins de 3 heures
                }
            }, order: [['createdAt', 'ASC']]
        };
        const lastRolls = await Capture.findAll(conditionsLastRoll);
        let timeBeforeRoll = 0;
        if (lastRolls.length >= numberOfRolls) {
            const firstLastRoll = lastRolls[0];
            timeBeforeRoll = timeBetweenResetRoll - (timestamp - firstLastRoll.createdAt);
        }
        let rollMonsterString = '';
        if (timeBeforeRoll > 1) {
            const heures = Math.floor(timeBeforeRoll / 3600000);
            const minutes = Math.floor((timeBeforeRoll % 3600000) / 60000);
            const seconds = Math.floor((timeBeforeRoll % 60000) / 1000);
            const pluralH = heures <= 1 ? '' : 's';
            const pluralM = minutes <= 1 ? '' : 's';
            const pluralS = seconds <= 1 ? '' : 's';
            rollMonsterString = `Vous pourrez roll un monstre dans ${heures} heure${pluralH}, ${minutes} minute${pluralM} et ${seconds} seconde${pluralS} !`;
        }
        else {
            rollMonsterString = 'Vous pouvez roll un monstre !';
        }
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle('Timer')
            .setDescription(`${catchMonsterString}\n${rollMonsterString}`);
        await interaction.reply({ embeds: [embed] });
    },
    async executeButton(interaction) {
        const id = interaction.customId.split('-')[2];
        const user = interaction.user;
        const capture = await Capture.findOne({ where: { id: id } });
        if (!capture) {
            await interaction.reply({ content: 'Cette capture n\'existe pas !', ephemeral: true });
            return;
        }
        // On vérifie que la capture n'est pas déjà prise
        if (capture.catchUserId) {
            await interaction.reply({ content: 'Cette capture a déjà été prise !', ephemeral: true });
            return;
        }
        const myDate = new Date();
        // On vérifie que la capture n'est pas trop vieille
        if (myDate.getTime() - capture.createdAt > 60 * 60 * 1000) {
            await interaction.reply({ content: 'Cette capture est trop vieille !', ephemeral: true });
        }
        // On vérifie que le user n'a pas déjà roll il y a moins de 3h
        const conditions = {
            catchDate: {
                [sequelize_1.Op.gte]: new Date(Date.now() - timeBetweenCaptures)
            }, catchUserId: user.id
        };
        const captures = await Capture.findAll({ where: conditions });
        if (captures.length > 0) {
            await interaction.reply({ content: 'Vous avez capturé un monstre il y a moins de 3h !', ephemeral: true });
            return;
        }
        // On vérifie que le user n'a pas déjà le monstre
        const conditions2 = { catchUserId: user.id, monsterId: capture.monsterId };
        const captures2 = await Capture.findAll({ where: conditions2 });
        if (captures2.length > 0) {
            await interaction.reply({ content: 'Vous avez deja capturé ce monstre !', ephemeral: true });
            return;
        }
        const name = capture.monsterName;
        await Capture.update({ catchUserId: user.id, catchDate: new Date() }, { where: { id: id } });
        const guild = interaction.guild;
        const memberCatch = await guild?.members.fetch(user.id);
        const userName = memberCatch?.nickname ?? user.globalName;
        await interaction.reply(`${userName} a capturé ${name} !`);
    },
    async autocomplete(interaction) {
        const user = interaction.user;
        const captures = await Capture.findAll({ where: { catchUserId: user.id }, order: [['monsterName', 'DESC']] });
        const retours = [];
        for (const capture of captures) {
            retours.push({
                name: capture.monsterName, value: capture.id
            });
        }
        await interaction.respond(retours);
    }
};
