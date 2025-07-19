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
        const eventId = guildScheduledEvent.id
        console.log(`[ANNONCE GENERALE] Début annonce générale pour l'événement ${eventId}`)

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
            console.log(`[ANNONCE GENERALE] Annonce impossible pour l'événement ${eventId} - canal ou rôle non configuré`)
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

        try {
            await eventChannelGeneral.send(message, {
                allowedMentions: {
                    roles: [eventRoleGeneral.id]
                }
            })
            console.log(`[ANNONCE GENERALE] Annonce générale envoyée avec succès pour l'événement ${eventId}`)
        } catch (error) {
            console.error(`[ANNONCE GENERALE] Erreur lors de l'envoi de l'annonce générale pour l'événement ${eventId}:`, error)
        }

    }

    /**
     * Annonce uniquement sur un serveur
     * @param guildScheduledEvent
     * @param event
     * @returns {Promise<void>}
     */
    async function annoncerEventServeur (guildScheduledEvent, event) {
        const eventId = guildScheduledEvent.id
        console.log(`[ANNONCE SERVEUR] Début annonce serveur pour l'événement ${eventId}`)

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
            console.log(`[ANNONCE SERVEUR] Annonce impossible pour l'événement ${eventId} - rôle ou canal serveur non configuré`)
            return
        }
        const eventRoleServeur = guildScheduledEvent.guild.roles.cache.get(roleAlerteEventServeurID.data)

        moment.locale('fr') // Définir la locale sur français

        const dateDebutFR = `<t:${dateDebut}:F>`
        const dateFinFR = `<t:${dateFin}:F>`

        const message = `Hey ${eventRoleServeur} !
Un évènement **${name}** est prévu sur **${guildScheduledEvent.entityMetadata.location}** le **${dateDebutFR}** jusqu'à **${dateFinFR}** !
${link}`

        try {
            await channelServeur.send(message, {
                allowedMentions: {
                    roles: [eventRoleServeur.id]
                }
            })
            console.log(`[ANNONCE SERVEUR] Annonce serveur envoyée avec succès pour l'événement ${eventId}`)
        } catch (error) {
            console.error(`[ANNONCE SERVEUR] Erreur lors de l'envoi de l'annonce serveur pour l'événement ${eventId}:`, error)
        }
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
        const eventId = guildScheduledEvent.id

        console.log(`[UPDATE EVENT] Traitement de l'événement: ${guildScheduledEvent.name} (ID: ${eventId})`)

        // On vérifie qu'il n'est pas déjà dans derniersEvenements ou il y a plus de 30s
        if (derniersEvenements[eventId]) {
            const secondsAgo = moment().diff(derniersEvenements[eventId], 'seconds')
            if (secondsAgo < 30) {
                console.log(`[UPDATE EVENT] Ignorer - événement ${eventId} traité il y a ${secondsAgo} secondes`);
                return;
            }
            console.log(`[UPDATE EVENT] Événement ${eventId} déjà traité il y a ${secondsAgo} secondes, mais on continue car > 30s`)
        }

        if (!guildScheduledEvent.name || !guildScheduledEvent.scheduledStartTimestamp || !guildScheduledEvent.scheduledEndTimestamp) {
            console.log(`[UPDATE EVENT] Événement ${eventId} incomplet, ignoré`)
            return;
        }

        // On marque l'événement comme traité avant de continuer
        derniersEvenements[eventId] = moment();

        // On cherche l'évènement en BDD
        await Event.findOne({
            where: { guild: guild.id, id: guildScheduledEvent.id }
        }).then(async event => {
            if (event) {
                isNew = false
                console.log(`[UPDATE EVENT] Événement ${eventId} déjà existant en BDD, pas d'annonce nécessaire`)
            }
        })

        // Il n'y est pas, donc on l'ajoute en BDD
        // Si la création réussit, on l'annonce dans le canal
        if (isNew) {
            console.log(`[UPDATE EVENT] Nouvel événement ${eventId}, ajout en BDD et annonce`)

            const event = await ajouterEvent(guildScheduledEvent)
            if (event) {
                console.log(`[UPDATE EVENT] Événement ${eventId} ajouté avec succès, envoi des annonces`)
                await annoncerEventGeneral(guildScheduledEvent, event)
                await annoncerEventServeur(guildScheduledEvent, event)
                console.log(`[UPDATE EVENT] Annonces envoyées pour l'événement ${eventId}`)
            } else {
                console.log(`[UPDATE EVENT] Échec de l'ajout de l'événement ${eventId} en BDD`)
            }
        }
    }

    /**
     * Évènement créé
     */
    client.on('guildScheduledEventCreate', async (guildScheduledEvent) => {
        console.log(`[EVENT CREATE] ${guildScheduledEvent.name} (ID: ${guildScheduledEvent.id})`)
        await updateEvent(guildScheduledEvent)
    })

    /**
     * Évènement mis à jour
     */
    client.on('guildScheduledEventUpdate', async (oldGuildScheduledEvent, newGuildScheduledEvent) => {
        console.log(`[EVENT UPDATE] ${newGuildScheduledEvent.name} (ID: ${newGuildScheduledEvent.id})`)
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
