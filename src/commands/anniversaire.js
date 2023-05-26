const Anniversaire = require("../database/Anniversaire");
const cron = require("node-cron");
const Variable = require("../database/Variable");
const {SlashCommandBuilder} = require("discord.js");

module.exports = {
    opts: {},
    data: new SlashCommandBuilder()
        .setName('anniversaire')
        .setDescription('Gestion des anniversaires')
        .addSubcommand(subcommand =>
            subcommand
                .setName('ajouter')
                .setDescription('Ajoute un anniversaire')
                .addUserOption(option =>
                    option
                        .setName('membre')
                        .setDescription('Membre à ajouter')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('date')
                        .setDescription('Format 23.04')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('liste')
                .setDescription('liste les anniversaires')
        )
    ,

    async execute(interaction) {
        const subCommand = interaction.options.getSubcommand();
        const serverID = interaction.guild.id;

        const channelVariable = await Variable.findOne({where: {server: serverID, name: 'birthdayChannel'}});

        if (!channelVariable) {
            interaction.reply('Le channel anniversaire n\'existe pas. Utilisez la commande `setvariable`');
            return;
        }

        const channel = interaction.guild.channels.cache.get(channelVariable.get('data'));

        if (!channel) {
            interaction.reply('Le channel anniversaire n\'existe pas. Utilisez la commande `setvariable`');
            return;
        }

        switch (subCommand) {
            case 'ajouter':
                await this.addAnniv(interaction);
                break;
            case 'liste':
                await this.getList(interaction);
                break;
            default:
                interaction.channel.send("Commande inconnue");
        }
    },

    async addAnniv(interaction) {
        const membre = interaction.options.getUser('membre');
        let date = interaction.options.getString('date');

        date = date.replaceAll('.', '-');
        date = date.replaceAll('/', '-');

        let values = date.split('-');

        const day = parseInt(values[0]);
        const month = parseInt(values[1]);

        if (day == 'NaN' || month == 'NaN') {
            interaction.reply('Format de date invalide');
            return;
        }

        if (day > 31 || day < 1 || month > 12 || month < 1) {
            interaction.reply('Format de date invalide');
            return;
        }

        const dateObject = new Date();
        dateObject.setMonth(month);
        dateObject.setDate(day);

        const champs = {
            userId: membre.id,
            date: '0000-' + values[1] + '-' + values[0],
            server: interaction.guild.id,
        };

        const search = await Anniversaire.findOne({
            where: {
                userId: membre.id,
                server: interaction.guild.id
            }
        });

        if (search) {
            await Anniversaire.destroy({
                where: {
                    userId: membre.id,
                    server: interaction.guild.id
                }
            });
        }

        await Anniversaire.create(champs);
        interaction.reply(`Anniversaire ajouté pour ${membre.username}`);


        const channelVariable = await Variable.findOne({where: {name: 'birthdayChannel', server: interaction.guild.id}});

        if (channelVariable) {
            const cible = ('<@!' + membre.id + '>');
            const channel = interaction.guild.channels.cache.get(channelVariable.get('data'));

            let task = cron.schedule(`0 10 ${day} ${month} *`, () => {
                channel.send(`Aujourd'hui c'est l'anniversaire de ${cible}, bravo !`);
            }, 'Europe/Paris');

            task.start();
        }
    },
    async getList(interaction) {
        const anniversaires = await Anniversaire.findAll({where: {server: interaction.guild.id}});

        let message = '';

        for (let anniv of anniversaires) {
            const membre = interaction.guild.members.cache.get(anniv.get('userId'));

            const date = anniv.get('date').split('-');
            const day = date[2];
            const month = date[1];

            if (membre?.user)
            {
                message += `${membre?.user?.username} : ${day}/${month}\n`;
            }
        }

        interaction.reply('Liste des anniversaires : \n' + message);
    }
};