const appRoot = require('app-root-path');
const {
    prefix,
    owner
} = require(`${appRoot}/config/config.json`);

var tuiles = [];

const etat = [
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
];

var points = 0;

const emotesHalouine = {
    0: ':white_circle:',
    1: ':jack_o_lantern:',
    2: ':ghost:',
    3: ':wolf:',
    4: ':smiling_imp:',
    5: ':japanese_goblin:',
    6: ':bat:',
    7: ':drop_of_blood:',
    8: ':skull:',
    9: ':dagger:',
    10: 'malmajeste',
    11: 'sad',
    12: 'oeuf_pourri',
    13: 'shigekax',
    14: 'slip',
    15: 'arakne_morte',
    16: 'sukette',
    17: 'bonbon_halouine',
    18: 'arakne',
};

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
    '4': ':four:',
    '5': ':five:',
    '6': ':six:'
};

module.exports = {
    name: 'memory',
    description: 'Jeu de memory',
    usage: `<new> | <ligne-colonne> <ligne-colonne> (1-1 1-2 par exemple)`,
    time: 5000,
    execute(message, args) {
        const client = message.client;

        if (tuiles.length === 0) {
            initGame();
        }

        if (!args.length) {
            return message.channel.send(getMap(client));
        }

        if (args[0] === 'new' && message.author.id === owner) {

            initGame();
            message.channel.send('Nouvelle map !');
            return message.channel.send(getMap(client));
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

        let line1 = parseInt(choix1[0] - 1);
        let col1 = parseInt(choix1[1] - 1);
        let line2 = parseInt(choix2[0] - 1);
        let col2 = parseInt(choix2[1] - 1);

        let etatCase1 = etat[line1][col1];
        let etatCase2 = etat[line2][col2];

        if (etatCase1 === undefined || etatCase2 === undefined) {
            return message.channel.send(`L'une des deux tuiles n'existe pas !`);
        }

        if (etatCase1 !== 0 || etatCase2 !== 0) {
            return message.channel.send(`L'un des indices a déjà été trouvé !`);
        }

        const choix1Val = tuiles[line1][col1];
        const choix2Val = tuiles[line2][col2];

        etat[line1][col1] = choix1Val;
        etat[line2][col2] = choix2Val;


        if (choix1Val === choix2Val) {
            message.channel.send(getMap(client));
            points++;

            if (points === 18) {
                initGame();
                return message.reply('Vous avez réussi, bravo !');
            }

            return message.reply('Tu as trouvé une piste !');
        } else {
            message.channel.send(getMap(client))
                .then(msg => {
                    msg.delete({
                        timeout: 5000
                    })
                })
                .catch(console.error);


            etat[line1][col1] = 0;
            etat[line2][col2] = 0;

            return message.reply('Mais non, tu es mauvais !');
        }
    },
};

function initGame() {
    tuiles = shuffleBis([
        1, 2, 3, 4, 5, 6,
        7, 8, 9, 10, 11, 12,
        1, 2, 3, 4, 5, 6,
        7, 8, 9, 10, 11, 12,
        13, 14, 15, 16, 17, 18,
        13, 14, 15, 16, 17, 18,
    ]);
    tuiles = splitArray(tuiles, 6);

    for (let i = 0; i < etat.length; i++) {
        for (let j = 0; j < etat[i].length; j++) {
            etat[i][j] = 0;
        }
    }
    points = 0;
}

function getMap(client) {
    var map = ':zero: :one: :two: :three: :four: :five: :six:\n';
    var ligneActuelle = 0;
    for (const ligne of etat) {
        ligneActuelle++;
        map += nombres[ligneActuelle];
        for (const colonne of ligne) {
            map += ' ' + getEmoji(colonne, client);
        }
        map += '\n';
    }

    return map;
}

function getEmoji(colonne, client) {
    var myEmoji = emotesHalouine[colonne];

    if (myEmoji.indexOf(':') === -1) {
        let search = client.emojis.cache.find(emoji => emoji.name === myEmoji);
        if (search !== undefined) {
            myEmoji = '<:' + search.name + ':' + search.id + '>';
        }
    }

    return myEmoji;
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