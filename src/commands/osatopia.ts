import {SlashCommandSubcommandBuilder} from '@discordjs/builders'
import {
    ActionRowBuilder,
    AutocompleteInteraction,
    ButtonBuilder,
    ButtonInteraction,
    CacheType,
    CommandInteraction,
    CommandInteractionOption,
    CommandInteractionOptionResolver,
    EmbedBuilder,
    InteractionContextType,
    MessageFlags,
    SlashCommandBuilder,
    User
} from 'discord.js'
import {ButtonStyle} from 'discord-api-types/v10'
import {Op} from 'sequelize'
import {MonsterAPIResponse} from "../dofusdb/types/monster";
import {fetchMonsters, fetchNpcs} from "../dofusdb/api";
import {join} from "path";
import {PicturesManager} from "../utils/PicturesManager";
import sequelize from '../utils/database';
import CaptureTrade from "../models/CaptureTrade";
import {CommandCooldownError} from "../exceptions/CommandCooldownError";
import Monster from "../models/Monster";
import embedData from "../utils/embed";
import {NpcAPIResponse} from "../dofusdb/types/npc";
import Npc from "../models/Npc";

const Capture = require('../models/Capture').default

// 3 heyres
const timeBetweenCaptures = 60 * 60 * 1000 * 3
const timeBetweenResetRoll = 60 * 60 * 1000 * 3
const numberOfRolls = 5

const cooldowns = new Map<string, number>(); // Gérer les timestamps par utilisateur et commande

const subCommandRoll = new SlashCommandSubcommandBuilder();
subCommandRoll.setName('roll').setDescription('Roll des monstres');

const subCommandCaptures = new SlashCommandSubcommandBuilder();
subCommandCaptures.setName('captures').setDescription('Liste de vos captures');

const subCommandView = new SlashCommandSubcommandBuilder();
subCommandView.setName('view').setDescription('Voir un monstre').addIntegerOption(
    option => option.setName('id').setDescription('Monstre').setAutocomplete(true));

const subCommandTimer = new SlashCommandSubcommandBuilder();
subCommandTimer.setName('timer').setDescription('Voir le temps restant pour roll ou capturer un monstre');

const subCommandTrade = new SlashCommandSubcommandBuilder();
subCommandTrade.setName('trade').setDescription('Proposer un échange')
    .addUserOption(option => option.setName('user').setDescription('Utilisateur').setRequired(true))
    .addIntegerOption(
        option => option.setName('monster1').setDescription('Mon monstre').setRequired(true).setAutocomplete(true))
    .addIntegerOption(
        option => option.setName('monster2').setDescription('Son monstre').setRequired(true).setAutocomplete(true));


const subCommandRelease = new SlashCommandSubcommandBuilder();
subCommandRelease.setName('release')
    .setDescription('Relâcher un monstre capturé')
    .addIntegerOption(option =>
        option.setName('monster')
            .setDescription('Le monstre à relâcher')
            .setRequired(true)
            .setAutocomplete(true)
    );

const subCommandSynchro = new SlashCommandSubcommandBuilder();
subCommandSynchro.setName('synchro')
    .setDescription('Synchroniser avec DofusDB')

const CAPTURES_LIMIT = 20;

/**
 * Jeu basé sur mudae.
 * Roll des monstres
 * Capture
 * Inventaire
 */
