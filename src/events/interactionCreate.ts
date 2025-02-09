import {
    Client,
    CommandInteraction,
    ButtonInteraction,
    AutocompleteInteraction,
    ModalSubmitInteraction, Interaction
} from 'discord.js';
import {owner} from '../../config/config_bot.json';
import {debugMessage} from '../utils/Utils';
import KrisegisClient from "../models/KrisegisClient";
import AbstractCommand from "../utils/AbstractCommand";

module.exports = (client: KrisegisClient) => {
    const gererCommande = async (interaction: CommandInteraction) => {
        const {commandName} = interaction;

        const command = client.commands.get(commandName);
        if (command) {
            try {
                const userName = interaction.user.tag;
                const log = `\`${userName}\` a utilisé la commande \`${commandName}\``;
                debugMessage(interaction.guild, log);

                if (command?.opts?.admin && interaction.user.id !== owner) {
                    await interaction.reply('Vous ne pouvez pas utiliser cette commande !');
                    return;
                }
                await command.execute(interaction);
                return
            } catch (error) {
                console.error(error);
                return;
            }
        }

        const typedCommand: AbstractCommand | undefined = client.typedCommands.get(commandName);
        if (typedCommand) {
            const userName = interaction.user.tag;
            const log = `\`${userName}\` a utilisé la commande \`${commandName}\``;
            debugMessage(interaction.guild, log);

            await typedCommand.execute(interaction);
            return
        }

        await interaction.reply('Cette commande n\'existe pas !');
    };

    const gererBouton = async (interaction: ButtonInteraction) => {
        const customID = interaction.customId;
        const [commandName, buttonName] = customID.split('-', 2);

        const userName = interaction.user.tag;
        const command = client.commands?.get(commandName);

        const log = `${userName} a utilisé le bouton ${buttonName} dans la commande ${commandName}`;
        console.log(log);

        if (command) {
            if (command?.opts?.admin) {
                if (!interaction.member || interaction.member.user.id !== owner) {
                    return await interaction.reply('Vous ne pouvez pas utiliser cette commande !');
                }
            }
            await command?.executeButton(interaction, buttonName);
            return;
        }

        const typedCommand: AbstractCommand | undefined = client.typedCommands.get(commandName);

        if (typedCommand) {
            await typedCommand.executeButton(interaction);
            return
        }

        await interaction.reply('Cette commande n\'existe pas !');
    };

    const autocomplete = async (interaction: AutocompleteInteraction) => {
        const {commandName} = interaction;

        const command = client.commands?.get(commandName);

        if (command) {
            if (command?.opts?.admin) {
                if (!interaction.member || interaction.member.user.id !== owner) {
                    await interaction.respond([])
                    return;
                }
            }
            await command?.autocomplete(interaction);
            return;
        }

        const typedCommand: AbstractCommand | undefined = client.typedCommands.get(commandName);

        if (typedCommand) {
            await typedCommand.automplete(interaction);
            return
        }
    };

    const gererModal = async (interaction: ModalSubmitInteraction) => {
        const [commandName, modalName] = interaction.customId.split('-', 2);

        const command = client.commands?.get(commandName);
        try {
            return await command?.gererModal(interaction, modalName);
        } catch (error) {
            console.error(error);
        }
    };

    client.on('interactionCreate', async (interaction: Interaction) => {
        if (!interaction) {
            console.error('interactionCreate : interaction vide');
            return;
        }

        if (interaction.isCommand()) {
            await gererCommande(interaction);
        } else if (interaction.isButton()) {
            await gererBouton(interaction);
        } else if (interaction.isAutocomplete()) {
            await autocomplete(interaction);
        } else if (interaction.isModalSubmit()) {
            await gererModal(interaction);
        }
    });
};
