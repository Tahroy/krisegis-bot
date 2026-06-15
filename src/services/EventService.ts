import dayjs, { type Dayjs } from 'dayjs';
import type {Guild, GuildScheduledEvent, Role, TextChannel, User} from 'discord.js';
import type KrisegisClient from '../models/KrisegisClient';
import Event from '../models/Event';
import Participant from '../models/Participant';
import Server from '../models/Server';
import Variable from '../models/Variable';

export default class EventService {

    private client: KrisegisClient;

    // Liste avec ID event en clef et timestamp en valeur (anti-spam)
    private derniersEvenements: Record<string, Dayjs> = {};

    constructor(client: KrisegisClient) {
        this.client = client;
    }

    private async getServers(guild: Guild): Promise<(Server & { role?: Role | null })[]> {
        type ServerWithRole = Server & { role?: Role | null };
        const retour: ServerWithRole[] = [];

        await Server.findAll({where: {guild: guild.id}}).then(async (servers) => {
            for (const server of servers) {
                const withRole: ServerWithRole = server as ServerWithRole;

                // On cherche le nom du rôle
                withRole.role = guild.roles.cache.find((role) => role.id === server.id) ?? null;

                if (withRole.role) {
                    retour.push(withRole);
                }
            }
        });

        return retour;
    }

    async annoncerEventGeneral(guildScheduledEvent: GuildScheduledEvent, event: Event) {
        const eventId = guildScheduledEvent.id;
        console.log(`[ANNONCE GENERALE] Début annonce générale pour l'événement ${eventId}`);

        const guild = guildScheduledEvent.guild;

        if (!guild) {
            return;
        }

        // Si c'est un serveur DT, on passe cette alerte
        const server = await Server.findOne({where: {id: event.server}});
        if (server && ['313669058526576641', '1113468001392541775'].includes(server.game ?? '')) {
            return;
        }

        // On annonce sur le canal général
        const eventsChannelID = await Variable.findOne({where: {name: 'eventsChannel', server: guild.id}});

        if (!eventsChannelID) {
            console.log(`[ANNONCE GENERALE] Annonce impossible pour l'événement ${eventId} - canal non configuré`);
            return;
        }

        const channelGeneral = this.client.channels.cache.get(eventsChannelID.data);

        if (!channelGeneral || !channelGeneral.isTextBased()) {
            return;
        }

        let roleGeneral = true;
        let roleServeur = false;

        if (event.serverName === 'DOFUS') {
            roleServeur = true;
        }

        const message = await this.createMessage(guildScheduledEvent, roleGeneral, roleServeur);

        if (!message) {
            return;
        }

        try {
            await (channelGeneral as TextChannel).send({content: message});
            console.log(`[ANNONCE GENERALE] Annonce générale envoyée avec succès pour l'événement ${eventId}`);
        } catch (error) {
            console.error(`[ANNONCE GENERALE] Erreur lors de l'envoi de l'annonce générale pour l'événement ${eventId}:`, error);
        }
    }

    async annoncerEventServeur(guildScheduledEvent: GuildScheduledEvent, event: Event) {
        const eventId = guildScheduledEvent.id;
        console.log(`[ANNONCE SERVEUR] Début annonce serveur pour l'événement ${eventId}`);

        const guild = guildScheduledEvent.guild;

        if (!guild) {
            return;
        }

        const server = await Server.findOne({where: {id: event.server}});
        const channelServeur = this.client.channels.cache.find((channel) => channel.id === server?.channel);

        if (!channelServeur?.isTextBased()) {
            console.log(`[ANNONCE SERVEUR] Canal serveur non textuel ou introuvable pour l'événement ${eventId}`);
            return;
        }

        let roleGeneral = false;
        let roleServeur = true;

        console.log(server?.game);
        if (['313669058526576641', '1113468001392541775'].includes(server?.game ?? '')) {
            roleGeneral = true;
        }

        const message = await this.createMessage(guildScheduledEvent, roleGeneral, roleServeur);

        if (!message) {
            return;
        }

        try {
            await (channelServeur as TextChannel).send({content: message});
            console.log(`[ANNONCE SERVEUR] Annonce serveur envoyée avec succès pour l'événement ${eventId}`);
        } catch (error) {
            console.error(`[ANNONCE SERVEUR] Erreur lors de l'envoi de l'annonce serveur pour l'événement ${eventId}:`, error);
        }
    }

    async ajouterEvent(guildScheduledEvent: GuildScheduledEvent): Promise<Event | null> {
        const guild = guildScheduledEvent.guild;

        if (!guild) {
            return null;
        }

        const servers = await this.getServers(guild);

        const location = (guildScheduledEvent.entityMetadata?.location ?? '').toLowerCase();

        for (const server of servers) {

            const name = server.role?.name?.toLowerCase?.() ?? '';

            if (!location.toLowerCase().includes(name)) {
                continue;
            }

            return await Event.create({
                id: guildScheduledEvent.id,
                guild: guild.id,
                server: server.id,
                date: guildScheduledEvent.scheduledStartTimestamp ?? Date.now(),
                recalled: false,
                name: guildScheduledEvent.name ?? '',
                description: guildScheduledEvent.description ?? null,
                serverName: name
            });
        }

        if (location.toLowerCase().includes('dofus') || location.toLowerCase().includes('forum')) {
            return await Event.create({
                id: guildScheduledEvent.id,
                guild: guild.id,
                server: null,
                serverName: "DOFUS",
                date: guildScheduledEvent.scheduledStartTimestamp ?? Date.now(),
                recalled: false,
                name: guildScheduledEvent.name ?? '',
            })
        }

        return null;
    }

