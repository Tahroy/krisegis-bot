const {
    split,
    slice
} = require("ffmpeg-static");
const {
    info
} = require("winston");

module.exports = {
    name: 'roll',
    aliases: ['r', 'dice'],
    description: 'Lance des dés !',
    usage: `<nombre>d<faces>`,
    args: 1,
    execute(message, args) {
        let reponse = '';

        let infos = args[0].split('d');
        let nombre = infos[0];
        let faces = infos[1];

        let lesDes = [];
        let resultat = 0;
        for (let i = 0; i < nombre; i++) {
            let result = Math.floor(Math.random() * faces) + 1;
            resultat += result;
            lesDes.push(result);
        }

        reponse = lesDes.join(' + ');

        reponse += ' : *' + resultat + '*';

        message.reply(reponse);
    },
};