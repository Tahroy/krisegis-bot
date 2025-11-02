import type { GuildScheduledEvent, User } from 'discord.js';
import type KrisegisClient from '../models/KrisegisClient';
import EventService from '../services/EventService';

module.exports = function (client: KrisegisClient) {
    const service = new EventService(client);

    // Évènement créé
    client.on('guildScheduledEventCreate', (guildScheduledEvent) => {
        void (async () => { await service.updateEvent(guildScheduledEvent as GuildScheduledEvent); })();
    });

    // Évènement mis à jour
    client.on('guildScheduledEventUpdate', (oldGuildScheduledEvent, newGuildScheduledEvent) => {
        void (async () => { await service.updateEvent(newGuildScheduledEvent as GuildScheduledEvent); })();
    });

    // Évènement supprimé
    client.on('guildScheduledEventDelete', (guildScheduledEvent) => {
        void (async () => { await service.handleDelete(guildScheduledEvent as GuildScheduledEvent); })();
    });

    // Un utilisateur rejoint un évènement
    client.on('guildScheduledEventUserAdd', (guildScheduledEvent, user) => {
        void (async () => { await service.addParticipant(guildScheduledEvent as GuildScheduledEvent, user as User); })();
    });

    // Un utilisateur quitte un évènement
    client.on('guildScheduledEventUserRemove', (guildScheduledEvent, user) => {
        void (async () => { await service.removeParticipant(guildScheduledEvent as GuildScheduledEvent, user as User); })();
    });
};