    async updateEvent(guildScheduledEvent: GuildScheduledEvent) {
        const guild = guildScheduledEvent.guild;
        if (!guild) {
            return;
        }

        const eventId = guildScheduledEvent.id;

        console.log(`[UPDATE EVENT] Traitement de l'événement: ${guildScheduledEvent.name} (ID: ${eventId})`);

        // On vérifie qu'il n'est pas déjà dans derniersEvenements
        if (this.derniersEvenements[eventId]) {
            const secondsAgo = dayjs().diff(this.derniersEvenements[eventId], 'seconds');
            if (secondsAgo < 30) {
                console.log(`[UPDATE EVENT] Ignorer - événement ${eventId} traité il y a ${secondsAgo} secondes`);
                return;
            }
            console.log(`[UPDATE EVENT] Événement ${eventId} déjà traité il y a ${secondsAgo} secondes, mais on continue car > 30s`);
        }

        // On marque l'événement comme traité avant de continuer
        this.derniersEvenements[eventId] = dayjs();

        // On cherche l'évènement en BDD
        await Event.findOne({where: {guild: guild.id, id: guildScheduledEvent.id}}).then(async (event) => {
            if (event) {
                console.log(`[UPDATE EVENT] Événement ${eventId} déjà existant en BDD, pas d'annonce nécessaire`);
                return;
            }
        });

        console.log(`[UPDATE EVENT] Nouvel événement ${eventId}, ajout en BDD et annonce`);

        const event = await this.ajouterEvent(guildScheduledEvent);

        if (event) {
            console.log(`[UPDATE EVENT] Événement ${eventId} ajouté avec succès, envoi des annonces`);
            await this.annoncerEventGeneral(guildScheduledEvent, event);
            await this.annoncerEventServeur(guildScheduledEvent, event);

            console.log(`[UPDATE EVENT] Annonces envoyées pour l'événement ${eventId}`);
        } else {
            console.log(`[UPDATE EVENT] Échec de l'ajout de l'événement ${eventId} en BDD`);
        }
    }

    async handleDelete(guildScheduledEvent: GuildScheduledEvent) {
        const name = guildScheduledEvent.name ?? 'inconnu';
        console.log(`${name} supprimé`);
        await Event.destroy({where: {id: guildScheduledEvent.id}});
        await Participant.destroy({where: {event: guildScheduledEvent.id}});
    }

    async removeParticipant(guildScheduledEvent: GuildScheduledEvent, user: User) {
        const eventID = guildScheduledEvent.id;
        const userID = user.id;

        Participant.findOne({where: {id: userID, event: eventID}}).then(async (participant) => {
            if (participant) {
                await participant.destroy();
            }
        });
    }

    async addParticipant(guildScheduledEvent: GuildScheduledEvent, user: User) {
        const eventID = guildScheduledEvent.id;
        const userID = user.id;

        Participant.findOne({where: {id: userID, event: eventID}}).then(async (participant) => {
            if (!participant) {
                await Participant.create({id: userID, event: eventID});
            }
        });
    }

    private async createMessage(
        guildScheduledEvent: GuildScheduledEvent,
        roleGeneral: boolean = false,
        roleServeur: boolean = false
    ): Promise<string | null> {
        const guild = guildScheduledEvent.guild;

        if (!guild) {
            return null;
        }

        const roleAlerteEventGeneralID = await Variable.findOne({where: {name: 'alerte_event_generale', server: guild.id}});
        const roleAlerteEventServeurID = await Variable.findOne({where: {name: 'alerte_event_serveur', server: guild.id}});

        if (!roleAlerteEventGeneralID || !roleAlerteEventServeurID) {
            return null;
        }

        const eventRoleGeneral = guild.roles.cache.get(roleAlerteEventGeneralID.data);
        const eventRoleServeur = guild.roles.cache.get(roleAlerteEventServeurID.data);

        if (!eventRoleGeneral || !eventRoleServeur ) {
            return null;
        }

        const roles: string[] = [];

        if (roleGeneral) {
            roles.push(String(eventRoleGeneral))
        }
        if (roleServeur) {
            roles.push(String(eventRoleServeur))
        }


        const dateDebut = Math.floor((guildScheduledEvent.scheduledStartTimestamp ?? 0) / 1000);
        const dateFin = Math.floor((guildScheduledEvent.scheduledEndTimestamp ?? 0) / 1000);



        const dateDebutFR = `<t:${dateDebut}:F>`;
        const dateFinFR = `<t:${dateFin}:F>`;
        const location = guildScheduledEvent.entityMetadata?.location ?? 'inconnu';
        const name = guildScheduledEvent.name;
        const link = guildScheduledEvent.url;

        const startMessage = `Hey ${roles.join(' / ')} !`;

        return`${startMessage}\nUn évènement **${name}** est prévu sur **${location}** le **${dateDebutFR}** jusqu'à **${dateFinFR}** !\n${link}`;
    }
}
