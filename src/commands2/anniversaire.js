const {SlashCommandBuilder} = require('@discordjs/builders');

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

        console.log(day, month, year);

        const anniversaire = {
            user: membre.id,
            server: interaction.guild.id,
            day: day,
            month: month,
            year: year
        };

        console.log(anniversaire);
    },
};