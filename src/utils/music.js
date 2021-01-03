module.exports = {

    execute(client) {
        // Then add some messages that will be sent when the events will be triggered
        client.player

        // Send a message when a track starts
            .on('trackStart', (message, track) => message.channel.send(`Lancement de ${track.title}...`))

        // Send a message when something is added to the queue
        .on('trackAdd', (message, queue, track) => message.channel.send(`${track.title} a été ajoutée à la queue`))
            .on('playlistAdd', (message, queue, playlist) => message.channel.send(`${playlist.title} a été ajoutée à la queue (${playlist.items.length} musiques) !`))

        // Send messages to format search results
        .on('searchResults', (message, query, tracks) => {

                const embed = new Discord.MessageEmbed()
                    .setAuthor(`Voici les résultats pour : ${query}!`)
                    .setDescription(tracks.map((t, i) => `${i}. ${t.title}`))
                    .setFooter('Indiquez le numéro de la musique : ')
                message.channel.send(embed);

            })
            .on('searchInvalidResponse', (message, query, tracks, content, collector) => message.channel.send(`Vous devez indiquer un numéro valide entre 1 et ${tracks.length} !`))
            .on('searchCancel', (message, query, tracks) => message.channel.send('Votre réponse est invalide.'))
            .on('noResults', (message, query) => message.channel.send(`Aucun résultat pour ${query}...`))

        // Send a message when the music is stopped
        .on('queueEnd', (message, queue) => message.channel.send('La musique est finie, la queue est vide.'))
            .on('channelEmpty', (message, queue) => message.channel.send('La musique s\'arrête, le canal vocal est vide. :('))
            .on('botDisconnect', (message) => message.channel.send('Hey ! On m\'a déco :('))

        // Error handling
        .on('error', (error, message) => {
            switch (error) {
                case 'NotPlaying':
                    message.reply('Aucune musique en cours.')
                    break;
                case 'NotConnected':
                    message.reply('Vous n\'êtes pas sur un canal vocal valide.')
                    break;
                case 'UnableToJoin':
                    message.reply('Mais... je n\'ai pas le droit de te rejoindre en vocal ! :(')
                    break;
                default:
                    message.reply(`Burp, j'ai trop bu je crois... Error: ${error}`)
            }
        })
    }
}