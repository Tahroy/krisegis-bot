// at the top of your file
const appRoot = require('app-root-path');
const Discord = require('discord.js');
const {
    version
} = require(`${appRoot}/config/config.json`);

const axios = require('axios');
const {MessageAttachment} = require("discord.js");
const config = {
    method: 'get',
    url: 'https://krisegis.fr/wp-json/krisegis/v1/membres',
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
                    rangs[membre.rang].push(`[${membre.name}](${membre.permalink})`);
                }

                for (const rang in rangs) {
                    rangs[rang].push('\u200b');
                }

                const fields = [{
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
                }];

                const author = 'Liste des membres de la Compagnie de Krisegis';

                const embedData = require('../utils/embed');

                const data = embedData.get(fields, {
                    url: 'https://krisegis.fr/type_fiche/membre/',
                    title: 'Liste des membres',
                    description: `Il existe actuellement ${membres.length} membres dans la Compagnie de Krisegis.`,
                    author: author
                })

                message.channel.send({embeds: data.embeds, files: data.files});

            })
            .catch(function (error) {
                console.log(error);
            });
    },
};