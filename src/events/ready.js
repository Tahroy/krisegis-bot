const { version } = require('../../config/config_bot.json')
const Variable = require('../database/Variable')
const Server = require('../database/Server')
const Event = require('../database/Event')
const Participant = require('../database/Participant')
const Question = require('../database/Question')
const WelcomeMessage = require('../database/WelcomeMessage')
const { REST } = require('@discordjs/rest')
const { token, client_id } = require('../../config/config_bot.json')
const { Routes } = require('discord-api-types/v10')
const moment = require('moment/moment')

const eventReminderCheckInterval = 60 * 1000 // Intervalle de vérification des rappels (5 minutes dans cet exemple)
const eventReminderTime = 60 * 60 * 1000 // Durée en millisecondes avant le rappel (1 heure dans cet exemple)

module.exports = async function (client) {
    client.once('ready', async () => {
        console.log(`Krisegis V${version} prêt !`)

        await Variable.sync()
        await Server.sync()
        await Event.sync()
        await Participant.sync()
        await Question.sync()
        await WelcomeMessage.sync()

        console.log('BDD Synchro !');

        const rest = new REST({ version: '10' }).setToken(token)

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
        slashCommands = slashCommands.map(command => command.toJSON())

        await rest.put(
            Routes.applicationCommands(client_id),
            { body: slashCommands },
        ).then(() => console.log('Successfully registered application commands.')).catch(
            console.error,
        )

        checkEventReminders()

    })

    function checkEventReminders () {
        var a = setInterval(async () => {
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

                    event.update({
                        recalled: true
                    })
                }
            }
        }, eventReminderCheckInterval)
    }

    // Fonction pour récupérer les événements planifiés depuis votre système de stockage (table)
    async function getScheduledEventsFromDatabase () {
        return await Event.findAll({
            where: { recalled: false }
        })
    }

    // Fonction pour récupérer les participants d'un événement depuis votre système de stockage (table)
    async function getParticipantsFromDatabase (event) {

        return await Participant.findAll({
            where: {
                event: event.id
            }
        })
    }
}