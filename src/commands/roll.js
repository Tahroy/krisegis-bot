const {
    split,
    slice,
    indexOf
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

        args[0] = args[0].toLowerCase();
        let infos = args[0].split('d');
        let nombre = infos[0];
        let faces = infos[1];

        if (args[0].indexOf('d') === -1) {
            return message.channel.send(`Il manque un « D » !`);
        }

        if (infos.length != 2) {
            return message.channel.send(`Toi tu n'as rien compris.`);
        }

        if (parseInt(nombre) == 0 || parseInt(faces) == 0) {
            return message.channel.send(`Toi tu n'as rien compris.`);
        }

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