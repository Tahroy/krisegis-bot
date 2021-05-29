module.exports = {
    name: 'larve',
    description: 'Jeu des larves',
    usage: 'new <nb> | go | play',
    partiesEnAttente: [],
    partiesEnCours: [],
    client: null,
    execute(message, args) {
        const arg1 = args[0];
        const channel = message.channel;
        const channelID = channel.id;
        const authorID = message.author.id;
        this.client = message.client;

        switch (arg1) {
            case 'play':
                // Ajoute le joueur
                if (this.partiesEnAttente[channelID]) {
                    this.partiesEnAttente[channelID]['participants'].push(authorID);
                    message.reply("Je t'ai ajouté à la liste des joueurs !");
                }
                break;
            case 'new':
                // Nouvelle partie
                if (this.partiesEnAttente[channelID] || this.partiesEnCours[channelID])
                    return message.reply('Une partie est déjà en cours !');

                const nbJoueurs = args[1] ? args[1] : 1;
                this.partiesEnAttente[channelID] = {
                    'max': parseInt(nbJoueurs),
                    'participants': [
                        authorID
                    ]
                };
                if (nbJoueurs > 1) {
                    message.channel.send("C'est parti pour une nouvelle course de larves ! Inscrivez-vous avec $larve play");
                    message.channel.send(`${nbJoueurs} joueur(s) maximum.`)
                }
                break;
            case 'go':
                if (this.partiesEnAttente[channelID])
                    this.partiesEnAttente[channelID]['max'] = this.partiesEnAttente[channelID]['participants'].length;
                else
                    message.reply('Aucune partie en cours.');
                break;
        }

        if (this.partiesEnAttente[channelID]) {
            if (this.partiesEnAttente[channelID]['max'] == this.partiesEnAttente[channelID]['participants'].length) {
                let nbJoueurs = this.partiesEnAttente[channelID]['participants'].length;
                this.partiesEnCours[channelID] = this.partiesEnAttente[channelID];

                this.partiesEnCours[channelID]['larves'] = {
                    [this.larveB]: 0,
                    [this.larveD]: 0,
                    [this.larveO]: 0,
                    [this.larveV]: 0,
                };
                this.partiesEnAttente[channelID] = null;

                this.lancerPartie(channel);
            }
        }
    },
    defineLarves(channel) {
        var self = this;
        self.partiesEnCours[channel.id]['paris'] = [];

        let retour = '';
        this.partiesEnCours[channel.id]['participants'].forEach(function (participant) {
            const random = Math.floor(Math.random() * 4);
            console.log('random :' + random);
            let larve = null;
            switch (random) {
                case 0:
                    larve = self.larveB;
                    break;
                case 1:
                    larve = self.larveD;
                    break;
                case 2:
                    larve = self.larveO;
                    break;
                case 3:
                    larve = self.larveV
                    break;
            }
            console.log('larve :' + larve);

            let pari = {
                'id': participant,
                'larve': larve,
            };
            self.partiesEnCours[channel.id]['paris'].push(pari);
            retour += '<@!' + participant + '> aura la ' + self.getEmoji(larve) + self.sautLigne;
        });
        channel.send(retour);
    },
    async lancerPartie(channel) {
        var self = this;
        this.defineLarves(channel);

        let partie = this.getPartie(channel);
        let msg = await channel.send(partie);
        let i = 0;

        let result = null;
        var interval = setInterval(function () {
            i++;
            self.partiesEnCours[channel.id]['larves'][self.larveB] += Math.floor(Math.random() * 3);
            self.partiesEnCours[channel.id]['larves'][self.larveD] += Math.floor(Math.random() * 3);
            self.partiesEnCours[channel.id]['larves'][self.larveO] += Math.floor(Math.random() * 3);
            self.partiesEnCours[channel.id]['larves'][self.larveV] += Math.floor(Math.random() * 3);

            msg.edit(self.getPartie(channel));

            if ((result = self.jeuFini(channel)) !== false) {
                clearInterval(interval);
                self.annoncerGagnant(channel, result);
                self.partiesEnCours[channel.id] = null;
            }
        }, 1000);
    },
    annoncerGagnant(channel, result) {
        channel.send('Gagnant : **' + this.getEmoji(result) + '**');
        const paris = this.partiesEnCours[channel.id]['paris'];

        let gagnants = [];

        console.log(paris);
        for (let i = 0; i < paris.length; i++) {
            let pari = paris[i];
            console.log(pari.larve);
            console.log(result);
            if (pari.larve == result)
                gagnants.push('<@!' + pari.id + '>');
        }

        if (gagnants.length == 1)
            channel.send(gagnants.join(', ') + ' a gagné !');
        else if (gagnants.length > 1)
            channel.send(gagnants.join(', ') + ' ont gagné !');
        else
            channel.send("Personne n'a gagné. :(");
    },
    jeuFini(channel) {
        const larves = this.partiesEnCours[channel.id]['larves'];

        let gagnant = false;
        let max = 0;
        for (const [key, value] of Object.entries(larves)) {
            if (value >= this.objectif && value > max)
                gagnant = key;
                max = value;
        }

        return gagnant;
    },
    getPartie(channel) {
        let base = this.flag + this.flag + this.flag + this.flag + this.flag + this.sautLigne;
        let larveB = this.getLarve(channel.id, this.larveB);
        let larveD = this.getLarve(channel.id, this.larveD);
        let larveO = this.getLarve(channel.id, this.larveO);
        let larveV = this.getLarve(channel.id, this.larveV);
        let fin = this.flag + this.flag + this.flag + this.flag + this.flag + this.sautLigne;

        retour = base + larveB + larveD + larveO + larveV + fin;
        return retour;
    },
    getLarve(channelID, larve) {
        const scoreLarve = this.partiesEnCours[channelID]['larves'][larve];
        let retour = this.flag;

        for (let i = 0; i < scoreLarve; i++)
            retour += '-';

        retour += this.getEmoji(larve) + this.sautLigne
        return retour;
    },
    getEmoji(emoji) {
        let myEmoji = emoji;
        if (myEmoji.indexOf(':') === -1) {
            let search = this.client.emojis.cache.find(emoji => emoji.name === myEmoji);
            if (search !== undefined)
                myEmoji = '<:' + search.name + ':' + search.id + '>';
        }

        return myEmoji;
    },

    flag: ':checkered_flag:',
    larveB: 'larveB',
    larveD: 'larveD',
    larveO: 'larveO',
    larveV: 'larveV',
    sautLigne: '\n',
    objectif: 15,
};