const {SlashCommandBuilder} = require('@discordjs/builders');

module.exports = {
    opts: {},
    data: new SlashCommandBuilder()
        .setName('love')
        .setDescription('Test d\'amour')
        .addUserOption(option => option
            .setName("victime")
            .setDescription("Choisir la victime")
            .setRequired(true)),
    async execute(interaction) {

        function calculAmour(victimeID, auteurID) {
            let score = 0;

            for (let i = 0; i < auteurID.length; ++i)
            {
                let plus = parseInt(auteurID[i]);

                if (auteurID[i] === victimeID[i])
                {
                    plus = parseInt(auteurID[i]) * 3;
                }

                if (auteurID[i] === victimeID[0])
                {
                    plus = parseInt(auteurID[i]) * 10;
                }

                score += plus;
            }

            return score;
        }

        const victime = interaction.options.getUser('victime');
        const victimeID = victime.id;
        const auteur = interaction.user;
        const auteurID = auteur.id;

        const amour = calculAmour(victimeID, auteurID);
        interaction.reply(`:heart: Amour entre <@${victimeID}> et <@${auteurID}> : ${amour} % :heart:`);
    },
};