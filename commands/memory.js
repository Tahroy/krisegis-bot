const appRoot = require('app-root-path');
const {
    prefix,
    owner
} = require(`${appRoot}/config/config.json`);

var tuiles = [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [1, 2, 3, 4],
    [5, 6, 7, 8]
];

const etat = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
];

var points = 0;

const emotes = {
    '0': ':white_circle:',
    '1': ':boar:',
    '2': ':wolf:',
    '3': ':bird:',
    '4': ':cat:',
    '5': ':interrobang:',
    '6': ':bear:',
    '7': ':frog:',
    '8': ':eggplant:',
};

const nombres = {
    '0': ':zero:',
    '1': ':one:',
    '2': ':two:',
    '3': ':three:',
    '4': ':four:'
};

module.exports = {
    name: 'memory',
    description: 'Jeu de memory',
    usage: `<new> | <ligne-colonne> <ligne-colonne> (1-1 1-2 par exemple)`,
    time: 5000,
    execute(message, args) {
        if (!args.length) {
            return message.channel.send(getMap());
        }

        if (args[0] === 'new' && message.author.id === owner) {
            tuiles = shuffleBis([1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8]);
            tuiles = splitArray(tuiles, 4);

            for (let i = 0; i < etat.length; i++) {
                for (let j = 0; j < etat[i].length; j++) {
                    etat[i][j] = 0;
                }
            }
            points = 0;

            message.channel.send('Nouvelle map !');
            return message.channel.send(getMap());
        }

        if (args.length !== 2) {
            return message.reply(`Vous devez indiquer deux tuiles (« ${prefix}${module.exports.name} 1-1 1-2 » par exemple).`);
        }

        const choix1 = args[0].split('-');
        const choix2 = args[1].split('-');

        // On interdit de faire deux fois la même tuile
        if (args[0] === args[1]) {
            return message.reply('Il faut choisir deux tuiles différentes...');
        }

        // On vérifie que les choix sont valides
        if (etat[choix1[0] - 1][choix1[1] - 1] === undefined || etat[choix2[0] - 1][choix2[1] - 1] === undefined) {
            return message.channel.send(`L'une des deux tuiles n'existe pas !`);
        }

        if (etat[choix1[0] - 1][choix1[1] - 1] !== 0 || etat[choix2[0] - 1][choix2[1] - 1] !== 0) {
            return message.channel.send(`L'un des indices a déjà été trouvé !`);
        }

        const choix1Val = tuiles[choix1[0] - 1][choix1[1] - 1];
        const choix2Val = tuiles[choix2[0] - 1][choix2[1] - 1];

        etat[choix1[0] - 1][choix1[1] - 1] = choix1Val;
        etat[choix2[0] - 1][choix2[1] - 1] = choix2Val;


        if (choix1Val === choix2Val) {
            message.channel.send(getMap());
            points++;

            if (points === 8) {
                tuiles = shuffleBis([1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8]);
                tuiles = splitArray(tuiles, 4);

                for (let i = 0; i < etat.length; i++) {
                    for (let j = 0; j < etat[i].length; j++) {
                        etat[i][j] = 0;
                    }
                }
                points = 0;
                return message.reply('Vous avez réussi, bravo !');
            }

            return message.reply('Tu as trouvé une piste !');
        } else {
            message.channel.send(getMap())
                .then(msg => {
                    msg.delete({
                        timeout: 5000
                    })
                })
                .catch(console.error);


            etat[choix1[0] - 1][choix1[1] - 1] = 0;
            etat[choix2[0] - 1][choix2[1] - 1] = 0;

            return message.reply('Mais non, tu es mauvais !');
        }
    },
};

function getMap() {
    var map = ':zero: :one: :two: :three: :four:\n';
    var ligneActuelle = 0;
    for (const ligne of etat) {
        ligneActuelle++;
        map += nombres[ligneActuelle];
        for (const colonne of ligne) {
            map += ' ' + emotes[colonne];
        }
        map += '\n';
    }

    return map;
}

function shuffle(arguments) {
    for (var k = 0; k < arguments.length; k++) {
        var i = arguments[k].length;
        if (i == 0)
            return false;
        else {
            while (--i) {
                var j = Math.floor(Math.random() * (i + 1));
                var tempi = arguments[k][i];
                var tempj = arguments[k][j];
                arguments[k][i] = tempj;
                arguments[k][j] = tempi;
            }
            return arguments; // remove this line
        }
    }
    return arguments
}

function shuffleBis(array) {
    var currentIndex = array.length,
        temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

function splitArray(array, part) {
    var tmp = [];
    for (var i = 0; i < array.length; i += part) {
        tmp.push(array.slice(i, i + part));
    }
    return tmp;
}