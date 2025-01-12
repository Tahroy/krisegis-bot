const {SlashCommandBuilder} = require("discord.js");
const Variable = require('../models/Variable').default
const {PermissionFlagsBits} = require("discord-api-types/v8");

module.exports = {
    opts: {
        admin: true
    },
    data: new SlashCommandBuilder()
        .setName('setvariable')
        .setDescription('Met en place une variable')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false)
        .addStringOption(option =>
            option.setName('name')
                  .setDescription('La variable nécessaire')
                  .setRequired(true)
                  .addChoices(
                      {name:'Salon des anniversaires', value:'birthdayChannel'},
                      {name: 'Salon debug', value: 'debugChannel'},
                      {name: 'Salon évènements', value: 'eventsChannel'},
                      {name: 'Salon du RP', value: 'rp_channel'},
                      {name: 'Rôle alerte RP générale', value: 'alerte_rp_generale'},
                      {name: 'Rôle alerte RP serveur', value: 'alerte_rp_serveur'},
                      {name: 'Rôle alerte évènements générale', value: 'alerte_event_generale'},
                      {name: 'Rôle alerte évènements serveur', value: 'alerte_event_serveur'},
                      {name: "Salon d'accueil", value: "welcomeChannel"},
                      {name: "Rôle HRP", value: "role_hrp"},
                      {name: "Rôle Hors Krosmoz", value: "role_horskrosmoz"},
                  )
        )
        .addStringOption(option =>
            option.setName('data')
                  .setDescription('La donnée à sauvegarder')
                  .setRequired(true))
    ,

    async execute(interaction) {
        const name = interaction.options.getString('name');
        const data = interaction.options.getString('data');


        if (name === 'birthdayChannel') {
            const channel = interaction.guild.channels.cache.get(data);

            if (!channel) {
                interaction.reply('ID invalide. Veuillez renseigner l\'ID du salon des anniversaires', {ephemeral: true});
                return;
            }
        }

        const search = await Variable.findOne({
            where: {
                name: name,
                server: interaction.guild.id
            }
        });

        if (search) {
            await Variable.destroy({
                where: {
                    name: name,
                    server: interaction.guild.id
                }
            });
        }

        const champs = {
            name: name,
            data: data,
            server: interaction.guild.id,
        };

        await Variable.create(champs);
        interaction.reply(`La variable a bien été enregistrée pour ce serveur.`, {ephemeral: true});
    },
};