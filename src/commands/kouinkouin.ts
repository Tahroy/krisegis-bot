import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    Interaction, InteractionContextType,
    MessageFlags,
    SlashCommandBuilder
} from "discord.js";
import {readdirSync} from "node:fs";
import {join, extname} from "node:path";
import {PlayerService} from "../services/PlayerService";
import {ItemType} from "../utils/Enums";
import AbstractCommand from "../utils/AbstractCommand";

/**
 * Un joueur peut demander une partie de pêche au kouinkouin.
 * S'il a déjà une partie en cours, la demande est refusée !
 *
 * Sinon, on indique au joueur qu'une partie est en cours.
 *
 * Un timer est alors défini entre 3 et 10 secondes.
 * Un message contenant "..." est envoyé.
 * Ce message est répété chaque seconde.
 *
 * À la fin du timer, un bouton apparaît avec écrit "Tirer !"
 * Le joueur a 1.2 secondes pour cliquer dessus, sinon il perd !
 * Selon le résultat, on envoie "Bravo !" ou "Perdu !"
 *
 * Lorsque quelqu'un clique sur "Tirer !" à temps, il est celui qui capture le kouinkouin.
 * Il gagne donc le kouinkouin dans son inventaire
 */
export default class Kouinkouin extends AbstractCommand {
    public name: string = "kouinkouin";
    public description: string = "Permet de pêcher un kouinkouin.";

    // Using a static private property to manage game states
    private static games: { [key: string]: any } = {};

    private static readonly KOUINKOUINS: { [key: number]: string } = {
        1: "Gros kouinkouin",
        2: "Kouinkouin rétro",
        3: "Kouinkouin de bain de Nagate",
        4: "Faux kouinkouin",
        5: "Kouinkouin fantôme",
        6: "Kouinkouin noir",
        7: "Kouinkouin",
    };

    public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        if (!interaction.guildId) {
            await interaction.reply({
                content: "Cette commande doit être utilisée dans un serveur.",
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        const serverID = interaction.guildId;
        const userID = interaction.user.id;
        const key = `${serverID}-${userID}`;

        if (Kouinkouin.games[key]) {
            await interaction.reply({
                content: "Une partie est déjà en cours !",
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        const images = readdirSync(join("assets", "kouinkouins")).filter(file =>
            [
                ".jpg",
                ".png"
            ].includes(extname(file))
        );
        const randomImg = images[Math.floor(Math.random() * images.length)];
        const imgPath = join("assets", "kouinkouins", randomImg);

        Kouinkouin.games[key] = parseInt(randomImg.split("_")[1].replace(".png", ""));

        await interaction.reply("La partie débute !");

        let timer = Math.floor(Math.random() * (10 - 3 + 1)) + 3;

        const countdown = setInterval(() => {
            if (timer === 0) {
                clearInterval(countdown);

                const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Success)
                        .setLabel("Attraper !")
                        .setCustomId(`kouinkouin-catch_${userID}`)
                );

                const member = interaction.guild?.members.cache.get(interaction.user.id);
                const userName = member?.nickname ?? interaction.user.globalName;
                interaction.followUp({
                    content: `Le kouinkouin de ${userName} apparaît !`,
                    components: [row],
                });

                setTimeout(() => {
                    if (Kouinkouin.games[key] === "won") {
                        interaction.followUp({
                            content: "Bravo !",
                            files: [
                                {
                                    attachment: imgPath,
                                    name: randomImg
                                }
                            ],
                        });
                    } else {
                        interaction.followUp({content: "Perdu !"});
                    }
                    delete Kouinkouin.games[key];
                }, 1500);
            } else {
                timer--;
                interaction.followUp({
                    content: "...",
                    flags: MessageFlags.Ephemeral
                });
            }
        }, 1000);
    }

    public async executeButton(interaction: Interaction): Promise<void> {
        if (!interaction.isButton() || !interaction.guildId) {
            return;
        }

        const buttonName = interaction.customId;

        const action = buttonName.split("_")[0];
        const userID = buttonName.split("_")[1];
        const key = `${interaction.guildId}-${interaction.user.id}`;

        if (action === "catch") {
            if (!Kouinkouin.games[key]) {
                await interaction.reply({
                    content: "Aucune partie en cours pour vous !",
                    flags: MessageFlags.Ephemeral,
                });
                return;
            }

            if (Number.isInteger(Kouinkouin.games[key])) {
                const kouinkouinID = Kouinkouin.games[key];
                Kouinkouin.games[key] = "won";

                const catcher = interaction.user;
                if (!catcher) {
                    await interaction.reply({
                        content: "Impossible de récupérer les informations du membre.",
                        flags: MessageFlags.Ephemeral
                    });
                    return;
                }

                const guild = interaction.guild;
                const user = interaction.user;
                const memberCatch = await guild?.members.fetch(user.id)
                const userName = memberCatch?.nickname ?? user.globalName

                if (userID === interaction.user.id) {
                    await interaction.reply(`**${userName}** a attrapé son kouinkouin !`);
                } else {
                    await interaction.reply(`**${userName}** a volé le kouinkouin !`);
                }

                await PlayerService.addPlayerItem(
                    interaction.user,
                    Kouinkouin.KOUINKOUINS[kouinkouinID],
                    ItemType.KOUINKOUIN,
                    1,
                    interaction.guildId
                );
            } else {
                await interaction.reply({
                    content: "Raté !",
                    flags: MessageFlags.Ephemeral
                });
            }
        }
    }

    protected addOptions(builder: SlashCommandBuilder) {
        builder.setContexts([InteractionContextType.Guild])
    }
}
