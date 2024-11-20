"use strict";
const { debugMessage } = require('../utils/Utils');
module.exports = function (client) {
    client.on('guildMemberAdd', member => {
        if (member.guild.id) {
            const guild = member.guild;
            const userName = member.user.username;
            const message = "``" + userName + "`` a rejoint le serveur ``" + guild.name + "``";
            debugMessage(guild, message);
        }
    });
};
