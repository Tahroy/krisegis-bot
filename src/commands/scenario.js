const {SlashCommandBuilder} = require("discord.js");

module.exports = {
    opts: {},
    data: new SlashCommandBuilder()
        .setName('scenario')
        .setDescription('Gestion de scénarios aléatoires')
        .addSubcommand(subcommand =>
            subcommand
                .setName('random')
                .setDescription('Donne un scénario aléatoire')),
    async execute(interaction) {
        const scenario = this.getRandomScenario()
        const retour = 'Voici ton scénario !\n' +
            '**Thème** : ' + scenario.theme + '\n' +
            '**Zone** : ' + scenario.zone;

        return await interaction.reply(retour);
    },
    zones: [
        'Brâkmar',
        'Cimetière des Torturés',
        'Bonta',
        'Domaine des Fungus',
        'Volcan de Sidimote',
        'Astrub',
    ],
    themes: [
        'Amnésie',
        'Base cachée',
        'Chasse à l\'homme',
        'Chasse au trésor',
    ],
    getRandomScenario() {
        const theme = this.themes[Math.floor(Math.random() * this.themes.length)];
        const zone = this.zones[Math.floor(Math.random() * this.zones.length)];

        return {
            'theme': theme,
            'zone': zone
        };
    }
};