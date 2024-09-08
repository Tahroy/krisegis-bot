const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const { ButtonBuilder, ActionRowBuilder } = require('discord.js')
const { ButtonStyle } = require('discord-api-types/v10')
const Question = require('../database/Question')
const { PermissionFlagsBits } = require('discord-api-types/v8')
const Server = require('../database/Server')
const { createEmbed } = require('../utils/embed')
const { addPlayerItem } = require('../utils/Utils')

// Utilisez un objet pour stocker les scores des participants par canal
const channelScores = new Map()

const adminsIds = [
    "328239065918996481", // Astreius
    "178147970385051649", // Tahroy
    "266673171409666053", // Alba
    "376674327405264908", // Soute
    "136144773953093632",  // Nar8
    "140022439936655370", // Wahn
];

module.exports = {
    opts: {},
    data: new SlashCommandBuilder()
        .setName('quizz')
        .setDescription('Lance un quizz !')
        .addSubcommand(subcommmand => subcommmand
            .setName('start')
            .setDescription('Lance le quizz')
            .addIntegerOption(
                option => option
                    .setName('nb_questions')
                    .setDescription('Nombre de questions')
                    .setRequired(true)
                    .setMinValue(5)
                    .setMaxValue(20)
            )
        )
        .addSubcommand(
            subcommand => subcommand
                .setName('add')
                .setDescription('Ajouter une question')
                .addStringOption(
                    option => option
                        .setName('question')
                        .setDescription('Question à poser')
                        .setRequired(true)
                )
                .addStringOption(
                    option => option
                        .setName('correct_answer')
                        .setDescription('La bonne réponse')
                        .setRequired(true)
                )
                .addStringOption(
                    option => option
                        .setName('answers')
                        .setDescription('Autres réponses séparées par des virgules')
                        .setRequired(true)
                )
        )
        .addSubcommand(
            subcommand => subcommand
                .setName('edit')
                .setDescription('editer une question')
                .addStringOption(
                    option => option
                        .setName('question')
                        .setDescription('Question à éditer')
                        .setRequired(true)
                )
                .addStringOption(
                    option => option
                        .setName('correct_answer')
                        .setDescription('La bonne réponse')
                        .setRequired(true)
                )
                .addStringOption(
                    option => option
                        .setName('answers')
                        .setDescription('Réponses séparées par des virgules')
                        .setRequired(true)
                )
        )
        .addSubcommand(
            subcommand => subcommand
                .setName('list')
                .setDescription('Liste des questions')
        ),

    async execute (interaction) {
        switch (interaction.options.getSubcommand()) {
            case 'start':
                await this.startQuizz(interaction)
                return
            case 'add':
                this.addQuestion(interaction)
                return
            case 'edit':
                await this.editQuestion(interaction)
                return
            case 'list':
                await this.listQuestions(interaction)
                return
            default:
                await interaction.reply({ content: 'Commande inconnue !', ephemeral: true })
        }
    },

    async executeButton (interaction, buttonName) {
        const selectedAnswer = buttonName.replace('quizz-', '')
        const currentChannelData = channelScores.get(interaction.channelId)

        if (!currentChannelData) {
            return interaction.reply({ 'content': 'Aucun jeu en cours !', 'ephemeral': true })
        }

        const currentQuestion = currentChannelData.questions[currentChannelData.currentQuestionIndex]
        const currentChannelScores = currentChannelData.scores

        if (!currentChannelScores) {
            return interaction.reply({ 'content': 'Aucun jeu en cours !', 'ephemeral': true })
        }

        if (!currentQuestion) {
            return interaction.reply({ 'content': 'Aucune question en cours !', 'ephemeral': true })
        }

        if (currentQuestion.participations.has(interaction.user.id)) {
            return interaction.reply({ 'content': 'Vous avez répondu !', 'ephemeral': true })
        }

        currentQuestion.participations.set(interaction.user.id, selectedAnswer)

        // Incrémentez le score du participant
        const authorId = interaction.user.id
        if (!currentChannelScores.has(authorId)) {
            currentChannelScores.set(authorId, 0)
        }

        // Vérifiez si la réponse est correcte
        if (currentQuestion.correctAnswer === selectedAnswer) {
            currentChannelScores.set(authorId, currentChannelScores.get(authorId) + 1)
            addPlayerItem(interaction.user, 'point quizz', 'question')
        }

        // Passez à la question suivante
        console.log(`${interaction.user.username} a répondu ${selectedAnswer}`)
        await interaction.reply({ 'content': `Tu as répondu « ${selectedAnswer} »`, 'ephemeral': true })
    },
    async startQuizz (interaction) {

        const nombre = interaction.options.getInteger('nb_questions')

        // Créez un canal de scores pour le canal actuel
        if (!channelScores.has(interaction.channelId)) {
            const currentChannelData = {
                scores: new Map(),
                currentQuestionIndex: 0,
                questions: [],
            }

            // Ajout de 10 questions aléatoires (sans répétition) dans le canal
            const availableQuestions = await getRandomQuestions()
            //console.log(availableQuestions)
            for (let i = 0; i < nombre; i++) {
                const randomIndex = Math.floor(Math.random() * availableQuestions.length)
                let question = availableQuestions.splice(randomIndex, 1)[0]
                question.participations = new Map()
                currentChannelData.questions.push(question)
            }

            //console.log(currentChannelData)
            channelScores.set(interaction.channelId, currentChannelData)
        }

        // Commencez le quizz en envoyant la première question
        sendQuestion(interaction)
        interaction.reply({ 'content': 'Le quizz a commencé !', 'ephemeral': true })
    },
    addQuestion (interaction) {
        // Si ce n'est pas un admin, on retourne une erreur
        if (!adminsIds.includes(interaction.user.id)) {
            return interaction.reply({ 'content': 'Vous n\'avez pas la permission de faire cela !', 'ephemeral': true })
        }

        const question = interaction.options.getString('question')
        const answers = interaction.options.getString('answers')
        const correctAnswer = interaction.options.getString('correct_answer')

        // On met un trim et un unique sur l'array
        const answersArray = answers.split(',')
            .map(answer => answer.trim())
            .filter((answer, index, self) => self.indexOf(answer) === index)

        console.log(answersArray);

        if (answersArray.includes(correctAnswer)) {
            return interaction.reply({ 'content': 'La bonne reponse ne doit pas être dans les mauvaises !', 'ephemeral': true })
        }

        if (answersArray.length < 3) {
            return interaction.reply({ 'content': 'Il faut au moins 4 reponses !', 'ephemeral': true })
        }

        Question.create({
            question: question,
            answers: answersArray,
            correctAnswer: correctAnswer,
        })
            .then((question) => {
                console.log(`Question créée : ${question.question}`)
                return interaction.reply({
                    'content': 'Question ajoutée !',
                    'ephemeral': true
                })
            })
            .catch((error) => {
                console.error('Erreur lors de la création de la question :', error)
                return interaction.reply({
                    'content': 'Erreur lors de la création de la question !',
                    'ephemeral': true
                })
            })
    },
    async editQuestion (interaction) {
        // Si ce n'est pas un admin, on retourne une erreur
        if (!adminsIds.includes(interaction.user.id)) {
            return interaction.reply({ 'content': 'Vous n\'avez pas la permission de faire cela !', 'ephemeral': true })
        }

        const questionString = interaction.options.getString('question')
        const answers = interaction.options.getString('answers')
        const correctAnswer = interaction.options.getString('correct_answer')

        // On met un trim et un unique sur l'array
        const answersArray = answers.split(',')
            .map(answer => answer.trim())
            .filter((answer, index, self) => self.indexOf(answer) === index)

        const searchQuestion = await Question.findOne({
            where: { question: questionString }
        })

        if (!searchQuestion) {
            return interaction.reply({ 'content': 'La question n\'existe pas !', 'ephemeral': true })
        }

        if (answersArray.includes(correctAnswer)) {
            return interaction.reply({ 'content': 'La bonne reponse ne doit pas être dans les mauvaises !', 'ephemeral': true })
        }

        if (answersArray.length < 4) {
            return interaction.reply({ 'content': 'Il faut au moins 4 reponses !', 'ephemeral': true })
        }

        Question.update({
            question: questionString,
            answers: answersArray,
            correctAnswer: correctAnswer,
        })
            .then((question) => {
                console.log(`Question créée : ${question.question}`)
                return interaction.reply({
                    'content': 'Question ajoutée !',
                    'ephemeral': true
                })
            })
            .catch((error) => {
                console.error('Erreur lors de la création de la question :', error)
                return interaction.reply({
                    'content': 'Erreur lors de la création de la question !',
                    'ephemeral': true
                })
            })
    },
    async listQuestions (interaction) {
        // Si ce n'est pas un admin, on retourne une erreur
        if (!adminsIds.includes(interaction.user.id)) {
            return interaction.reply({ 'content': 'Vous n\'avez pas la permission de faire cela !', 'ephemeral': true })
        }

        await interaction.reply('Chargement...');
        const questions = await Question.findAll()

        let fields = [];

        for (let i = 0; i < questions.length; i++) {
            fields.push({
                name: questions[i].question,
                value: questions[i].answers.join(', ')
            })
            if ((i !== 0 && i % 10 === 0) || i === questions.length - 1) {
                const embed = createEmbed(fields, {
                    title: `Questions du Quizz`,
                    description: "",
                    author: ""
                })
                await interaction.channel.send({ embeds: embed.embeds, files: embed.files })
                fields = [];
            }
        }

        await interaction.deleteReply();
    }
}

