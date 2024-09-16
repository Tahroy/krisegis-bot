const {SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, TextInputBuilder, ModalBuilder } = require("discord.js");
const {ButtonStyle, TextInputStyle } = require("discord-api-types/v8");
const embedData = require("../utils/embed");
const { addPlayerItem } = require('../utils/Utils')
const Potion = require('../database/Potion')

const NOMBRE = 5;

let parties = {};
let savedPotions = {};

const ingredients = {
	snake: "🐍",
	herb: "🌿",
	cookie: "🍪",
	garlic: "🧄",
	egg: "🥚",
	mosquito: "🦟",
	skull: "💀",
	eye: "👁️",
	mushroom: "🍄",
	drop_of_blood: "🩸",
	four_leaf_clover: "🍀",
	rose: "🌹",
	ear_of_rice: "🌾"
};

module.exports = {
	opts: {}, data: new SlashCommandBuilder()
		.setName('potions')
		.setDescription('Lance le jeu des potions')
		.setDMPermission(false)
	,
	async execute(interaction) {

		const channelID = interaction.channel.id;


		if (parties[channelID]) {
			if (!parties[channelID].ended) {

				parties[channelID].title = "Partie annulée !";
				parties[channelID].ended = true;
				parties[channelID].message.edit(parties[channelID].render());
			}
		}

		parties[channelID] = new MasterMindGame(channelID);

		interaction.reply(parties[channelID].render());

		parties[channelID].message = await interaction.fetchReply()

	},
	async executeButton(interaction, buttonName) {
		const channelID = interaction.channel.id;

		if (parties[channelID]) {
			const partie = parties[channelID];

			if (buttonName === 'cancel') {
				partie.cancel();
				partie.message.edit(parties[channelID].render());
				return interaction.deferUpdate();
			}

			if (buttonName === 'submit') {
				const submitResult = partie.submit();
				partie.message.edit(parties[channelID].render());

				if (submitResult) {
					return await partie.validatePotion(interaction)
				}
				return interaction.deferUpdate();
			}
			const added = partie.addToCurrent(buttonName);

			if (added) {
				partie.message.edit(parties[channelID].render());
				return interaction.deferUpdate();
			}
			return interaction.reply({content: "Veuillez valider l'étape !", ephemeral: true});
		}
	},
	async gererModal(interaction, modalName) {

		const modalNameExploded = modalName.split('_');
		const userId = modalNameExploded[1];

		const ingredients = savedPotions[userId];

		const name = interaction.fields.getTextInputValue('name');

		const potion = await Potion.create({
			name: name,
			user_id: userId,
			ingredient_1: ingredients[0],
			ingredient_2: ingredients[1],
			ingredient_3: ingredients[2],
			ingredient_4: ingredients[3],
			ingredient_5: ingredients[4]
		})

		await interaction.reply({content: `Vous avez créé la potion **${potion.name}** ! :tada: :tada: :tada:`})
		addPlayerItem(interaction.user, `Potion : ${potion.name}`, "potion");
	}
};

class MasterMindGame {
	/**
	 * @param {string}
	 */
	channel;

	title = "Il faut trouver la recette !"

	rows = [];

	currentRow = 0;

	message;

	objectif = [];

	retours = [];

	ended = false;

	constructor(channel) {
		this.channel = channel;
		this.rows[this.currentRow] = [];

		let ingredientsDispos = ingredients;
		const randomProperty = function (obj) {
			const keys = Object.keys(obj);
			return keys[keys.length * Math.random() << 0];
		};

		for (let i = 0; i < NOMBRE; i++) {
			let ingredient = randomProperty(ingredientsDispos);
			if (this.objectif.find(search => search === ingredient)) {
				i--;
				continue;
			}
			this.objectif.push(ingredient);
		}

		console.log(this.objectif);
	}

	addToCurrent(name) {
		if (this.rows[this.currentRow].length === NOMBRE) {
			return false;
		}

		this.rows[this.currentRow].push(name);

		return true;
	}

	getRows() {
		let retour = [];

		const self = this;

		for (let i = 0; i < this.rows.length; i++) {
			let ligne = '';
			for (let j = 0; j < this.rows[i].length; j++) {
				ligne += `:${this.rows[i][j]}: `
			}

			if (ligne) {
				retour.push({name: '\u200B', value: ligne, inline: true});

				if (self.retours[i]) {
					retour.push({name: '\u200B', value: self.retours[i].join(" "), inline: true});
					retour.push({name: '\u200B', value: '\u200B', inline: true});
				}
			}
		}

		return retour;
	}

