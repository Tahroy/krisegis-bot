const { SlashCommandBuilder } = require('discord.js')
const { ButtonBuilder, ActionRowBuilder } = require('discord.js')
const { ButtonStyle } = require('discord-api-types/v10')
const Question = require('../database/Question')
const { PermissionFlagsBits } = require('discord-api-types/v8')

// Utilisez un objet pour stocker les scores des participants par canal
const channelScores = new Map()

module.exports = {
    opts: {},
    data: new SlashCommandBuilder()
        .setName('quizz')
        .setDescription('Lance un quizz !')
        .addSubcommand(subcommmand => subcommmand
            .setName('start')
            .setDescription('Lance le quizz')
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
                        .setName('answers')
                        .setDescription('Réponses séparées par des virgules')
                        .setRequired(true)
                )
                .addStringOption(
                    option => option
                        .setName('correct_answer')
                        .setDescription('La bonne réponse')
                        .setRequired(true)
                )
        ),

    async execute (interaction) {
        if (interaction.options.getSubcommand() === 'add') {
            this.addQuestion(interaction)
            return
        }

        // Créez un canal de scores pour le canal actuel
        if (!channelScores.has(interaction.channelId)) {
            const currentChannelData = {
                scores: new Map(),
                currentQuestionIndex: 0,
                questions: [],
            }

            // Ajout de 10 questions aléatoires (sans répétition) dans le canal
            const availableQuestions = await getRandomQuestions();
            console.log(availableQuestions);
            for (let i = 0; i < 5; i++) {
                const randomIndex = Math.floor(Math.random() * availableQuestions.length)
                let question = availableQuestions.splice(randomIndex, 1)[0]
                question.participations = new Map()
                currentChannelData.questions.push(question)
            }

            console.log(currentChannelData)
            channelScores.set(interaction.channelId, currentChannelData)
        }

        // Commencez le quizz en envoyant la première question
        sendQuestion(interaction)
        interaction.reply({ 'content': 'Le quizz a commencé !', 'ephemeral': true })
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
        }

        // Passez à la question suivante
        console.log(`${interaction.user.username} a répondu ${selectedAnswer}`)
        await interaction.reply({ 'content': `Tu as répondu « ${selectedAnswer} »`, 'ephemeral': true })
    },
    addQuestion (interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return interaction.reply({ 'content': 'Vous n\'avez pas la permission de faire cela !', 'ephemeral': true })
        }
        const question = interaction.options.getString('question')
        const answers = interaction.options.getString('answers')
        const correctAnswer = interaction.options.getString('correct_answer')

        const answersArray = answers.split(',')

        if (!answersArray.includes(correctAnswer)) {
            return interaction.reply({ 'content': 'La bonne reponse est incorrecte !', 'ephemeral': true })
        }

        if (answersArray.length < 4) {
            return interaction.reply({ 'content': 'Il faut au moins 4 reponses !', 'ephemeral': true })
        }

        Question.create({
            question: question,
            answers: answersArray,
            correctAnswer: correctAnswer,
        })
            .then((question) => {
                console.log(`Question créée : ${question.question}`);
                return interaction.reply({
                    'content': 'Question ajoutée !',
                    'ephemeral': true
                })
            })
            .catch((error) => {
                console.error('Erreur lors de la création de la question :', error);
                return interaction.reply({
                    'content': 'Erreur lors de la création de la question !',
                    'ephemeral': true
                })
            });
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

    console.log(currentQuestion)
    // Créez les boutons de réponse
    const buttons = currentQuestion.answers.map((answer) => {
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

    console.log(`Question envoyée ${currentQuestion.question}`)

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

async function getRandomQuestions() {
    try {
        const questions = await Question.findAll();

        if (questions.length === 0) {
            console.log('Aucune question trouvée.');
            return [];
        }

        // Mélangez les questions de manière aléatoire
        return questions.sort(() => 0.5 - Math.random());
    } catch (error) {
        console.error('Erreur lors de la récupération des questions aléatoires :', error);
        return [];
    }
}