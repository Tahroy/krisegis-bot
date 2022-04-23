const {SlashCommandBuilder} = require('@discordjs/builders');
const Variable = require("../database/Variable");

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
                  .addChoice('Salon des anniversaires', 'birthdayChannel')
        )
        .addStringOption(option =>
            option.setName('data')
                  .setDescription('La donnée à sauvegarder')
                  .setRequired(true)),

    async execute(interaction) {
        const name = interaction.options.getString('name');
        const data = interaction.options.getString('data');


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