	render() {
		let object = {};

		const data = embedData.createEmbed(this.getRows(), {
			title: this.title,
		})

		object.embeds = data.embeds;
		object.files = data.files;

		let rows = [];
		rows.push(new ActionRowBuilder());

		let rowNB = 0;
		const self = this;

		Object.entries(ingredients).forEach(function (data) {
			const key = data[0];
			const label = data[1];

			rows[rowNB].addComponents(new ButtonBuilder()
										  .setCustomId('potions-' + key)
										  .setLabel(label)
										  .setStyle(ButtonStyle.Secondary)
										  .setDisabled(self.ended));

			if (rows[rowNB].components.length > 4) {
				rowNB++;
				rows.push(new ActionRowBuilder());
			}

		});

		/**
		 * Cancel/Submit
		 */
		rows.push(new ActionRowBuilder()
					  .addComponents(new ButtonBuilder()
										 .setCustomId('potions-' + 'cancel')
										 .setLabel('Annuler')
										 .setStyle(ButtonStyle.Danger)
										 .setDisabled(this.ended || this.rows[this.currentRow].length === 0))
					  .addComponents(new ButtonBuilder()
										 .setCustomId('potions-' + 'submit')
										 .setLabel('Confirmer')
										 .setStyle(ButtonStyle.Success)
										 .setDisabled(this.ended || this.rows[this.currentRow].length < NOMBRE)));

		object.components = rows;

		return object;
	}

	cancel() {
		this.rows[this.currentRow].pop();
	}

	submit() {
		const rowActuelle = this.rows[this.currentRow];
		const objectif = this.objectif;

		let retour = [];
		let fails = 0;
		for (let i = 0; i < rowActuelle.length; i++) {
			if (rowActuelle[i] === objectif[i]) {
				retour[i] = ":white_circle:";
				continue;
			}

			if (objectif.find(element => element === rowActuelle[i])) {
				retour[i] = ":orange_circle:";
				fails++;
				continue;
			}

			fails++;
			retour[i] = ":red_circle:";
		}

		this.retours[this.currentRow] = retour;

		this.rows.push([]);
		this.currentRow++;

		if (!fails) {
			this.ended = true;
			this.title = "La recette a été trouvée, bravo !";
			return true;
		}

		return false;
	}
	async validatePotion (interaction) {
		const objectif = this.objectif

		// On cherche dans la table Potion une potion qui correspond aux ingrédients
		const potion = await Potion.findOne({
			where: {
				ingredient_1: objectif[0],
				ingredient_2: objectif[1],
				ingredient_3: objectif[2],
				ingredient_4: objectif[3],
				ingredient_5: objectif[4],
			}
		})

		if (potion) {
			// Si la potion existe, on dit qu'il a trouvé celle-ci
			await interaction.reply({content: `Vous avez gagnez la potion **${potion.name}** ! :tada: :tada: :tada:`})
			addPlayerItem(interaction.user, `Potion : ${potion.name}`, "potion");
		}
		else {
			savedPotions[interaction.user.id] = this.objectif;

			// Create the modal
			const modal = new ModalBuilder()
				.setCustomId(`potions-name_${interaction.member.user.id}`)
				.setTitle('Nommer votre potion');

			// Add components to modal
			// Create the text input components
			const favoriteColorInput = new TextInputBuilder()
				.setCustomId('name')
				// The label is the prompt the user sees for this input
				.setLabel("Quel nom voulez-vous lui attribuer ?")
				// Short means only a single line of text
				.setStyle(TextInputStyle.Short)
				.setMinLength(3)
				.setRequired(true)
			;

			// An action row only holds one text input,
			// so you need one action row per text input.
			const firstActionRow = new ActionRowBuilder().addComponents(favoriteColorInput);

			// Add inputs to the modal
			modal.addComponents(firstActionRow);

			// Show the modal to the user
			//await interaction.reply({content: `Vous avez gagné ! Nommez votre potion pour l'obtenir`})
			await interaction.showModal(modal);
		}
	}
}