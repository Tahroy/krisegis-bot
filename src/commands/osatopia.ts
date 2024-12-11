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
    SlashCommandBuilder,
    User
} from 'discord.js'
import {ButtonStyle} from 'discord-api-types/v10'
import {Op} from 'sequelize'
import {Monster, MonsterAPIResponse} from "../dofusdb/types/monster";
import {fetchMonster, fetchMonsters} from "../dofusdb/api";
import {join} from "path";
import {PicturesManager} from "../utils/PicturesManager";
import sequelize from '../utils/database';
import CaptureTrade from "../models/CaptureTrade";
import {CommandCooldownError} from "../exceptions/CommandCooldownError";

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
            default:
                break
        }
    },

    async roll(interaction: CommandInteraction) {
        async function getConditionsRoll(): Promise<string> {
            let conditionRequest = '&isBoss=false&isMiniBoss=false'
            // Nombre aléatoire entre 1 et 200
            const randomChanceBoss = Math.floor(Math.random() * 100) + 1

            // Si c'est 1, on prend un boss
            if ([1, 2].includes(randomChanceBoss)) {
                conditionRequest = '&isBoss=true&isMiniBoss=false'
            }
            // Si c'est 2, on prend un mini boss
            if ([6, 7].includes(randomChanceBoss)) {
                conditionRequest = '&isBoss=false&isMiniBoss=true'
            }

            // Requête DofusDB via Axios
            const conditionTotal = `?$skip=0&$limit=1${conditionRequest}`
            const monstersTotalRequest: MonsterAPIResponse = await fetchMonsters(conditionTotal);

            const total = monstersTotalRequest.total

            const random = Math.floor(Math.random() * total) + 1
            return `?$skip=${random}&$limit=1${conditionRequest}`
        }

        /**
         *
         * @throws Error
         */
        async function canRoll(user: User) {
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
                }, rollUserId: user.id
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
            await canRoll(interaction.user)
        } catch (error) {
            if (error instanceof CommandCooldownError) {
                await interaction.reply({content: error.message, ephemeral: true})
            } else {
                console.error(error)
            }
            return;
        }

        const transaction = await Capture.sequelize.transaction();
        try {
            const monstersRequest: MonsterAPIResponse = await fetchMonsters(await getConditionsRoll());
            const monster: Monster = monstersRequest.data[0]

            const id = monster.id
            const name = monster.name.fr

            const timestamp = Date.now()

            // Télécharge l'image si nécessaire
            const imgName = `${id}.png`;

            let file = null;
            try {
                file = await this.getImagePath(monster, imgName);
                if (!file) {
                    await interaction.reply(
                        {content: 'Une erreur est survenue lors de la recherche de l\'image !', ephemeral: true})
                    return
                }
            } catch (error) {
                await interaction.reply(
                    {content: 'Une erreur est survenue lors de la recherche de l\'image !', ephemeral: true})
                return
            }

            // Vérifie si le monstre est déjà capturé
            const conditionsCheckCapture = {
                monsterId: id, catchUserId: {[Op.ne]: null},
            };
            const captureCheck = await Capture.findOne({where: conditionsCheckCapture});
            const captureData = {monsterId: id, date: new Date(), monsterName: name, rollUserId: interaction.user.id,};

            const captureDB: typeof Capture = await Capture.create(captureData);

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

                await interaction.reply({embeds: [embed], files: [file]});
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
                await interaction.reply({embeds: [embed], components: [row], files: [file]})
            }
        } catch (error) {
            await transaction.rollback();
            console.error(error);
            return
        }

    },

    async view(interaction: CommandInteraction) {
        if (!interaction.isCommand() || !(interaction.options instanceof CommandInteractionOptionResolver)) {
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

        const name = capture.monsterName
        const monsterId = capture.monsterId

        // Request DofusDB
        const monster = await fetchMonster(monsterId)

        const imgName = `${id}.png`;
        const file = await this.getImagePath(monster, imgName);

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

        if (!interaction.isCommand() || !(interaction.options instanceof CommandInteractionOptionResolver)) {
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

        const name = capture.monsterName;
        const guild = interaction.guild
        const memberCatch = await guild?.members.fetch(user.id)

        const userName = memberCatch?.nickname ?? user.globalName

        const message: string = `${userName} a relâché ${name} !`

        await Capture.update({catchUserId: null, catchDate: null}, {where: {id: id}})

        await interaction.reply({content: message})
    },

    async captures(interaction: CommandInteraction) {
        const user: User = interaction.user

        const captures = await Capture.findAll({where: {catchUserId: user.id}, order: [['catchDate', 'DESC']]});

        if (captures.length === 0) {
            await interaction.reply({content: 'Vous n\'avez pas capturé de monstres !', ephemeral: true})
            return;
        }

        let capturesArray: string [] = []
        for (const capture of captures) {
            const date = capture.catchDate
            // dd/mm/YY
            const dateString = date.toLocaleDateString('fr-FR', {
                day: '2-digit', month: '2-digit', year: 'numeric'
            })
            capturesArray.push(`${dateString} - ${capture.monsterName}`)
        }

        const embed = new EmbedBuilder()
            .setTitle('Vos captures')

        await interaction.reply({embeds: [embed.setDescription(capturesArray.join('\n'))]})
    },

    async timer(interaction: CommandInteraction) {
        const user = interaction.user
        const timestamp = Date.now()

        // On récupère la dernière capture du user
        const lastCapture = await Capture.findOne({where: {catchUserId: user.id}, order: [['catchDate', 'DESC']]})

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
                rollUserId: user.id, createdAt: {
                    [Op.gte]: new Date(Date.now() - timeBetweenResetRoll) // Filtrer les rolls créés il y a moins de 3 heures
                }
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
        if (!interaction.isCommand() || !(interaction.options instanceof CommandInteractionOptionResolver)) {
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

        const capture1 = await Capture.findOne({where: {id: monster1, catchUserId: user1.id}})
        const capture2 = await Capture.findOne({where: {id: monster2, catchUserId: user2.id}})

        if (!capture1 || !capture2) {
            await interaction.reply({content: 'Veuillez fournir des monstres valides ! 2', ephemeral: true})
            return
        }

        const trade = await CaptureTrade.create({
            user1Id: user1.id, user2Id: user2.id, capture1Id: capture1.id, capture2Id: capture2.id, status: "pending"
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
            content: `<@${user1.id}> propose un échange pour <@${user2.id}> !\n` + `**${capture1.monsterName}** contre **${capture2.monsterName}**`,
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
                }, catchUserId: user.id
            }
            const captures = await Capture.findAll({where: conditions})

            if (captures.length > 0) {
                await interaction.reply({content: 'Vous avez capturé un monstre il y a moins de 3h !', ephemeral: true})
                return
            }

            // On vérifie que le user n'a pas déjà le monstre
            const conditions2 = {catchUserId: user.id, monsterId: capture.monsterId}
            const captures2 = await Capture.findAll({where: conditions2})

            if (captures2.length > 0) {
                await interaction.reply({content: 'Vous avez deja capturé ce monstre !', ephemeral: true})
                return
            }

            const name = capture.monsterName

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

        switch (split[1]) {
            case subCommandTrade.name:
                await tradeMonster(interaction)
                break;
            case 'capture': {
                await captureMonster(interaction)
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
                        where: {
                            catchUserId: user.id, monsterName: {
                                [Op.like]: `%${search}%`
                            }
                        }, order: [['monsterName', 'DESC']], limit: 25
                    }
                    const captures = await Capture.findAll(userCapturesConditions);
                    const retours = []
                    for (const capture of captures) {
                        retours.push({name: capture.monsterName, value: capture.id})
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
                        where: {
                            catchUserId: user?.value, monsterName: {
                                [Op.like]: `%${search}%`
                            }
                        }, order: [['monsterName', 'DESC']], limit: 25
                    }
                    const userCaptures = await Capture.findAll(userCapturesConditions);

                    const retours = []
                    for (const capture of userCaptures) {
                        retours.push({name: capture.monsterName, value: capture.id})
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
                const captures = await Capture.findAll({
                    where: {
                        catchUserId: user.id, monsterName: {
                            [Op.like]: `%${search}%`
                        }
                    }, order: [['monsterName', 'DESC']], limit: 25
                })
                const retours = []

                for (const capture of captures) {
                    retours.push({name: capture.monsterName, value: capture.id})
                }

                await interaction.respond(retours)
                return;
            }
        }
    },

    async getImagePath(monster: Monster, name: string) {
        const img = monster.img;
        await PicturesManager.fetchImageIfNeeded(img, name, '/monsters/');

        return join(__dirname, '..', '..', 'public', 'monsters', name)
    },

}
