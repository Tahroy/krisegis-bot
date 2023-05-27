const {version} = require('./../../config/config.json');
const Variable = require("../database/Variable");
const Server = require("../database/Server");
const { REST } = require('@discordjs/rest')
const { token, client_id } = require('../../config/config.json')
const { Routes } = require('discord-api-types/v9')

module.exports = async function (client) {
    client.once('ready', async () => {
        console.log(`Krisegis V${version} prêt !`);
        await Variable.sync();
        await Server.sync();

        const rest = new REST({ version: '10' }).setToken(token);

        // Clean des commandes guilds
        const guilds = client.guilds.cache.map(guild => guild.id);

        let slashCommands = [];
        slashCommands = slashCommands.map(command => command.toJSON());

        for (const guild of guilds)
        {
            rest.put(Routes.applicationGuildCommands(client_id, guild), {body: slashCommands})
                .then(() => console.log('Successfully registered application commands.'))
                .catch(console.error);
        }
        console.log(guilds);

        // Commandes générales
        for (const command of client.commands) {
            const commandData = command[1];

            if (!commandData.description) {
                commandData.description = "- Sans description";
            }
            let slashCommand = commandData.data;
            slashCommands.push(slashCommand);
        }
        slashCommands = slashCommands.map(command => command.toJSON());

        await rest.put(
            Routes.applicationCommands(client_id),
            { body: slashCommands },
        ).then(() => console.log('Successfully registered application commands.')).catch(
            console.error,
        );
    });
}