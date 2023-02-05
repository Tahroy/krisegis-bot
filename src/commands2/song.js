const {SlashCommandBuilder} = require("discord.js");
const {QueryType} = require("discord-player");
const {MessageEmbed} = require("discord.js");


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
                return this.play(interaction, player);
            case "current":
                return this.current(interaction, player);
            case 'pause':
                return this.pause(interaction, player);
            case 'resume':
                return this.resume(interaction, player);
            case 'skip':
                return this.skip(interaction, player);
            case 'volume':
                return this.volume(interaction, player);
        }


        return interaction.reply("OK !");
    },
    async play(interaction, player) {

        const channelID = interaction?.member?.voice?.channel?.id;

      //  return interaction.reply(JSON.stringify(interaction.member.voice.channel.id));
        if (!channelID) {
            return await interaction.reply({
                content: "Il vaut être dans un canal vocal...",
                ephemeral: true
            });
        }

        const query = interaction.options.get("query").value;

        if (!query) {
            return interaction.reply(`Aucun résultat... ❌`);
        }

        const res = await player.search(query, {
            requestedBy: interaction.member,
            searchEngine: QueryType.AUTO
        });

        if (!res || !res.tracks.length) return interaction.reply(`Aucun résultat... ❌`);

        const queue = await player.createQueue(interaction.guild, {
            metadata: interaction.channel
        });

        try {
            if (!queue.connection) {
                await queue.connect(interaction.member.voice.channel);
                queue.setVolume(50);
            }
        } catch {
            await player.deleteQueue(interaction.guild.id);
            return interaction.reply(`Je ne peux pas rejoindre ton canal vocal. :( ❌`);
        }

        try {
            await interaction.reply(`Chargement de ${res.playlist ? 'playlist' : 'musique'}... 🎧`);
        } catch (err) {
            console.error();
        }

        res.playlist ? queue.addTracks(res.tracks) : queue.addTrack(res.tracks[0]);

        if (!queue.playing) await queue.play();
    },
    async skip(interaction, player) {
        const queue = player.getQueue(interaction.guild.id);
        if (!queue || !queue.playing) return interaction.reply(`Aucune musique en cours... ❌`);
        const success = queue.skip();
        return interaction.reply(success ? `La musique actuelle ${queue.current.title} a été skip ✅` : `Quelque chose n'a pas bien marché... Stop drink please. ❌`);
    },
    async current(interaction, player) {
        const queue = player.getQueue(interaction.guild.id);

        if (!queue || !queue.playing) return interaction.reply(`Aucune musique en cours... ❌`);

        const track = queue.current;

        const embed = new MessageEmbed();

        embed.setColor('RED');
        embed.setThumbnail(track.thumbnail);

        const timestamp = queue.getPlayerTimestamp();
        const trackDuration = timestamp.progress === 'Infinie' ? 'Infinie (live)' : track.duration;

        //             Loop mode **${methods[queue.repeatMode]}**\n
        embed.setDescription(`
            Volume **${queue.volume}** %\n
            Durée **${trackDuration}**\n
            Ajoutée par ${track.requestedBy}`);
        embed.setTimestamp();

        return interaction.reply({embeds: [embed]});
    },
    async pause(interaction, player) {
        const queue = player.getQueue(interaction.guild.id);

        if (!queue) {
            return interaction.reply(`Aucune musique en cours... ❌`);
        }

        const success = queue.setPaused(true);

        return interaction.reply(success ? `La musique ${queue.current.title} a été mise en pause ✅` : `Non, je ne vais pas mettre en pause. ❌`);
    },
    async resume(interaction, player) {
        const queue = player.getQueue(interaction.guild.id);

        if (!queue) {
            return interaction.reply(`Aucune musique en cours... ❌`);
        }

        const success = queue.setPaused(false);

        return interaction.reply(success ? `La musique ${queue.current.title} a été relancée ✅` : `Non, je ne vais pas relancer. ❌`);
    },
    async volume(interaction, player)
    {
        const queue = player.getQueue(interaction.guild.id);

        if (!queue || !queue.playing) {
            return interaction.reply(`Aucune musique en cours... ❌`);
        }

        const vol = parseInt(interaction.options.getInteger('volume'));

        if (vol < 0 || vol > 100) return interaction.reply(`Il faut un nombre entre 0 et 100... ❌`);

        const success = queue.setVolume(vol);

        return interaction.reply(success ? `Le volume a été modifié : **${vol}**/**100**% 🔊` : `Non. ❌`);
    }
};