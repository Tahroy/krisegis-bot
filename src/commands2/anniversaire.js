const {SlashCommandBuilder} = require('@discordjs/builders');
const Anniversaire = require("../database/Anniversaire");
const cron = require("node-cron");
const Variable = require("../database/Variable");

module.exports = {
    opts: {},
    data: new SlashCommandBuilder()
        .setName('anniversaire')
        .setDescription('Ajoute ou retire un anniversaire')
        .addUserOption(option =>
            option.setName('membre')
                  .setDescription('Membre concerné')
                  .setRequired(true))
        .addStringOption(option =>
            option.setName('date')
                  .setDescription('Date de l\'anniversaire')
                  .setRequired(true)),

    async execute(interaction) {
        const membre = interaction.options.getUser('membre');
        let date = interaction.options.getString('date');

        date = date.replaceAll('.', '-');
        date = date.replaceAll('/', '-');

        let values = date.split('-');

        const day = values[0];
        const month = values[1];
        const year = values[2];

        const champs = {
            userId: membre.id,
            date: year + '-' + month + '-' + day,
            server: interaction.guild.id,
        };

        await Anniversaire.create(champs);
        interaction.reply(`Anniversaire ajouté pour ${membre.username}`);


        const channelVariable = Variable.findOne({where: {name: 'birthdayChannel', server: interaction.guild.id}});

        if (channelVariable)
        {
            const cible = ('<@!' + membre.id + '>');
            const channel = interaction.guild.channels.cache.get(channelID.get('data'));

            cron.schedule(`* * ${day} ${month} *`, () => {
                channel.send(`Today's ${cible} birthday, congratulations!`);
            }, 'Europe/Paris');
        }
    },
};