const {SlashCommandBuilder} = require('@discordjs/builders');
const axios = require('axios');
const config = {
    method: 'get',
    url: 'https://krisegis.fr/wp-json/krisegis/v1/membres',
    headers: {}
};

module.exports = {
    opts: {},
    data: new SlashCommandBuilder()
        .setName('membres')
        .setDescription('Donne la liste des membres de la guilde'),
    async execute(interaction) {

        function string_to_slug(str) {
            str = str.replace(/^\s+|\s+$/g, ''); // trim
            str = str.toLowerCase();

            // remove accents, swap ñ for n, etc
            const from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
            const to = "aaaaeeeeiiiioooouuuunc------";
            let i = 0, l = from.length;
            for (; i < l; i++) {
                str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
            }

            str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
                     .replace(/\s+/g, '-') // collapse whitespace and replace by -
                     .replace(/-+/g, '-'); // collapse dashes

            return str;
        }


        axios(config)
            .then(function (response) {
                const membres = (response.data);
                let rangs = {
                    'dirigeant': {
                        'membres': [],
                        'title': "Dirigeants"
                    },
                    'expert': {
                        'membres': [],
                        'title': "Experts"
                    },
                    'confirme': {
                        'membres': [],
                        'title': "Confirmés"
                    },
                    'apprenti': {
                        'membres': [],
                        'title': "Apprentis"
                    },
                    'recrue': {
                        'membres': [],
                        'title': "Recrues"
                    },
                };

                for (const membre of membres) {
                    const rang = string_to_slug(membre.rang);
                    rangs[rang].membres.push(`[${membre.name}](${membre.permalink})`);
                }

                for (const rang in rangs) {
                    rangs[rang].membres.push('\u200b');
                }

                const fields = [{
                    name: `Dirigeants (${rangs.dirigeant.membres.length - 1})`,
                    value: `${rangs.dirigeant.membres.join('\n')}`,
                    inline: true,
                }, {
                    name: `Experts (${rangs.expert.membres.length - 1})`,
                    value: `${rangs.expert.membres.join('\n')}`,
                    inline: true,
                }, {
                    name: `Confirmés (${rangs.confirme.membres.length - 1})`,
                    value: `${rangs.confirme.membres.join('\n')}`,
                    inline: true,
                }, {
                    name: `Apprentis (${rangs.apprenti.membres.length - 1})`,
                    value: `${rangs.apprenti.membres.join('\n')}`,
                    inline: true,
                }, {
                    name: `Recrues (${rangs.recrue.membres.length - 1})`,
                    value: `${rangs.recrue.membres.join('\n')}`,
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

                interaction.channel.send({embeds: data.embeds, files: data.files});


                return interaction.reply('Voilà les plus beaux !');
            });
    }
};