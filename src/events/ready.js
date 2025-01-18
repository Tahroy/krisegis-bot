const {version} = require('../../config/config_bot.json')
const {REST} = require('@discordjs/rest')
const {token, client_id} = require('../../config/config_bot.json')
const {Routes} = require('discord-api-types/v10')
const moment = require('moment/moment')
const {readdirSync} = require("fs");
const {join} = require("path");
const Monster = require("../models/Monster").default;
import JobUtil from '../commands/astrub_economy/JobUtil';

// Capture transpilé en JavaScript après compilation TypeScript
const Capture = require('../models/Capture').default
const CaptureTrade = require('../models/CaptureTrade').default
const Event = require('../models/Event').default
const Larve = require('../models/Larve').default
const LoreElement = require('../models/LoreElement').default
const Participant = require('../models/Participant').default
const PlayerItem = require('../models/PlayerItem').default
const Potion = require('../models/Potion').default
const Question = require('../models/Question').default
const Server = require('../models/Server').default
const Variable = require('../models/Variable').default
const WelcomeMessage = require('../models/WelcomeMessage').default
const Job = require('../models/astrub_economy/Job').default
const Player = require('../models/astrub_economy/Player').default

const eventReminderCheckInterval = 60 * 1000 // Intervalle de vérification des rappels (5 minutes dans cet exemple)
const eventReminderTime = 60 * 60 * 1000 // Durée en millisecondes avant le rappel (1 heure dans cet exemple)

module.exports = async function (client) {
    async function synchroBDD() {
        await Variable.sync()
        await Server.sync()
        await Event.sync()
        await Participant.sync()
        await Question.sync()
        await WelcomeMessage.sync()
        await LoreElement.sync()
        await PlayerItem.sync()
        await Potion.sync()
        await Larve.sync()
        await Capture.sync()
        await CaptureTrade.sync()
        await Monster.sync()
        await Job.sync();
        await Player.sync();
        console.log('BDD Synchro !')
    }

    async function synchroCommands(rest) {
        let slashCommands = []

        // Commandes générales
        for (const command of client.commands) {
            const commandData = command[1]

            if (!commandData.description) {
                commandData.description = '- Sans description'
            }
            let slashCommand = commandData.data
            slashCommands.push(slashCommand)
        }

        for (const command of client.typedCommands) {
            const commandData = command[1]

            let slashCommand = commandData.getSlashCommandBuild()
            slashCommands.push(slashCommand)
        }

        slashCommands = slashCommands.map(command => command.toJSON())

        await rest.put(Routes.applicationCommands(client_id), {body: slashCommands},)
            .then(() => console.log('Successfully registered application commands.'))
            .catch(console.error)
    }

    async function synchroEmojis(client) {
        // Récupération des emojis dans assets/emojis
        const emojis = await client.application.emojis.fetch()
        const emojisNames = emojis.map(emoji => emoji.name)

        const images = readdirSync(join('assets', 'emojis'))
        for (const image of images) {
            const imageName = image.split('.')[0]
            const imgPath = join('assets', 'emojis', image)

            if (emojisNames.includes(imageName)) {
                continue
            }

            client.application.emojis.create({attachment: imgPath, name: imageName})
                .then(emoji => console.log(`Created new emoji with name ${emoji.name}!`))
                .catch(console.error);
        }
    }

    async function listGuilds() {
        for (const guild of client.guilds.cache.values()) {
            console.log(`- ${guild.name} (ID: ${guild.id})`)
        }
    }
    client.once('ready', async () => {
        console.log(`Krisegis V${version} prêt !`)

        const rest = new REST({version: '10'}).setToken(token)

        await synchroBDD();
        await synchroCommands(rest);
        await synchroEmojis(client);
        await listGuilds()
        await checkEventReminders()
        const jobUtil = new JobUtil();
        jobUtil.startReminder(client);

    })

    function checkEventReminders() {
        const a = setInterval(async () => {
            const scheduledEvents = await getScheduledEventsFromDatabase()

            const now = Date.now()
            for (const event of scheduledEvents) {

                const guild = client.guilds.cache.get(event.guild)
                if (!guild.scheduledEvents) {
                    continue
                }
                const guildEvent = guild.scheduledEvents.cache.get(event.id)

                if (!guildEvent) {
                    continue
                }

                const eventStartTime = guildEvent.scheduledStartTimestamp
                const link = guildEvent.url
                const reminderTime = eventStartTime - eventReminderTime
                if (now >= reminderTime && now < eventStartTime) {

                    console.log(`${guildEvent.name} commence !`)
                    // Le rappel doit être envoyé
                    const participants = await getParticipantsFromDatabase(event)

                    for (const participant of participants) {
                        const participantId = participant.id
                        try {
                            const server = guild.roles.cache.get(event.server)
                            const user = await client.users.fetch(participantId)
                            moment.locale('fr') // Définir la locale sur français
                            const dateDebutFR = moment(guildEvent.scheduledStartTimestamp).format('HH:mm')

                            await user.send(`
**__Rappel__** : L'événement **${guildEvent.name}** commence dans une heure sur **${server.name}** (**${dateDebutFR}**) !
${link}
`)
                            console.log(`Message de rappel envoyé à ${user.tag} pour l'événement ${guildEvent.name} !`)
                        } catch (error) {
                            console.error(`Erreur lors de l'envoi du message de rappel à l'utilisateur ${participantId}:`, error)
                        }
                    }

                    await event.update({
                        recalled: true
                    })
                }
            }
        }, eventReminderCheckInterval);
    }

    // Fonction pour récupérer les événements planifiés depuis votre système de stockage (table)
    async function getScheduledEventsFromDatabase() {
        return await Event.findAll({
            where: {recalled: false}
        })
    }

    // Fonction pour récupérer les participants d'un événement depuis votre système de stockage (table)
    async function getParticipantsFromDatabase(event) {

        return await Participant.findAll({
            where: {
                event: event.id
            }
        })
    }
}