function sendQuestion (interaction) {
    const currentChannelData = channelScores.get(interaction.channelId)

    if (!currentChannelData) {
        return interaction.reply({ 'content': 'Aucun jeu en cours !', 'ephemeral': true })
    }

    const currentQuestion = currentChannelData.questions[currentChannelData.currentQuestionIndex]

    if (!currentQuestion) {
        return interaction.reply({ 'content': 'Plus de questions disponibles !', 'ephemeral': true })
    }

    // Mélanger les réponses de manière aléatoire
    const shuffledAnswers = shuffleArray(currentQuestion.answers);

    // Sélectionner uniquement les trois premières réponses mélangées
    const selectedAnswers = shuffledAnswers.slice(0, 3);

    selectedAnswers.push(currentQuestion.correctAnswer);
    console.log('avant', selectedAnswers)
    const finalAnswers = shuffleArray(selectedAnswers);
    console.log('apres', finalAnswers)
    // Créez les boutons de réponse
    const buttons = finalAnswers.map((answer) => {
        return new ButtonBuilder()
            .setCustomId(`quizz-${answer}`)
            .setLabel(answer)
            .setStyle(ButtonStyle.Primary)
    })

    // Créez une rangée de boutons
    const row = new ActionRowBuilder().addComponents(buttons)

    // Envoyez la question avec les boutons
    interaction.channel.send({
        content: currentQuestion.question,
        components: [row],
    })

//    console.log(`Question envoyée ${currentQuestion.question}`)

    // Définissez un délai de 30 secondes pour répondre à la question
    setTimeout(async () => {
        await interaction.channel.send(`Le temps est écoulé ! La réponse était « **${currentQuestion.correctAnswer}** »`)
        // Passez à la question suivante
        currentChannelData.currentQuestionIndex++
        if (currentChannelData.currentQuestionIndex < currentChannelData.questions.length) {
            sendQuestion(interaction)
        } else {
            // Le quizz est terminé, annoncez le score
            const currentChannelData = channelScores.get(interaction.channelId)
            const currentChannelScores = currentChannelData.scores ?? new Map()
            let scoreMessage = `Quizz terminé ! Scores :\n`
            currentChannelScores.forEach((score, userId) => {
                const user = interaction.guild.members.cache.get(userId)
                const plurial = score > 1 ? 's' : ''
                scoreMessage += `${user ? user.displayName : 'Utilisateur inconnu'} : ${score} point${plurial}\n`
            })
            channelScores.delete(interaction.channelId)
            await interaction.channel.send(scoreMessage)
        }
    }, 15000)
}

// Fonction de mélange (shuffle) basée sur l'algorithme de Fisher-Yates
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

async function getRandomQuestions () {
    try {
        const questions = await Question.findAll()

        if (questions.length === 0) {
            console.log('Aucune question trouvée.')
            return []
        }

        // Mélangez les questions de manière aléatoire
        return questions.sort(() => 0.5 - Math.random())
    } catch (error) {
        console.error('Erreur lors de la récupération des questions aléatoires :', error)
        return []
    }
}