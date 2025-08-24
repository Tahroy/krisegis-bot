import Npc from "../models/Npc";

import PlayerHouse from "../models/astrub_economy/PlayerHouse";

const {version} = require('../../config/config_bot.json')
const {REST} = require('@discordjs/rest')
const {token, client_id} = require('../../config/config_bot.json')
const {Routes} = require('discord-api-types/v10')
const moment = require('moment/moment')
const {readdirSync} = require("fs");
const {join} = require("path");
const Monster = require("../models/Monster").default;
import JobUtil from '../services/JobUtil';
import BuildingGuild from "../models/astrub_economy/BuildingGuild";
import WeatherGuild from "../models/astrub_economy/WeatherGuild";
import associate from "../models/associations";
import Population from "../models/astrub_economy/Population";
import Quest from "../models/astrub_economy/Quest";
import Constantes from "../utils/Constantes";
import NotificationService from "../services/NotificationService";

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
        await Npc.sync();
        await Job.sync();
        await Player.sync();
        await PlayerHouse.sync();
        await BuildingGuild.sync()
        await WeatherGuild.sync();
        await Population.sync();
        await Quest.sync();
        associate();
        console.log('BDD Synchro !')
    }

    async function synchroCommands(rest) {
        let globalSlashCommands = []
        const guildCommandMap = new Map()

        const allowedGuildIds = [
            '185464480346537984',   // Discord RP
            '1113468001379962880',  // Discord test
            '641999599099445279'    // Discord Nellonia
        ];

        // Vieilles commandes JS
        for (const command of client.commands) {
            const commandData = command[1]

            if (!commandData.description) {
                commandData.description = '- Sans description'
            }
            const slashCommand = commandData.data

            if (commandData.public === false) {
                for (const guildId of allowedGuildIds) {
                    const list = guildCommandMap.get(guildId) || []
                    list.push(slashCommand)
                    guildCommandMap.set(guildId, list)
                }
            } else {
                globalSlashCommands.push(slashCommand)
            }
        }

        // Nouvelles commandes
        for (const command of client.typedCommands) {
            const commandInstance = command[1]
            const slashCommand = commandInstance.getSlashCommandBuild()

            if (commandInstance.public === false) {
                for (const guildId of allowedGuildIds) {
                    const list = guildCommandMap.get(guildId) || []
                    list.push(slashCommand)
                    guildCommandMap.set(guildId, list)
                }
            } else {
                globalSlashCommands.push(slashCommand)
            }
        }

        // Conversion en JSON
        globalSlashCommands = globalSlashCommands.map(command => command.toJSON())
        for (const [guildId, commands] of guildCommandMap.entries()) {
            const jsonCommands = commands.map(command => command.toJSON())
            guildCommandMap.set(guildId, jsonCommands)
        }

        // Enregistrement global
        if (globalSlashCommands.length > 0) {
            await rest.put(Routes.applicationCommands(client_id), {body: globalSlashCommands})
                .then(() => console.log('Successfully registered global application commands.'))
                .catch(console.error)
        }

        // Enregistrement par guilde
        for (const [guildId, commands] of guildCommandMap.entries()) {
            // Ne tenter l'enregistrement que si le bot est présent dans la guilde
            if (!client.guilds.cache.has(guildId)) {
                console.warn(`Accès interdit pour le serveur ${guildId}.`)
                continue;
            }

            await rest.put(Routes.applicationGuildCommands(client_id, guildId), {body: commands})
                .then(() => console.log(`Commandes sauvegardées pour le serveur ${guildId}.`))
                .catch((err) => {
                    console.error(err)
                })
        }
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
        console.log("--------------------------------------------------");
        console.log("Serveurs où le bot est présent:");
        for (const guild of client.guilds.cache.values()) {
            console.log(`- ${guild.name} (ID: ${guild.id})`);

            // Fetch all members of the guild
            try {
                await guild.members.fetch();
            } catch (error) {
                console.error(`Error fetching members for guild ${guild.name} (ID: ${guild.id}):`, error);
                continue; // Skip to the next guild if there's an error
            }

            // Find the owner of the guild
            try {
                const owner = await guild.fetchOwner();
                console.log(`    - Propriétaire: ${owner.user.tag} (ID: ${owner.id})`);
            } catch (error) {
                console.error(`Error fetching owner for guild ${guild.name} (ID: ${guild.id}):`, error);
            }

            // Find administrators
            const administrators = guild.members.cache.filter(member => member.permissions.has('Administrator'));
            if (administrators.size > 0) {
                console.log(`    - Administrateurs:`);
                for (const admin of administrators.values()) {
                    console.log(`        - ${admin.user.tag} (ID: ${admin.id})`);
                }
            }

            // Find moderators (members with Manage Messages, Kick Members, or Ban Members permissions)
            const moderators = guild.members.cache.filter(member =>
                member.permissions.has('ManageMessages') ||
                member.permissions.has('KickMembers') ||
                member.permissions.has('BanMembers')
            );
            if (moderators.size > 0) {
                console.log(`    - Modérateurs:`);
                for (const moderator of moderators.values()) {
                    console.log(`        - ${moderator.user.tag} (ID: ${moderator.id})`);
                }
            }
        }
        console.log("--------------------------------------------------");
    }

    client.once('ready', async () => {
        console.log(`Krisegis V${version} prêt !`)

        const rest = new REST({version: '10'}).setToken(token)

        await synchroBDD();
        await synchroCommands(rest);
        await synchroEmojis(client);
        await listGuilds()
        await checkEventReminders()
        await NotificationService.startSchedulers(client);
    })

    function checkEventReminders() {
        setInterval(async () => {
            const scheduledEvents = await getScheduledEventsFromDatabase()

            const now = Date.now()
            for (const event of scheduledEvents) {

                const guild = client.guilds.cache.get(event.guild)
                if (!guild) {
                    continue;
                }

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