module.exports = {
    data: new SlashCommandBuilder()
        .setName('osatopia')
        .setDescription('Jeu de capture de monstres')
        .setContexts(InteractionContextType.Guild)
        .addSubcommand(subCommandRoll)
        .addSubcommand(subCommandCaptures)
        .addSubcommand(subCommandView)
        .addSubcommand(subCommandTimer)
        .addSubcommand(subCommandTrade)
        .addSubcommand(subCommandRelease)
        .addSubcommand(subCommandSynchro)
    ,

    async execute(interaction: CommandInteraction) {
        if (!interaction.isCommand() || !(interaction.options instanceof CommandInteractionOptionResolver)) {
            return;
        }
        // Vérifier que l'interaction contient des sous-commandes avant d'essayer de les récupérer
        const command = interaction.options.getSubcommand();

        switch (command) {
            case subCommandRoll.name:
                await this.roll(interaction)
                break
            case subCommandCaptures.name:
                await this.captures(interaction)
                break
            case subCommandView.name:
                await this.view(interaction)
                break
            case subCommandTimer.name:
                await this.timer(interaction)
                break
            case subCommandTrade.name:
                await this.trade(interaction)
                break
            case subCommandRelease.name:
                await this.release(interaction)
                break
            case subCommandSynchro.name:
                const user = interaction.user
                if (user.id != "178147970385051649") {
                    await interaction.reply({content: 'Vous ne pouvez pas utiliser cette commande', ephemeral: true})
                    return;
                }
                await this.synchro(interaction)
                break;
            default:
                await interaction.reply(({content: "Commande incorrecte", ephemeral: true}))
                break
        }
    },

    async roll(interaction: CommandInteraction) {

        /**
         * @throws Error
         */
        async function canRoll(interaction: CommandInteraction) {
            const user = interaction.user;
            const guild = interaction.guild
            const timestamp: number = Date.now()

            const currentTime = Date.now();
            const key = `${user.id}:roll`;
            const lastUsage = cooldowns.get(key);

            if (lastUsage && currentTime - lastUsage < 3000) {
                const timeBeforeNextRoll = Math.floor(5 - (timestamp - lastUsage) / 1000)
                const purial = timeBeforeNextRoll > 1 ? 's' : ''
                throw new CommandCooldownError(
                    `Vous ne pouvez faire qu'un roll toutes les 3s. veuillez patienter ${timeBeforeNextRoll} seconde${purial}.`)
            }
            cooldowns.set(key, currentTime);

            const conditions = {
                createdAt: {
                    [Op.gte]: new Date(Date.now() - timeBetweenResetRoll)
                },
                rollUserId: user.id,
                guildId: guild?.id ?? 0
            }
            const captures: typeof Capture[] = await Capture.findAll({where: conditions})

            if (captures.length >= numberOfRolls) {
                const lastCapture: number = captures[captures.length - 1].createdAt
                const timeBeforeNextRollMs = timeBetweenResetRoll - (timestamp - lastCapture);

                const heures = Math.floor(timeBeforeNextRollMs / 3600000)
                const minutes = Math.floor((timeBeforeNextRollMs % 3600000) / 60000)
                const seconds = Math.floor((timeBeforeNextRollMs % 60000) / 1000)

                const pluralH = heures <= 1 ? '' : 's'
                const pluralM = minutes <= 1 ? '' : 's'
                const pluralS = seconds <= 1 ? '' : 's'

                const catchMonsterString = `Vous pourrez roll dans ${heures} heure${pluralH}, ${minutes} minute${pluralM} et ${seconds} seconde${pluralS} !`

                throw new CommandCooldownError(`Vous n'avez plus de roll disponible. ${catchMonsterString}`)
            }
        }

        // On vérifie que le user n'a pas déjà roll 3 fois depuis 3 heures*
        try {
            await canRoll(interaction)
        } catch (error) {
            if (error instanceof CommandCooldownError) {
                await interaction.reply({content: error.message, ephemeral: true})
            } else {
                console.error(error)
            }
            return;
        }

        const timestamp = Date.now()
        await interaction.deferReply();
        const transaction = await Capture.sequelize.transaction();

        try {
            const npcOrMonster: 'monster' | 'npc' = Math.random() < 0.5 ? "npc" : "monster";

            let captureCheck: typeof Capture | null;
            let captureDB: typeof Capture;
            let name: string;
            let imgName: string;
            let file: string;


            if (npcOrMonster === 'monster') {
                ({
                    captureCheck,
                    captureDB,
                    name,
                    imgName,
                    file
                } = await this.rollMonster(interaction));
            } else {
                ({
                    captureCheck,
                    captureDB,
                    name,
                    imgName,
                    file
                } = await this.rollNpc(interaction));
            }

            if (captureCheck) {
                // Monstre déjà capturé
                const guild = interaction.guild;
                const memberCatch = await guild?.members.fetch(captureCheck.catchUserId);
                const userCatch = await interaction.client.users.fetch(captureCheck.catchUserId);

                const userName = memberCatch?.nickname ?? userCatch.username;
                const description = `Capturé par ${userName}`;

                const embed = new EmbedBuilder()
                    .setTitle(name)
                    .setDescription(description)
                    .setImage(`attachment://${imgName}`); // Utilise le chemin de fichier joint

                await interaction.editReply({embeds: [embed], files: [file]});
            } else {
                const row = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(new ButtonBuilder()
                        .setLabel('Capture')
                        .setCustomId(`osatopia-capture-${captureDB.id}-${timestamp}`)
                        .setStyle(ButtonStyle.Success))

                const embed = new EmbedBuilder()
                    .setTitle(`${name}`)
                    .setImage(`attachment://${imgName}`)

                // JSON
                await interaction.editReply({embeds: [embed], components: [row], files: [file]})
            }

        } catch (error) {
            await transaction.rollback();
            console.error(error);
            return
        }

    },

    async rollMonster(interaction: CommandInteraction): Promise<{
        captureCheck: typeof Capture | null,
        captureDB: typeof Capture,
        name: string,
        imgName: string,
        file: string,
    }> {
        const guild = interaction.guild;

        function getConditionsRoll(): { isBoss: boolean, isMiniBoss: boolean } {
            // Nombre aléatoire entre 1 et 100
            const randomChanceBoss = Math.floor(Math.random() * 100) + 1

            let conditions: { isBoss: boolean, isMiniBoss: boolean } = {isBoss: false, isMiniBoss: false}

            // Si c'est 1, on prend un boss
            if ([1, 2].includes(randomChanceBoss)) {
                conditions = {isBoss: true, isMiniBoss: false}
            }
            // Si c'est 2, on prend un mini boss
            if ([6, 7].includes(randomChanceBoss)) {
                conditions = {isBoss: false, isMiniBoss: true}
            }

            return conditions
        }

        const conditions = getConditionsRoll()
        const monster: Monster | null = await Monster.findOne({
            where: conditions,
            order: Capture.sequelize.random()
        })

        if (!monster) {
            throw new Error('Impossible de trouver un monstre disponible !');
        }

        const id = monster.id
        const name = monster.name

        // Télécharge l'image si nécessaire
        const imgName = `${id}.png`;

        let file = null;
        try {
            file = await monster.getImage();
            if (!file) {
                throw new Error('Une erreur est survenue lors de la recherche de l\'image !');
            }
        } catch (error) {
            throw new Error('Une erreur est survenue lors de la recherche de l\'image !');
        }

        // Vérifie si le monstre est déjà capturé
        const conditionsCheckCapture = {
            monsterId: id,
            catchUserId: {[Op.ne]: null},
            guildId: guild?.id ?? 0
        };

        const captureCheck = await Capture.findOne({where: conditionsCheckCapture});

        const captureData = {
            monsterId: id,
            date: new Date(),
            monsterName: name,
            rollUserId: interaction.user.id,
            guildId: guild?.id ?? 0,
            npcId: 0
        };

        const capture = await Capture.create(captureData);

        return {
            captureDB: capture,
            name: monster.name,
            captureCheck: captureCheck,
            imgName: imgName,
            file: file,
        }

    },

    async rollNpc(interaction: CommandInteraction): Promise<{
        captureCheck: typeof Capture | null,
        captureDB: typeof Capture,
        name: string,
        imgName: string,
        file: string,
    }> {
        const guild = interaction.guild;

        const npc: Npc | null = await Npc.findOne({
            order: Capture.sequelize.random()
        })

        if (!npc) {
            throw new Error('Impossible de trouver un PNJ disponible !');
        }

        const id = npc.id

        // Télécharge l'image si nécessaire
        const imgName = `${id}.png`;

        let file = null;
        try {
            file = await npc.getImage()
            if (!file) {
                throw new Error('Une erreur est survenue lors de la recherche de l\'image !');
            }
        } catch (error) {
            throw new Error('Une erreur est survenue lors de la recherche de l\'image !');
        }

        // Vérifie si le monstre est déjà capturé
        const conditionsCheckCapture = {
            npcId: id,
            catchUserId: {[Op.ne]: null},
            guildId: guild?.id ?? 0
        };

        const captureCheck = await Capture.findOne({where: conditionsCheckCapture});

        const captureData = {
            npcId: id,
            date: new Date(),
            rollUserId: interaction.user.id,
            guildId: guild?.id ?? 0,
            monsterId: 0,
            monsterName: ''
        };
        const capture = await Capture.create(captureData);

        return {
            captureDB: capture,
            name: npc.name,
            captureCheck: captureCheck,
            imgName: imgName,
            file: file,
        }
    },

    async view(interaction: CommandInteraction) {
        if (!interaction.isChatInputCommand()) {
            return;
        }

        const id = interaction.options.getInteger('id')

        if (!id) {
            await interaction.reply({content: 'ID manquant !', ephemeral: true})
            return;
        }

        const capture = await Capture.findOne({where: {id: id}})

        if (!capture) {
            await interaction.reply({content: `Cette capture n'existe pas !`, ephemeral: true})
            return
        }

        const imgName = capture.monsterId ? `${capture.monsterId}.png` : `${capture.npcId}.png`;

        let name: string = await capture.getName();
        let file: string = await capture.getImage();

        const dateFr = capture.catchDate.toLocaleDateString('fr-FR', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        })

        const embed = new EmbedBuilder()
            .setTitle(`${name}`)
            .setDescription(`Capturé le ${dateFr}`)
            .setImage(`attachment://${imgName}`)

        await interaction.reply({embeds: [embed], files: [file]})
    },

    async release(interaction: CommandInteraction) {

        if (!interaction.isChatInputCommand()) {
            return;
        }

        const user = interaction.user
        const id = interaction.options.getInteger('monster')

        if (!id) {
            await interaction.reply({content: 'Monstre manquant !', ephemeral: true})
            return;
        }

        const capture = await Capture.findOne({where: {id: id, catchUserId: user.id}})

        if (!capture) {
            await interaction.reply({content: `Cette capture n'existe pas !`, ephemeral: true})
            return
        }

        const name = await capture.getName();
        const guild = interaction.guild
        const memberCatch = await guild?.members.fetch(user.id)

        const userName = memberCatch?.nickname ?? user.globalName

        const message: string = `${userName} a relâché ${name} !`

        await Capture.update({catchUserId: null, catchDate: null}, {where: {id: id}})

        await interaction.reply({content: message})
    },

    async synchro(interaction: CommandInteraction) {
        if (!interaction.isChatInputCommand()) {
            return;
        }

        let skip = 0;
        let limit = 50;

        await interaction.reply({content: "Synchronisation lancée !", ephemeral: true})

        console.log("Synchro monstres")

        let hasMonsters = false;
        let total = 0;
        while (hasMonsters) {
            const conditionRequest = `?$skip=${skip}&$limit=${limit}`
            const monstersRequest: MonsterAPIResponse = await fetchMonsters(conditionRequest);
            console.log(`skip: ${skip}`)
            skip += limit;
            if (monstersRequest.data.length === 0) {
                hasMonsters = false;
                break;
            }

            for (const monster of monstersRequest.data) {
                // On cherche le monstre
                const conditions = {where: {id: monster.id}}

                let myMonster: Monster | null = await Monster.findOne(conditions);

                if (myMonster) {
                    continue;
                }

                myMonster = await Monster.create({
                    id: monster.id,
                    name: monster.name.fr,
                    isBoss: monster.isBoss,
                    isMiniBoss: monster.isMiniBoss,
                    gfxId: monster.gfxId
                })

                total++;
                console.log(`Synchro de ${myMonster.name} (${myMonster.id})`)
            }


            // pause de 0.5s
            await new Promise(resolve => setTimeout(resolve, 0.5));
        }

        console.log("Synchro PNJ")

        let hasNpcs = true;
        let totalNpcs = 0;
        let skipNpcs = 0;
        while (hasNpcs) {
            const conditionRequest = `?$skip=${skipNpcs}&$limit=${limit}`
            const npcsRequest: NpcAPIResponse = await fetchNpcs(conditionRequest);
            skipNpcs += limit;
            console.log(`skip: ${skipNpcs}`)
            if (npcsRequest.data.length === 0) {
                hasNpcs = false;
                break;
            }
            for (const npc of npcsRequest.data) {
                // On cherche le PNJ
                const conditions = {where: {id: npc.id}};
                let myNpc: Npc | null = await Npc.findOne(conditions);

                if (myNpc) {
                    continue
                }

                myNpc = await Npc.create({
                    id: npc.id,
                    name: npc.name.fr,
                    look: npc.look
                })

                totalNpcs++;
                console.log(`Synchro de ${myNpc.name} (${myNpc.id})`)
            }

            // Pause de 0.5s
            await new Promise(resolve => setTimeout(resolve, 0.5));
        }
        console.log(`${totalNpcs} PNJ ajoutés !`)
    },
    async captures(interaction: CommandInteraction) {
        const user: User = interaction.user
        const guild = interaction.guild;
        const member = await guild?.members.fetch(user.id)
        const memberName = member?.nickname ?? user.globalName

        const captures = await Capture.findAll({
            where: {catchUserId: user.id, guildId: guild?.id ?? 0},
            order: [['catchDate', 'DESC']]
        });

        if (captures.length === 0) {
            await interaction.reply({content: 'Vous n\'avez pas capturé de monstres !', ephemeral: true})
            return;
        }

        let capturesArray: string [] = []
        let count = 0;
        for (const capture of captures) {
            if (count === CAPTURES_LIMIT) {
                break;
            }

            const date = capture.catchDate
            const name = await capture.getName();

            // dd/mm/YY
            const dateString = date.toLocaleDateString('fr-FR', {day: '2-digit', month: '2-digit', year: 'numeric'})
            capturesArray.push(`${dateString} - ${name}`)
            count++;
        }

        const embed = embedData.createEmbed([], {
            title: `Collection de ${memberName}`,
            description: capturesArray.join('\n')
        })

        if (count === CAPTURES_LIMIT) {
            const updatedRow = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`osatopia-captures-${user.id}_0`)
                        .setLabel('◀️ Précédent')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId(`osatopia-captures-${user.id}_2`)
                        .setLabel('▶️ Suivant')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(false)
                );

            await interaction.reply({
                embeds: embed.embeds,
                files: embed.files,
                components: [updatedRow]
            })
            return;
        }

        await interaction.reply({
            embeds: embed.embeds,
            files: embed.files
        })
    },

    async timer(interaction: CommandInteraction) {
        const user = interaction.user
        const timestamp = Date.now()

        // On récupère la dernière capture du user
        const lastCapture = await Capture.findOne({
            where: {catchUserId: user.id, guildId: interaction.guild?.id ?? 0},
            order: [['catchDate', 'DESC']]
        })

        let timeBeforeCapture = 0
        if (lastCapture) {
            timeBeforeCapture = timeBetweenCaptures - (timestamp - lastCapture.catchDate)
        }
        let catchMonsterString = ''
        if (timeBeforeCapture > 1) {
            const heures = Math.floor(timeBeforeCapture / 3600000)
            const minutes = Math.floor((timeBeforeCapture % 3600000) / 60000)
            const seconds = Math.floor((timeBeforeCapture % 60000) / 1000)

            const pluralH = heures <= 1 ? '' : 's'
            const pluralM = minutes <= 1 ? '' : 's'
            const pluralS = seconds <= 1 ? '' : 's'
            catchMonsterString = `Vous pourrez capturer un monstre dans ${heures} heure${pluralH}, ${minutes} minute${pluralM} et ${seconds} seconde${pluralS} !`
        } else {
            catchMonsterString = 'Vous pouvez capturer un monstre !'
        }

        const conditionsLastRoll = {
            where: {
                rollUserId: user.id,
                createdAt: {
                    [Op.gte]: new Date(Date.now() - timeBetweenResetRoll) // Filtrer les rolls créés il y a moins de 3 heures
                },
                guildId: interaction.guild?.id ?? 0
            }, order: [['createdAt', 'ASC']]
        }

        const lastRolls = await Capture.findAll(conditionsLastRoll)

        let timeBeforeRoll = 0
        if (lastRolls.length >= numberOfRolls) {
            const firstLastRoll = lastRolls[0]
            timeBeforeRoll = timeBetweenResetRoll - (timestamp - firstLastRoll.createdAt)
        }

        let rollMonsterString = ''
        if (timeBeforeRoll > 1) {
            const heures = Math.floor(timeBeforeRoll / 3600000)
            const minutes = Math.floor((timeBeforeRoll % 3600000) / 60000)
            const seconds = Math.floor((timeBeforeRoll % 60000) / 1000)

            const pluralH = heures <= 1 ? '' : 's'
            const pluralM = minutes <= 1 ? '' : 's'
            const pluralS = seconds <= 1 ? '' : 's'
            rollMonsterString = `Vous pourrez roll un monstre dans ${heures} heure${pluralH}, ${minutes} minute${pluralM} et ${seconds} seconde${pluralS} !`
        } else {
            rollMonsterString = 'Vous pouvez roll un monstre !'
        }

        const embed = new EmbedBuilder()
            .setTitle('Timer')
            .setDescription(`${catchMonsterString}\n${rollMonsterString}`)

        await interaction.reply({embeds: [embed]})
    },

    async trade(interaction: CommandInteraction) {
        if (!interaction.isChatInputCommand()) {
            return;
        }
        const options = interaction.options

        const user1 = interaction.user;
        const user2 = options.getUser('user')

        if (!user2) {
            await interaction.reply({content: 'Veuillez fournir un utilisateur valide !', ephemeral: true})
            return
        }

        const monster1 = options.getInteger('monster1')
        const monster2 = options.getInteger('monster2')

        if (!monster1 || !monster2) {
            await interaction.reply({content: 'Veuillez fournir des monstres valides ! 1', ephemeral: true})
            return
        }

        const capture1 = await Capture.findOne({
            where: {
                id: monster1,
                catchUserId: user1.id,
                guildId: interaction.guild?.id ?? 0
            }
        })
        const capture2 = await Capture.findOne({
            where: {
                id: monster2,
                catchUserId: user2.id,
                guildId: interaction.guild?.id ?? 0
            }
        })

        if (!capture1 || !capture2) {
            await interaction.reply({content: 'Veuillez fournir des monstres valides ! 2', ephemeral: true})
            return
        }

        const name1 = capture1.getName();
        const name2 = capture2.getName()

        const trade = await CaptureTrade.create({
            user1Id: user1.id,
            user2Id: user2.id,
            capture1Id: capture1.id,
            capture2Id: capture2.id,
            status: "pending"
        })

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(new ButtonBuilder()
                .setCustomId(`osatopia-trade-accept-${trade.id}`)
                .setLabel('Accepter')
                .setStyle(ButtonStyle.Success))
            .addComponents(new ButtonBuilder()
                .setCustomId(`osatopia-trade-refuse-${trade.id}`)
                .setLabel('Refuser')
                .setStyle(ButtonStyle.Danger))

        await interaction.reply({
            content: `<@${user1.id}> propose un échange pour <@${user2.id}> !\n` + `**${name1}** contre **${name2}**`,
            components: [row]
        })

        return;
    },

    async executeButton(interaction: ButtonInteraction) {
        if (!interaction.isButton()) {
            return;
        }

        const buttonId = interaction.customId
        const split = buttonId.split('-')

        async function captureMonster(interaction: ButtonInteraction) {

            const id = interaction.customId.split('-')[2]
            const user = interaction.user

            const capture = await Capture.findOne({where: {id: id}})

            if (!capture) {
                await interaction.reply({content: 'Cette capture n\'existe pas !', ephemeral: true})
                return
            }

            // On vérifie que la capture n'est pas déjà prise
            if (capture.catchUserId) {
                await interaction.reply({content: 'Cette capture a déjà été prise !', ephemeral: true})
                return
            }

            const myDate = new Date()
            // On vérifie que la capture n'est pas trop vieille
            if (myDate.getTime() - capture.createdAt > 60 * 60 * 1000) {
                await interaction.reply({content: 'Cette capture est trop vieille !', ephemeral: true})
                return;
            }

            // On vérifie que le user n'a pas déjà roll il y a moins de 3h
            const conditions = {
                catchDate: {
                    [Op.gte]: new Date(Date.now() - timeBetweenCaptures)
                },
                catchUserId: user.id,
                guildId: interaction.guild?.id ?? 0
            }
            const captures = await Capture.findAll({where: conditions})

            if (captures.length > 0) {
                await interaction.reply({content: 'Vous avez capturé un monstre il y a moins de 3h !', ephemeral: true})
                return
            }


            const name = await capture.getName()

            await Capture.update({catchUserId: user.id, catchDate: new Date()}, {where: {id: id}})

            const guild = interaction.guild
            const memberCatch = await guild?.members.fetch(user.id)

            const userName = memberCatch?.nickname ?? user.globalName

            await interaction.reply(`${userName} a capturé ${name} !`)
        }

        async function tradeMonster(interaction: ButtonInteraction) {
            const action = split[2]
            const tradeId = split[3]

            const trade = await CaptureTrade.findOne({where: {id: tradeId}})

            if (!trade) {
                await interaction.reply({content: "Cette demande d'échange n'existe pas !", ephemeral: true})
                return
            }

            // On vérifie que la demande est encore valide
            if (trade.status !== 'pending') {
                await interaction.reply({content: "Cette demande d'échange n'est plus disponible !", ephemeral: true})
                return
            }

            const capture1Id = trade.capture1Id
            const capture2Id = trade.capture2Id

            const user1Id = trade.user1Id
            const user2Id = trade.user2Id

            const capture1 = await Capture.findOne({where: {id: capture1Id}})
            const capture2 = await Capture.findOne({where: {id: capture2Id}})

            if (!capture1 || !capture2) {
                await interaction.reply({content: 'Cette capture n\'existe pas !', ephemeral: true})
                return
            }

            if (user2Id !== interaction.user.id) {
                await interaction.reply({content: "Cet échange n'est pas pour vous !", ephemeral: true})
                return
            }

            if (`${user1Id}` !== `${capture1.catchUserId}` || `${user2Id}` !== `${capture2.catchUserId}`) {
                await interaction.reply({content: "Cet échange n'est pas pour vous !", ephemeral: true})
                return
            }

            if (action === 'accept') {
                await sequelize.transaction(async (transaction) => {
                    try {
                        await Capture.update({catchUserId: user1Id, catchDate: new Date()}, {where: {id: capture2.id}})
                        await Capture.update({catchUserId: user2Id, catchDate: new Date()}, {where: {id: capture1.id}})
                        await CaptureTrade.update({status: 'done'}, {where: {id: trade.id}})

                        await interaction.reply({content: 'Échange effectué !'})
                    } catch (error) {
                        await transaction.rollback()
                        await interaction.reply(
                            {content: "Une erreur est survenue lors de l'échange !", ephemeral: true})
                        return
                    }
                });
            } else {
                await interaction.reply({content: 'Échange refusé !'})
                await CaptureTrade.update({status: 'refused'}, {where: {id: trade.id}})
            }
        }

        async function capturesMonster(interaction: ButtonInteraction) {
            const customId = interaction.customId;

            const [, , userIdAndPage] = customId.split('-');
            const [userId, pageIndex] = userIdAndPage.split('_');

            const guild = interaction.guild;
            const member = await guild?.members.fetch(userId)
            const memberName = member?.nickname ?? member?.user.globalName

            const captures = await Capture.findAll({
                where: {
                    catchUserId: userId,
                    guildId: guild?.id ?? 0
                },
                order: [['catchDate', 'DESC']],
            });

            const page = parseInt(pageIndex)
            const counter = page - 1;

            const items = [];
            let count = 0;
            for (const [index, capture] of captures.entries()) {
                if (index < counter * CAPTURES_LIMIT) continue;
                if (count === CAPTURES_LIMIT) break;

                const name = await capture.getName();
                const date = capture.catchDate

                // dd/mm/YY
                const dateString = date.toLocaleDateString('fr-FR', {day: '2-digit', month: '2-digit', year: 'numeric'})
                items.push(`${dateString} - ${name}`)
                count++;
            }

            const maxPages = Math.ceil(captures.length / CAPTURES_LIMIT);

            const embed = embedData.createEmbed([], {
                title: `Collection de ${memberName}`,
                description: items.join('\n')
            })

            const message = interaction.message;

            const pagePrevious = page - 1;
            const pageNext = page + 1;

            const updatedRow = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`osatopia-captures-${userId}_${pagePrevious}`)
                        .setLabel('◀️ Précédent')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(pagePrevious === 0),
                    new ButtonBuilder()
                        .setCustomId(`osatopia-captures-${userId}_${pageNext}`)
                        .setLabel('▶️ Suivant')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page === maxPages)
                );

            await interaction.deferUpdate()
            await message.edit({
                embeds: embed.embeds,
                files: embed.files,
                components: [updatedRow]
            })

        }

        switch (split[1]) {
            case subCommandTrade.name:
                await tradeMonster(interaction)
                break;
            case 'capture': {
                await captureMonster(interaction)
                return;
            }
            case subCommandCaptures.name: {
                await capturesMonster(interaction)
                return;
            }
        }
    },

    async autocomplete(interaction: AutocompleteInteraction) {
        const options = interaction.options
        const subCommand = options.getSubcommand();

        switch (subCommand) {
            case subCommandTrade.name: {
                const focusedOption = interaction.options.getFocused(true); // Récupère l'option en cours de complétion

                if (focusedOption.name === 'monster1') {
                    const user = interaction.user
                    const search = focusedOption.value
                    const userCapturesConditions = {
                        include: [
                            {
                                model: Monster,
                                as: 'monster',
                                required: false,
                                attributes: ['name'],
                            },
                            {
                                model: Npc,
                                as: 'npc',
                                required: false,
                                attributes: ['name'],
                            },
                        ],
                        where: {
                            catchUserId: user.id, // Filtre sur le modèle Capture
                            [Op.or]: [
                                { '$monster.name$': { [Op.like]: `%${search}%` } }, // Filtre sur Monster.name
                                { '$npc.name$': { [Op.like]: `%${search}%` } }, // Filtre sur Npc.name
                            ],
                            guildId: interaction.guild?.id ?? 0
                        },
                //        order: [[Capture, 'id', 'DESC']], // Remplacement des alias compliqués par une syntaxe simple
                        limit: 25, // Limite des résultats
                    };
                    const captures = await Capture.findAll(userCapturesConditions);
                    const retours = []
                    for (const capture of captures) {
                        retours.push({name: capture.monster?.name || capture.npc?.name, value: capture.id})
                    }
                    await interaction.respond(retours)
                    return
                } else if (focusedOption.name === 'monster2') {
                    const search = focusedOption.value
                    // on check sur la fonction option.getUser existe
                    const user: CommandInteractionOption<CacheType> | null = interaction.options.get('user'); // Récupérer l'option 'user'

                    if (!user?.value) {
                        await interaction.respond([])
                        return
                    }

                    const userCapturesConditions = {
                        include: [
                            {
                                model: Monster,
                                as: 'monster',
                                required: false,
                                attributes: ['name'],
                            },
                            {
                                model: Npc,
                                as: 'npc',
                                required: false,
                                attributes: ['name'],
                            },
                        ],
                        where: {
                            catchUserId: user?.value, // Filtre sur le modèle Capture
                            [Op.or]: [
                                { '$monster.name$': { [Op.like]: `%${search}%` } }, // Filtre sur Monster.name
                                { '$npc.name$': { [Op.like]: `%${search}%` } }, // Filtre sur Npc.name
                            ],
                            guildId: interaction.guild?.id ?? 0
                        },
                    //    order: [[Capture, 'id', 'DESC']], // Remplacement des alias compliqués par une syntaxe simple
                        limit: 25, // Limite des résultats
                    };
                    const userCaptures = await Capture.findAll(userCapturesConditions);

                    const retours = []
                    for (const capture of userCaptures) {
                        retours.push({name: capture.monster?.name || capture.npc?.name, value: capture.id})
                    }
                    await interaction.respond(retours)
                    return
                }
                await interaction.respond([])
                break;
            }
            case subCommandRelease.name:
            case subCommandView.name: {
                const focusedOption = interaction.options.getFocused(true); // Récupère l'option en cours de complétion
                const search = focusedOption.value

                const user = interaction.user
                const userCapturesConditions = {
                    include: [
                        {
                            model: Monster,
                            as: 'monster', // Doit correspondre à l'alias
                            attributes: ['name'],
                            required: false,
                        },
                        {
                            model: Npc,
                            as: 'npc', // Doit correspondre à l'alias
                            attributes: ['name'],
                            required: false,
                        },
                    ],
                    where: {
                        catchUserId: user.id,
                        guildId: interaction.guild?.id ?? 0,
                        [Op.or]: [
                            { '$monster.name$': { [Op.like]: `%${search}%` } },
                            { '$npc.name$': { [Op.like]: `%${search}%` } },
                        ],
                    },
                    order: [['id', 'DESC']],
                    limit: 25,
                };

                const captures = await Capture.findAll(userCapturesConditions)
                const retours = []

                for (const capture of captures) {
                    retours.push({name: capture.monster?.name || capture.npc?.name, value: capture.id})
                }

                await interaction.respond(retours)
                return;
            }
        }
    },
}
