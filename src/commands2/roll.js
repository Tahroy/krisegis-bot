const {SlashCommandBuilder} = require('@discordjs/builders');

module.exports = {
    opts: {},
    data: new SlashCommandBuilder()
        .setName('roll')
        .setDescription('Lance des dés')
        .addStringOption(option =>
            option.setName("input")
                  .setDescription("<x>d<y> avec x le nombre de dés et y le nombre de faces")
                  .setRequired(true)
        ),
    async execute(interaction) {
        const input = interaction.options.getString('input').toLowerCase();

        if (input.indexOf('d') === -1) {
            return interaction.reply(`Il manque un « D » !`);
        }

        let infos = input.split('d');
        let nombre = parseInt(infos[0]);
        let faces = parseInt(infos[1]);

        if (infos.length !== 2) {
            return interaction.reply(`Toi tu n'as rien compris.`);
        }

        if (nombre === 0 || faces === 0) {
            return interaction.reply(`Toi tu n'as rien compris.`);
        }

        let lesDes = [];
        let resultat = 0;
        for (let i = 0; i < nombre; i++) {
            let result = Math.floor(Math.random() * faces) + 1;
            resultat += result;
            lesDes.push(result);
        }

        let reponse = '';
        reponse = lesDes.join(' + ');
        reponse += ' : **' + resultat + '**';

        return interaction.reply(reponse);
    },
};