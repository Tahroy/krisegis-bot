module.exports = {
    name: 'larve',
    description: 'Jeu des larves',
    usage: '',
    partiesEnAttente: [],
    partiesEnCours: [],
    client: null,
    execute(message, args) {
        const arg1 = args[0];
        const arg2 = args[1] ? args[1] : null;
        this.client = message.client;

        let larve = '';
        switch (arg1) {
            case 'jaune':
                larve = this.larveD;
                break;
            case 'orange':
                larve = this.larveO;
                break;
            case 'bleue':
                larve = this.larveB;
                break;
            case 'violette':
                larve = this.larveVio;
                break;
            case 'verte':
                larve = this.larveV;
                break;
            case 'go':
                this.goGame(message, message.channel);
                return;
        }

        this.ajoutOuCreation(message, larve);
    },
    ajoutOuCreation(message, larve) {
        const channel = message.channel;
        const channelID = channel.id;
        const authorID = message.author.id;

        // Si une partie est en cours, on rejette
        if (this.partiesEnCours[channelID])
            return message.reply('Une partie est déjà en cours !');

        // Si aucune partie, on la créé
        if (!this.partiesEnAttente[channelID]) {
            this.partiesEnAttente[channelID] = [];
            this.partiesEnAttente[channel.id]['paris'] = [];
        }

        // Ajoute le joueur

        let pari = {
            'id': message.author.id,
            'larve': larve,
        };

        this.partiesEnAttente[channel.id]['paris'].push(pari);
        message.reply("Je t'ai ajouté à la liste des joueurs !");
    },
    async goGame(message, channel) {
        var self = this;
        let channelID = channel.id;

        if (!self.partiesEnAttente[channelID])
            return message.reply('Aucune partie en attente. :/');

        this.partiesEnCours[channelID] = this.partiesEnAttente[channelID];
        this.partiesEnCours[channelID]['larves'] = {
            [this.larveB]: 0,
            [this.larveD]: 0,
            [this.larveO]: 0,
            [this.larveV]: 0,
            [this.larveVio]: 0,
        };
        this.partiesEnAttente[channelID] = null;

        let partie = this.getPartie(channel);
        let msg = await channel.send(partie);
        let i = 0;

        let result = null;
        var interval = setInterval(function () {
            i++;
            self.updateLarves(channelID);
            msg.edit(self.getPartie(channel));
            if ((result = self.jeuFini(channel)) !== false) {
                clearInterval(interval);
                self.annoncerGagnant(channel, result);
                self.partiesEnCours[channelID] = null;
            }
        }, 1000);
    },
    updateLarves(channelID) {
        this.partiesEnCours[channelID]['larves'][this.larveB] += Math.floor(Math.random() * 3);
        this.partiesEnCours[channelID]['larves'][this.larveD] += Math.floor(Math.random() * 3);
        this.partiesEnCours[channelID]['larves'][this.larveO] += Math.floor(Math.random() * 3);
        this.partiesEnCours[channelID]['larves'][this.larveV] += Math.floor(Math.random() * 3);
        this.partiesEnCours[channelID]['larves'][this.larveVio] += Math.floor(Math.random() * 5) - 1;
    },
    annoncerGagnant(channel, result) {
        const paris = this.partiesEnCours[channel.id]['paris'];
        channel.send('Gagnant : ' + this.getEmoji(result));

        let gagnants = [];

        paris.forEach(function (joueur) {
            if (joueur.larve == result)
                gagnants.push('<@!' + joueur.id + '>');
        });

        if (gagnants.length === 1)
            channel.send(gagnants.join(', ') + ' a gagné !');
        else if (gagnants.length === 1)
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
        let larveVio = this.getLarve(channel.id, this.larveVio);
        let fin = this.flag + this.flag + this.flag + this.flag + this.flag + this.sautLigne;

        retour = base + larveB + larveD + larveO + larveV + larveVio + fin;
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
            else {
                switch (myEmoji) {
                    case 'larveB':
                        myEmoji = ':blue_circle:';
                        break;
                    case 'larveD':
                        myEmoji = ':yellow_circle:';
                        break;
                    case 'larveV':
                        myEmoji = ':green_circle:';
                        break;
                    case 'larveO':
                        myEmoji = ':orange_circle:';
                        break;
                    case 'larveVio':
                        myEmoji = ':purple_circle:';
                        break;
                    default:
                        myEmoji = ':interrobang:';
                        break;
                }
            }
        }

        return myEmoji;
    },

    flag: ':checkered_flag:',
    larveB: 'larveB',
    larveD: 'larveD',
    larveO: 'larveO',
    larveV: 'larveV',
    larveVio: 'larveVio',
    sautLigne: '\n',
    objectif: 15,
};