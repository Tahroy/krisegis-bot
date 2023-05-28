const Variable = require('../database/Variable')
const Server = require('../database/Server')
const moment = require('moment')
const Event = require('../database/Event')
const Participant = require('../database/Participant')

module.exports = function (client) {
    async function getServers (guild) {
        var retour = []
        await Server.findAll({
            where: { guild: guild.id }
        }).then(async servers => {
            for (const server of servers) {
                // On cherche le nom du rôle
                server.role = guild.roles.cache.find(role => role.id === server.id)

                if (server.role) {
                    retour.push(server)
                }
            }
        })

        return retour
    }

    /**
     * Annonce publique
     * @returns {Promise<void>}
     */
    async function annoncerEvent (guildScheduledEvent, event) {
        const name = guildScheduledEvent.name
        const creatorID = guildScheduledEvent.creatorId
        const description = guildScheduledEvent.description
        const dateDebut = guildScheduledEvent.scheduledStartTimestamp
        const dateFin = guildScheduledEvent.scheduledEndTimestamp
        const location = guildScheduledEvent.entityMetadata.location
        const image = guildScheduledEvent.image
        const guild = guildScheduledEvent.guild

        const eventsChannelID = await Variable.findOne({
            where: { name: 'eventsChannel', server: guild.id }
        })
        const roleAlerteRPID    = await Variable.findOne({
            where: { name: 'alerteRP', server: guild.id }
        })
        if (!eventsChannelID || !roleAlerteRPID) {
            return
        }

        const eventChannel = client.channels.cache.get(eventsChannelID.data)
        const eventRole    = guildScheduledEvent.guild.roles.cache.get(roleAlerteRPID.data)

        const role = client.guilds.cache.get(guild.id).roles.cache.find(role => role.id === event.server)
        moment.locale('fr') // Définir la locale sur français

        const dateDebutFR = moment(dateDebut).format('LLLL') // Formater la date en format français
        const dateFinFR = moment(dateFin).format('LLLL') // Formater la date en format français

        const message = `Hey ${eventRole} ! Un évènement **${name}** est prévu sur **${role.name}** le **${dateDebutFR}** jusqu'à **${dateFinFR}** !\nPlus de détails dans la liste des évènements. N'hésitez pas à vous inscrire. :shariva:`
        await eventChannel.send(message, {
            allowedMentions: {
                roles: [eventRole.id]
            }
        })
    }

    async function ajouterEvent (guildScheduledEvent) {
        console.log('Ajouter event');
        const servers = await getServers(guildScheduledEvent.guild)

        const location = guildScheduledEvent.entityMetadata.location
        for (const server of servers) {
            const name = server.role.name.toLowerCase()
            if (location.toLowerCase().includes(name)) {
                return await Event.create({
                    id: guildScheduledEvent.id,
                    guild: guildScheduledEvent.guild.id,
                    server: server.id,
                    date: guildScheduledEvent.scheduledStartTimestamp,
                    recalled: false
                })
            }
        }
        return false
    }

    /**
     * Lorsqu'un évènement est modifié, on regarde si on l'a déjà sur Krisegis
     * - Si oui, on ne fait rien
     * - Sinon, on l'ajoute à la liste en BDD et on prévient le serveur
     *
     * @param guildScheduledEvent
     * @returns {Promise<void>}
     */
    async function updateEvent (guildScheduledEvent) {
        let isNew = true
        const guild = guildScheduledEvent.guild

        // On cherche l'évènement en BDD
        await Event.findOne({
            where: { guild: guild.id, id: guildScheduledEvent.id }
        }).then(async event => {
            if (event) {
                isNew = false
            }
        })

        // Il n'y est pas, donc on l'ajoute en BDD
        // Si la création réussit, on l'annonce dans le canal
        if (isNew) {
            const event = await ajouterEvent(guildScheduledEvent)

            if (event) {
                await annoncerEvent(guildScheduledEvent, event)
            }
        }
    }

    client.on('guildScheduledEventCreate', async (guildScheduledEvent) => {
        await updateEvent(guildScheduledEvent)
    })

    client.on('guildScheduledEventUpdate', async (oldGuildScheduledEvent, newGuildScheduledEvent) => {
        await updateEvent(newGuildScheduledEvent)
    })

    client.on('guildScheduledEventDelete', async (guildScheduledEvent) => {
        await Event.destroy({
            where: {
                id: guildScheduledEvent.id
            }
        });

        await Participant.destroy({
            where: {
                event: guildScheduledEvent.id
            }
        })
    })

    client.on('guildScheduledEventUserAdd', async (guildScheduledEvent, user) => {
        await updateEvent(guildScheduledEvent)

        addParticipant(guildScheduledEvent, user);
    })

    client.on('guildScheduledEventUserRemove', async (guildScheduledEvent, user) => {
        await updateEvent(guildScheduledEvent)

        removeParticipant(guildScheduledEvent, user);
    })

    /**
     * Ajoute un participant à l'évènement
     * @param guildScheduledEvent
     * @param user
     */
    function removeParticipant (guildScheduledEvent, user) {
        const eventID = guildScheduledEvent.id;
        const userID  = user.id;

        Participant.findOne({
            where: { id: userID, event: eventID }
        }).then(async participant => {
            if (participant) {
                await participant.destroy()
            }
        })
    }

    /**
     * Retire un participant de l'évènement
     * @param guildScheduledEvent
     * @param user
     */
    function addParticipant (guildScheduledEvent, user) {
        const eventID = guildScheduledEvent.id;
        const userID  = user.id;

        Participant.findOne({
            where: { id: userID, event: eventID }
        }).then(async participant => {
            if (!participant) {
                await Participant.create({
                    id: userID,
                    event: eventID
                })
            }
        })
    }
}

/*
 guildScheduledEventCreate: [guildScheduledEvent: GuildScheduledEvent];
  guildScheduledEventUpdate: [
    oldGuildScheduledEvent: GuildScheduledEvent | null,
    newGuildScheduledEvent: GuildScheduledEvent,
  ];
  guildScheduledEventDelete: [guildScheduledEvent: GuildScheduledEvent];
  guildScheduledEventUserAdd: [guildScheduledEvent: GuildScheduledEvent, user: User];
  guildScheduledEventUserRemove: [guildScheduledEvent: GuildScheduledEvent, user: User];
 */