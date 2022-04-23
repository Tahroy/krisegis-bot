const {SlashCommandBuilder} = require('@discordjs/builders');
const Anniversaire = require("../database/Anniversaire");
const cron = require("node-cron");
const Variable = require("../database/Variable");

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
                        .setDescription('Format 23.04.2022')
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

        const day = values[0];
        const month = values[1];
        const year = values[2];

        const champs = {
            userId: membre.id,
            date: year + '-' + month + '-' + day,
            server: interaction.guild.id,
        };

        await Anniversaire.create(champs);
        interaction.reply(`Anniversaire ajouté pour ${membre.username}`);


        const channelVariable = Variable.findOne({where: {name: 'birthdayChannel', server: interaction.guild.id}});

        if (channelVariable) {
            const cible = ('<@!' + membre.id + '>');
            const channel = interaction.guild.channels.cache.get(channelVariable.get('data'));

            cron.schedule(`* * ${day} ${month} *`, () => {
                channel.send(`Today's ${cible} birthday, congratulations!`);
            }, 'Europe/Paris');
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
            const year = date[0];

            message += `${membre.user.username} : ${day}/${month}/${year}\n`;
        }

        interaction.reply(message);
    }
};