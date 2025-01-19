import {Client} from "discord.js";

module.exports = function (client: Client) {
    client.on('guildCreate', (guild) => {
        console.log(`Un nouveau serveur a été ajouté : ${guild.name} (ID: ${guild.id})`)
    })
}