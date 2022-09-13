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
                if (auteurID[i] === victimeID[i])
                {
                    score += parseInt(auteurID[i]);
                }

                if (auteurID[i] === victimeID[i - 1])
                {
                    score += parseInt(auteurID[i]);
                }
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