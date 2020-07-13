// at the top of your file
const appRoot = require('app-root-path');
const Discord = require('discord.js');
const {
    version
} = require(`${appRoot}/config/config.json`);

const axios = require('axios');
const config = {
    method: 'get',
    url: 'http://krisegis.fr/wp-json/krisegis/v1/membres',
    headers: {}
};


module.exports = {
    name: 'membres',
    aliases: ['membres', 'membresliste', 'krisegiens'],
    description: 'Liste des membres de la Compagnie de Krisegis',
    execute(message, args) {

        axios(config)
            .then(function (response) {
                const membres = (response.data);
                var rangs = {
                    'Dirigeant': [],
                    'Expert': [],
                    'Confirmé': [],
                    'Apprenti': [],
                    'Recrue': [],
                };

                for (const membre of membres) {
                    rangs[membre.rang].push(membre.name);
                }

                for (const rang in rangs) {
                    rangs[rang].push('\u200b');
                }

                // inside a command, event listener, etc.
                const exampleEmbed = new Discord.MessageEmbed()
                    .setColor('YELLOW')
                    .attachFiles([`${appRoot}/assets/krisegis-point.png`, `${appRoot}/assets/krisegis.png`])
                    .setTitle('Liste des membres')
                    .setURL('https://krisegis.fr/type_fiche/membre/')
                    .setAuthor('Membres de la Compagnie de Krisegis', 'attachment://krisegis-point.png')
                    .setDescription(`Il existe actuellement ${membres.length} membres dans la Compagnie de Krisegis.`)
                    .addFields({
                        name: `Dirigeants (${rangs.Dirigeant.length - 1})`,
                        value: `${rangs.Dirigeant.join('\n')}`,
                        inline: true,
                    }, {
                        name: `Experts (${rangs.Expert.length - 1})`,
                        value: `${rangs.Expert.join('\n')}`,
                        inline: true,
                    }, {
                        name: `Confirmés (${rangs.Confirmé.length - 1})`,
                        value: `${rangs.Confirmé.join('\n')}`,
                        inline: true,
                    }, {
                        name: `Apprentis (${rangs.Apprenti.length - 1})`,
                        value: `${rangs.Apprenti.join('\n')}`,
                        inline: true,
                    }, {
                        name: `Recrues (${rangs.Recrue.length - 1})`,
                        value: `${rangs.Recrue.join('\n')}`,
                        inline: true,
                    }, {
                        name: '\u200B',
                        value: '\u200B',
                        inline: true
                    })
                    .setTimestamp()
                    .setFooter(`Krisegis V${version}`, 'attachment://krisegis.png');

                message.channel.send(exampleEmbed);

            })
            .catch(function (error) {
                console.log(error);
            });
    },
};