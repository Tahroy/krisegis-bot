const moment = require('moment')
const Event = require('../models/Event').default;
const Participant = require('../models/Participant').default;
const Server = require('../models/Server').default;
const Variable = require('../models/Variable').default;

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
    async function annoncerEventGeneral (guildScheduledEvent, event) {
        const name = guildScheduledEvent.name
        const dateDebut = Math.floor(guildScheduledEvent.scheduledStartTimestamp / 1000)
        const dateFin = Math.floor(guildScheduledEvent.scheduledEndTimestamp / 1000)
        const guild = guildScheduledEvent.guild
        const link = guildScheduledEvent.url

        const role = client.guilds.cache.get(guild.id).roles.cache.find(role => role.id === event.server)

        // On annonce sur le canal général
        const eventsChannelID = await Variable.findOne({
            where: { name: 'eventsChannel', server: guild.id }
        })
        const roleAlerteEventGeneraleID = await Variable.findOne({
            where: { name: 'alerte_event_generale', server: guild.id }
        })

        if (!eventsChannelID || !roleAlerteEventGeneraleID) {
            return
        }

        const eventChannelGeneral = client.channels.cache.get(eventsChannelID.data)
        const eventRoleGeneral = guildScheduledEvent.guild.roles.cache.get(roleAlerteEventGeneraleID.data)

        moment.locale('fr') // Définir la locale sur français

        const dateDebutFR = `<t:${dateDebut}:F>`
        const dateFinFR = `<t:${dateFin}:F>`

        const message = `Hey ${eventRoleGeneral} !
Un évènement **${name}** est prévu sur **${guildScheduledEvent.entityMetadata.location}** le **${dateDebutFR}** jusqu'à **${dateFinFR}** !
${link}`

        await eventChannelGeneral.send(message, {
            allowedMentions: {
                roles: [eventRoleGeneral.id]
            }
        })

    }

    /**
     * Annonce uniquement sur un serveur
     * @param guildScheduledEvent
     * @param event
     * @returns {Promise<void>}
     */
    async function annoncerEventServeur (guildScheduledEvent, event) {
        const name = guildScheduledEvent.name
        const dateDebut = Math.floor(guildScheduledEvent.scheduledStartTimestamp / 1000)
        const dateFin = Math.floor(guildScheduledEvent.scheduledEndTimestamp / 1000)
        const guild = guildScheduledEvent.guild
        const link = guildScheduledEvent.url

        const role = client.guilds.cache.get(guild.id).roles.cache.find(role => role.id === event.server)

        const server = await Server.findOne({
            where: { id: event.server }
        })
        const roleAlerteEventServeurID = await Variable.findOne({
            where: { name: 'alerte_event_serveur', server: guild.id }
        })

        const channelServeur = client.channels.cache.find(channel => channel.id === server.channel)

        if (!roleAlerteEventServeurID || !channelServeur) {
            console.log('Il manque le rôle ou le channel serveur')
            return
        }
        const eventRoleServeur = guildScheduledEvent.guild.roles.cache.get(roleAlerteEventServeurID.data)

        moment.locale('fr') // Définir la locale sur français

        const dateDebutFR = `<t:${dateDebut}:F>`
        const dateFinFR = `<t:${dateFin}:F>`

        const message = `Hey ${eventRoleServeur} !
Un évènement **${name}** est prévu sur **${guildScheduledEvent.entityMetadata.location}** le **${dateDebutFR}** jusqu'à **${dateFinFR}** !
${link}`

        await channelServeur.send(message, {
            allowedMentions: {
                roles: [eventRoleServeur.id]
            }
        })
    }

    async function ajouterEvent (guildScheduledEvent) {
        const servers = await getServers(guildScheduledEvent.guild)

        const location = guildScheduledEvent.entityMetadata.location.toLowerCase()
        for (const server of servers) {
            const name = server.role.name.toLowerCase()
            if (location.toLowerCase().includes(name)) {
                return await Event.create({
                    id: guildScheduledEvent.id,
                    guild: guildScheduledEvent.guild.id,
                    server: server.id,
                    date: guildScheduledEvent.scheduledStartTimestamp,
                    recalled: false,
                    name: guildScheduledEvent.name,
                    description: guildScheduledEvent.description,
                    serverName: name
                })
            }
        }
        return false
    }

    /**
     * Liste avec ID event en clef et timestamp en valeur
     */
    let derniersEvenements = [];

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

        // On vérifie qu'il n'est pas déjà dans derniersEvenements ou il y a plus de 5s
        if (derniersEvenements[guildScheduledEvent.id]) {
            if (moment().diff(derniersEvenements[guildScheduledEvent.id], 'seconds') < 5) {
                console.log('on ignore');
                return;
            }
        }
        guild.scheduledEvents.cache.clear();
        const event = guild.scheduledEvents.cache.get(guildScheduledEvent.id);

        if (!guildScheduledEvent.name || !guildScheduledEvent.scheduledStartTimestamp || !guildScheduledEvent.scheduledEndTimestamp) {
            return;
        }

        derniersEvenements[guildScheduledEvent.id] = moment();

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
            console.log('Nouvel évènement')
            console.log(guildScheduledEvent)

            const event = await ajouterEvent(guildScheduledEvent)
            if (event) {
                await annoncerEventGeneral(guildScheduledEvent, event)
                await annoncerEventServeur(guildScheduledEvent, event)
            }
        }
    }

    /**
     * Évènement créé
     */
    client.on('guildScheduledEventCreate', async (guildScheduledEvent) => {
        console.log(guildScheduledEvent.name + ' creé')
        await updateEvent(guildScheduledEvent)
    })

    /**
     * Évènement mis à jour
     */
    client.on('guildScheduledEventUpdate', async (oldGuildScheduledEvent, newGuildScheduledEvent) => {
        console.log(oldGuildScheduledEvent, newGuildScheduledEvent);
        // console.log(oldGuildScheduledEvent.name + ' mis à jour')
        await updateEvent(newGuildScheduledEvent)
    })

    /**
     * Évènement supprimé
     */
    client.on('guildScheduledEventDelete', async (guildScheduledEvent) => {
        console.log(guildScheduledEvent.name + ' supprimé')
        await Event.destroy({
            where: {
                id: guildScheduledEvent.id
            }
        })

        await Participant.destroy({
            where: {
                event: guildScheduledEvent.id
            }
        })
    })

    /**
     * Un utilisateur rejoint un évènement
     */
    client.on('guildScheduledEventUserAdd', async (guildScheduledEvent, user) => {
        console.log(guildScheduledEvent.url)
        console.log("User ajouté");
      //  await updateEvent(guildScheduledEvent)

        addParticipant(guildScheduledEvent, user)
    })

    /**
     * Un utilisateur quitte un évènement
     */
    client.on('guildScheduledEventUserRemove', async (guildScheduledEvent, user) => {
        console.log("User retiré");
    //    await updateEvent(guildScheduledEvent)

        await removeParticipant(guildScheduledEvent, user)
    })

    /**
     * Ajoute un participant à l'évènement
     * @param guildScheduledEvent
     * @param user
     */
    function removeParticipant (guildScheduledEvent, user) {
        const eventID = guildScheduledEvent.id
        const userID = user.id

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
        const eventID = guildScheduledEvent.id
        const userID = user.id

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