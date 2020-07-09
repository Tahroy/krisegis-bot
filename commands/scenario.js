const themes = [
    'Amnésie',
    'Base cachée',
    'Chasse à l\'homme',
    'Chasse au trésor',
];

const zones = [
    'Brâkmar',
    'Cimetière des Torturés',
    'Bonta',
    'Domaine des Fungus',
    'Volcan de Sidimote',
    'Astrub',
];

module.exports = {
    name: 'scenario',
    description: 'Donne un scénario ou permet de régler des paramètres',
    usage: 'random',
    args:1,
    execute(message, args) {
        switch (args[0]) {
            case 'random' :
                let scenario = getRandomScenario();
                message.reply('Voici ton scénario !\n' +
                    '**Thème** : ' + scenario.theme + '\n' +
                    '**Zone** : ' + scenario.zone);
                break;
        }
    },
};

/**
 *
 * @returns {{zone: string, theme: (string)}}
 */
function getRandomScenario() {
    const theme = themes[Math.floor(Math.random() * themes.length)];
    const zone = zones[Math.floor(Math.random() * zones.length)];

    return {
        'theme':theme,
        'zone':zone
    };
}