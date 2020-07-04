// at the top of your file
const appRoot = require('app-root-path');
const Discord = require('discord.js');
const {
    version
} = require(`${appRoot}/config/config.json`);

module.exports = {
    name: 'membres',
    aliases: ['membres', 'membresliste', 'krisegiens'],
    description: 'Liste des membres de la Compagnie de Krisegis',
    execute(message, args) {
        // inside a command, event listener, etc.
        const exampleEmbed = new Discord.MessageEmbed()
            .setColor('YELLOW')
            .attachFiles([`${appRoot}/assets/krisegis-point.png`, `${appRoot}/assets/krisegis.png`])
            .setTitle('Liste des membres')
            .setURL('https://krisegis.fr/type_fiche/membre/')
            .setAuthor('Membres de la Compagnie de Krisegis', 'attachment://krisegis-point.png')
            .setDescription('Il existe actuellement 13 membres dans la Compagnie de Krisegis.')
            .addFields({
                name: 'Dirigeants (2)',
                value: 'Tahroy\nAluchtal',
                inline: true,
            }, {
                name: 'Experts (1)',
                value: 'Raven',
                inline: true
            }, {
                name: 'Confirmés (0)',
                value: '...',
                inline: true
            }, {
                name: 'Apprentis (6)',
                value: 'Ash\nAspaco\nJasina\nLinley\nWaf\nZaelya',
                inline: true
            }, {
                name: 'Recrues (4)',
                value: 'Hytori\nMaelys\nMela\nYunah-Marre',
                inline: true
            }, {
                name: '\u200B',
                value: '\u200B',
                inline: true
            })
            .setTimestamp()
            .setFooter(`Krisegis V${version}`, 'attachment://krisegis.png');

        message.channel.send(exampleEmbed);
    },
};