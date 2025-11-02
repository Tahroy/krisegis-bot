import {
    CommandInteraction,
    ButtonInteraction,
    AutocompleteInteraction,
    ModalSubmitInteraction, Interaction
} from 'discord.js';
import {debugMessage} from '../utils/Utils';
import KrisegisClient from "../models/KrisegisClient";
import AbstractCommand from "../utils/AbstractCommand";

const owner = process.env.OWNER_ID;

module.exports = (client: KrisegisClient) => {
    function logCommand(interaction: CommandInteraction) {
        if (!interaction.isChatInputCommand()) {
            return;
        }

        const userName = interaction.user.tag;

        const options = interaction.options.data;
        let optionsString = '';
        const optionsArray = [];

        for (const option of options) {
            if (option.options) {
                for (const subOption of option.options) {
                    optionsArray.push(`- \`${subOption.name}\` = \`${subOption.value}\``);
                }
            } else {
                optionsArray.push(`- \`${option.name}\` = \`${option.value}\``);
            }
        }

        if (optionsArray.length > 0) {
            optionsString = ` avec options :\n ${optionsArray.join('\n')}`;
        }

        let log;
        if (interaction.options.getSubcommand(false)) {
            const command = interaction.options.getSubcommand()
            log = `\`${userName}\` a utilisé la subCommande \`${command}\`${optionsString}`;
        } else {
            const command = interaction.commandName;
            log = `\`${userName}\` a utilisé la comand \`${command}\`${optionsString}`;
        }

        debugMessage(interaction.guild, log);

    }

    const gererCommande = async (interaction: CommandInteraction) => {
        const {commandName} = interaction;

        const command = client.commands.get(commandName);
        if (command) {
            try {
                if (command?.opts?.admin && interaction.user.id !== owner) {
                    await interaction.reply('Vous ne pouvez pas utiliser cette commande !');
                    return;
                }
                logCommand(interaction);
                await command.execute(interaction);
                return
            } catch (error) {
                console.error(error);
                return;
            }
        }

        const typedCommand: AbstractCommand | undefined = client.typedCommands.get(commandName);
        if (typedCommand) {
            logCommand(interaction);
            await typedCommand.execute(interaction);
            return
        }

        await interaction.reply('Cette commande n\'existe pas !');
    };

    const gererBouton = async (interaction: ButtonInteraction) => {
        const customID = interaction.customId;
        let [commandName, buttonName] = customID.split('-', 2);

        [commandName] = commandName.split('|');

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
            await typedCommand.autocomplete(interaction);
            return
        }
    };

    const gererModal = async (interaction: ModalSubmitInteraction) => {
        const [rawCommandName, modalName] = interaction.customId.split('-', 2);
        const [commandName] = rawCommandName.split('|');

        // Legacy
        const command = client.commands?.get(commandName);
        try {
            if (command) {
                return await command?.gererModal(interaction, modalName);
            }
        } catch (error) {
            console.error(error);
            return;
        }

        const typedCommand: AbstractCommand | undefined = client.typedCommands.get(commandName);
        if (typedCommand) {
            try {
                return await typedCommand.gererModal(interaction);
            } catch (error) {
                console.error(error);
            }
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
