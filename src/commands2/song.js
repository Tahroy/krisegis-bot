const {SlashCommandBuilder} = require('@discordjs/builders');


module.exports = {
    opts: {},
    data: new SlashCommandBuilder()
        .setName('song')
        .setDescription('Gestion musique')
        .addSubcommand(subcommand =>
            subcommand
                .setName('play')
                .setDescription('Joue une musique')
                .addStringOption(option =>
                    option
                        .setName("query")
                        .setDescription("Lien ou recherche")
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('current')
                .setDescription('Donne des informations sur la musique actuelle')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('pause')
                .setDescription('Met en pause la musique')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('resume')
                .setDescription('Relance une musique en pause')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('skip')
                .setDescription('Passe une musique')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('volume')
                .setDescription('Définie le volume')
                .addIntegerOption(option =>
                    option
                        .setName('volume')
                        .setDescription('Volume entre 0 et 100')
                        .setRequired(true)
                )
        )
    ,
    async execute(interaction) {
        const player = interaction.client.player;

        switch (interaction.options.getSubcommand()) {
            case "play":
                await this.play(interaction, player);
                return;
            case "current":
                await interaction.reply(player.current);
                return;
            case 'pause':
                player.setPaused(true);
                await interaction.reply('Musique en pause !');
                return;
            case 'resume':
                player.setPaused(false);
                await interaction.reply("Et c'est reparti !");
                return;
            case 'skip':
                player.skipTo(1);
                await interaction.reply("Tu n'aimes pas ? OK, je passe.");
                return;
            case 'volume':
                await interaction.deferReply();
        }


        return interaction.reply("OK !");
    },
    async play(interaction, player) {

        if (!interaction.member.voice.channelId) {
            return await interaction.reply({
                content: "You are not in a voice channel!",
                ephemeral: true
            });
        }
        if (interaction.guild.me.voice.channelId && interaction.member.voice.channelId !== interaction.guild.me.voice.channelId) {
            return await interaction.reply({
                content: "You are not in my voice channel!",
                ephemeral: true
            });
        }
        const query = interaction.options.get("query").value;
        const queue = await player.createQueue(interaction.guild, {
            metadata: interaction.channel
        });

        // verify vc connection
        try {
            if (!queue.connection) await queue.connect(interaction.member.voice.channel);
        } catch (error) {
            queue.destroy();
            return await interaction.reply({content: "Could not join your voice channel!", ephemeral: true});
        }

        await interaction.deferReply();
        const track = await player.search(query, {
            requestedBy: interaction.user
        }).then(x => x.tracks[0]);

        if (!track) {
            return await interaction.followUp({content: `❌ | Track **${query}** not found!`});
        }

        await queue.play(track);

        return await interaction.followUp({content: `⏱️ | Loading track **${track.title}**!`});
    }
};