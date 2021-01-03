module.exports = {

    /**
     * 
     * @param {Array} fields // Objects
     * - name: string
     * - value: string
     * - inline: boolean
     * Empty : \u200B
     * @param {Object} options 
     */
    get(fields, options) {
        let embed = new Discord.MessageEmbed()
            .setColor('YELLOW')
            .attachFiles([`${appRoot}/assets/krisegis-point.png`, `${appRoot}/assets/krisegis.png`])
            .setURL('https://krisegis.fr/')
            .setAuthor('Membres de la Compagnie de Krisegis', 'attachment://krisegis-point.png')
            .addFields(fields)
            .setTimestamp()
            .setFooter(`Krisegis V${version}`, 'attachment://krisegis.png');

        if (options) {
            if (options.title) {
                embed.setTitle(options.title);
            }
            if (options.url) {
                embed.setURL(options.url);
            }
            if (options.description) {
                embed.setDescription(options.description)
            }
        }

        return embed;
    }
};