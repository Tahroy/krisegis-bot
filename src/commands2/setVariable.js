const {SlashCommandBuilder} = require("discord.js");
const Variable = require("../database/Variable");
const {PermissionFlagsBits} = require("discord-api-types/v8");

module.exports = {
    opts: {
        admin: true
    },
    data: new SlashCommandBuilder()
        .setName('setvariable')
        .setDescription('Met en place une variable')
        .addStringOption(option =>
            option.setName('name')
                  .setDescription('La variable nécessaire')
                  .setRequired(true)
                  .addChoices({name:'Salon des anniversaires', value:'birthdayChannel'})
        )
        .addStringOption(option =>
            option.setName('data')
                  .setDescription('La donnée à sauvegarder')
                  .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    ,

    async execute(interaction) {
        const name = interaction.options.getString('name');
        const data = interaction.options.getString('data');


        if (name === 'birthdayChannel') {
            const channel = interaction.guild.channels.cache.get(data);

            if (!channel) {
                interaction.reply('ID invalide. Veuillez renseigner l\'ID du salon des anniversaires');
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
        interaction.reply(`La variable a bien été enregistrée pour ce serveur.`);
    },
};