const {SlashCommandBuilder, ActionRowBuilder, ButtonBuilder} = require("discord.js");
const {ButtonStyle} = require("discord-api-types/v8");
const embedData = require("../utils/embed");

const NOMBRE = 5;

let parties = {};

const ingredients = {
	snake: "🐍",
	herb: "🌿",
	spider: "🕷️",
	garlic: "🧄",
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
		.setDescription('Lance le jeu des potions'), async execute(interaction) {

		const channelID = interaction.channel.id;

		if (parties[channelID]) {
			if (!parties[channelID].ended) {

				interaction.reply(parties[channelID].render());

				parties[channelID].message = await interaction.fetchReply();
				return interaction.channel.send({content: "Il y a déjà un jeu en cours !", ephemeral: true});
			}
		}
		parties[channelID] = new MasterMindGame(channelID);

		interaction.reply(parties[channelID].render());

		parties[channelID].message = await interaction.fetchReply()

	}, async executeButton(interaction, buttonName) {
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
					interaction.channel.send("Bravo ! Vous avez gagné ! :tada: :tada: :tada:");
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
	}
};

class MasterMindGame {
	/**
	 * @param {string}
	 */
	channel;

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
		const data = embedData.get(this.getRows(), {
			title: this.ended ? 'Jeu terminé !' : 'Il faut trouver la recette !',
		})

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


		return {embeds: data.embeds, files: data.files, components: rows};
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

		console.log(retour);

		this.rows.push([]);
		this.currentRow++;

		if (!fails) {
			this.ended = true;
			return true;
		}

		return false;
	}
}