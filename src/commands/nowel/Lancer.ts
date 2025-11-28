import { CommandInteraction, CommandInteractionOptionResolver, MessageFlags, User } from "discord.js";
import AbstractSubCommand from "../../utils/AbstractSubCommand";
import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import Nowel from "../../models/nowel/Nowel";

export default class Lancer extends AbstractSubCommand {
    public name: string = "lancer";
    public description: string = "Lance une boule de neige sur quelqu'un.";
    private static readonly OPTION_TARGET = 'cible';

    public async execute(interaction: CommandInteraction): Promise<void> {

        if (!interaction.isChatInputCommand()) {
            return;
        }

        if (!interaction.guildId) {
            await interaction.reply({ content: "Cette commande doit être utilisée dans un serveur.", flags: MessageFlags.Ephemeral });
            return;
        }

        const options = interaction.options;

        const target = options.getUser(Lancer.OPTION_TARGET);
        if (!target) {
            await interaction.reply({ content: "Il faut sélectionner quelqu'un !", flags: MessageFlags.Ephemeral });
            return;
        }

        if (target.id === interaction.user.id) {
            await interaction.reply({ content: "Tu ne vas pas bien toi ?...", flags: MessageFlags.Ephemeral });
            return;
        }

        const [attackerNowel] = await Nowel.findOrCreate({
            where: { userId: interaction.user.id, guildId: interaction.guildId },
        });

        if (attackerNowel.remainingThrows <= 0) {
            await interaction.reply({ content: "Vous n'avez plus de boules de neige !", flags: MessageFlags.Ephemeral });
            return;
        }

        if (attackerNowel.remainingHP <= 0) {
            await interaction.reply({ content: "Vous n'avez plus de points de vie !", flags: MessageFlags.Ephemeral });
            return;
        }

        const [targetNowel] = await Nowel.findOrCreate({
            where: { userId: target.id, guildId: interaction.guildId },
        });
        
        if (targetNowel.remainingHP <= 0) {
            await interaction.reply({ content: "Votre cible n'a plus de points de vie !", flags: MessageFlags.Ephemeral });
            return;
        }

        attackerNowel.remainingThrows -= 1;
        await attackerNowel.save();

        const user = interaction.user;
        const member = await interaction.guild?.members.fetch(user.id);
        const userName = member?.nickname ?? user.globalName ?? user.username;

        const memberTarget = await interaction.guild?.members.fetch(target.id);
        const targetName = memberTarget?.nickname ?? target.globalName ?? target.username;

        if (Math.random() < 0.5) {
            await interaction.reply(`❄️ **${userName}** lance une boule de neige sur **${targetName}**, mais rate !`);
            return;
        }

        targetNowel.remainingHP -= 1;
        await targetNowel.save();
        let message = `❄️ **${userName}** lance une boule de neige sur **<@!${target.id}>** et touche !`;
        
        if (targetNowel.remainingHP <= 0) {
            message += `\n**<@!${target.id}>** est KO !`;
        } else {
            const pluriel = targetNowel.remainingHP > 1 ? 's' : '';
            message += `\n${targetName} n'a plus que ${targetNowel.remainingHP} point${pluriel} de vie.`;
        }
        
        await interaction.reply(message);
    }

    protected addOptions(builder: SlashCommandSubcommandBuilder): void {
        builder.addUserOption(option =>
            option.setName(Lancer.OPTION_TARGET)
                .setDescription("Votre victime.")
                .setRequired(true)
        );
    }
}
