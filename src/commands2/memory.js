const {SlashCommandBuilder} = require('@discordjs/builders');

module.exports = {
    opts: {},
    data: new SlashCommandBuilder()
        .setName('memory')
        .setDescription('Jeu du memory DOFUS')
        .addSubcommand(subcommand =>
            subcommand
                .setName('play')
                .setDescription("Veuillez choisir : ligne 1, colonne 1, ligne 2, colonne 2")
                .addIntegerOption(option => option
                    .setName("line1")
                    .setDescription("Ligne de la 1ère tuile")
                    .setRequired(true)
                    .addChoices(
                        {name: "1", value: 1},
                        {name: "2", value: 2},
                        {name: "3", value: 3},
                        {name: "4", value: 4},
                        {name: "5", value: 5},
                        {name: "6", value: 6},
                    )
                )
                .addIntegerOption(option => option
                    .setName("col1")
                    .setDescription("Colonne de la 1ère tuile")
                    .setRequired(true)
                    .addChoices(
                        {name: "1", value: 1},
                        {name: "2", value: 2},
                        {name: "3", value: 3},
                        {name: "4", value: 4},
                        {name: "5", value: 5},
                        {name: "6", value: 6},
                    )
                )
                .addIntegerOption(option => option
                    .setName("line2")
                    .setDescription("Ligne de la 2e tuile")
                    .setRequired(true)
                    .addChoices(
                        {name: "1", value: 1},
                        {name: "2", value: 2},
                        {name: "3", value: 3},
                        {name: "4", value: 4},
                        {name: "5", value: 5},
                        {name: "6", value: 6},
                    )
                )
                .addIntegerOption(option => option
                    .setName("col2")
                    .setDescription("Colonne de la 2e tuile")
                    .setRequired(true)
                    .addChoices(
                        {name: "1", value: 1},
                        {name: "2", value: 2},
                        {name: "3", value: 3},
                        {name: "4", value: 4},
                        {name: "5", value: 5},
                        {name: "6", value: 6},
                    )
                )),
    async execute(interaction) {
        const channel = interaction.channel;

        if (!this.channels[channel.id]) {
            this.initGame(channel);
        }

        switch (interaction.options.getSubcommand()) {
            case 'new':
                this.initGame(channel);
                channel.send('Nouvelle map !');
                return channel.send(this.getMap(channel));
            case 'play':
                await this.playGame(interaction);
                break;
            default:
                return channel.send(this.getMap(channel));
        }
    },
    tuiles: [],
    base: [
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
    ],
    emotes: {
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
    },
    nombres: {
        '0': ':zero:',
        '1': ':one:',
        '2': ':two:',
        '3': ':three:',
        '4': ':four:',
        '5': ':five:',
        '6': ':six:'
    },
    channels: {},
    initGame(channel) {
        let tuiles = [
            1, 2, 3, 4, 5, 6,
            7, 8, 9, 10, 11, 12,
            1, 2, 3, 4, 5, 6,
            7, 8, 9, 10, 11, 12,
            13, 14, 15, 16, 17, 18,
            13, 14, 15, 16, 17, 18,
        ];
        tuiles = this.shuffleBis(tuiles);
        tuiles = this.splitArray(tuiles, 6);
        this.channels[channel.id] = {
            etat: this.base,
            tuiles: tuiles,
            points: 0,
        };
    },
    shuffleBis(array) {
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
    },
    splitArray(array, part) {
        let tmp = [];
        for (let i = 0; i < array.length; i += part) {
            tmp.push(array.slice(i, i + part));
        }
        return tmp;
    },
    getMap(channel) {
        const id = channel.id;
        let map = ':zero: :one: :two: :three: :four: :five: :six:\n';
        let ligneActuelle = 0;
        let etat = this.channels[id].etat;
        for (const ligne of etat) {
            ligneActuelle++;
            map += this.nombres[ligneActuelle];
            for (const colonne of ligne) {
                map += ' ' + this.getEmoji(colonne, channel.client);
            }
            map += '\n';
        }

        return map;
    },
    getEmoji(colonne, client) {
        let myEmoji = this.emotes[colonne];
        if (myEmoji.indexOf(':') === -1) {
            let search = client.emojis.cache.find(emoji => emoji.name === myEmoji);
            if (search !== undefined) {
                myEmoji = '<:' + search.name + ':' + search.id + '>';
            }
        }

        return myEmoji;
    },
    playGame: async function (interaction) {
        const line1 = interaction.options.getInteger('line1') -1;
        const line2 = interaction.options.getInteger('line2') -1;
        const col1 = interaction.options.getInteger('col1') -1;
        const col2 = interaction.options.getInteger('col2') -1;

        if (line1 + " " + col1 === line2 + " " + col2) {
            return interaction.reply("Veuillez choisir deux tuiles différentes !");
        }

        let game = this.channels[interaction.channel.id];

        const tuile1 = game.etat[line1][col1];
        const tuile2 = game.etat[line2][col2];

        if (tuile1 === undefined || tuile2 === undefined) {
            interaction.channel.send(`Veuillez choisir des tuiles valides !`);
        }

        if (tuile1 !== 0 || tuile2 !== 0) {
            return interaction.channel.send(`L'un des indices a déjà été trouvé !`);
        }

        const choix1Val = game.tuiles[line1][col1];
        const choix2Val = game.tuiles[line2][col2];

        game.etat[line1][col1] = choix1Val;
        game.etat[line2][col2] = choix2Val;

        if (choix1Val === choix2Val) {
            interaction.channel.send(this.getMap(interaction.channel));
            game.points++;

            if (game.points === 18) {
                this.initGame(interaction.channel);
                return interaction.reply('Vous avez réussi, bravo !');
            }

            return interaction.reply('Tu as trouvé une piste !');
        } else {
            const map = this.getMap(interaction.channel);

            let msg = await interaction.channel.send(map);
            setTimeout(() => {
                msg.delete()
            }, 5000);

            game.etat[line1][col1] = 0;
            game.etat[line2][col2] = 0;

            return interaction.reply('Mais non, tu es mauvais !');
        }
    }
};