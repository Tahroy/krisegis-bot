const { SlashCommandBuilder } = require('@discordjs/builders')
const { ButtonBuilder, ActionRowBuilder } = require('discord.js')
const { ButtonStyle } = require('discord-api-types/v10')

/*
    Qui est le gardien du Dofus Primordial Émeraude ?
    Quel dieu est associé à la classe des Enutrofs ?
    Quel personnage légendaire a créé le Dofus Ébène ?
    Quel continent est le principal lieu d'action de Dofus ?
    Quelle est l'histoire derrière le Dofus Ocre ?
    Quel dieu est responsable de la création du Monde des Douze ?
    Qui sont les trois dragons primordiaux dans l'univers de Dofus ?
    Quel est le nom du roi qui règne sur la cité de Bonta ?
    Quel objet est nécessaire pour devenir un Dofusé ?
    Qui est le principal antagoniste de la saga Wakfu, liée à l'univers de Dofus ?
 */
// Définissez vos questions et réponses dans un tableau
const questions = [
    {
        question: 'Qui est le gardien du Dofus Primordial Émeraude ?',
        answers: ['Chêne Mou', 'Bubulle', 'Aerafal', 'Dark Vlad'],
        correctAnswer: 'Dark Vlad'
    },
    {
        question: 'Quel dieu est associé à la classe des Enutrofs ?',
        answers: ['Enutopia', 'Wahn', 'Enutrof', 'Ruel'],
        correctAnswer: 'Enutrof'
    },
    {
        question: 'Quel dragon a pondu le Dofus Ébène',
        answers: ['Grougalorasalar', 'Gargoylone', 'Grougaloragran', 'Ouronigride'],
        correctAnswer: 'Grougalorasalar'
    },
    {
        question: 'Quel continent est le principal ?',
        answers: ['Amakna', 'Frigost', 'Otomaï', 'Astrub'],
        correctAnswer: 'Amakna'
    },
    {
        question: 'Quel Favori possède une toge rouge vive ?',
        answers: ['Malma', 'Malvadar', 'Morre', 'Mirah'],
    },
    {
        question: 'Quel Dieu a découvert le futur Monde des Dix ?',
        answers: ['Eliatrope', 'Rushu', 'Osamodas', 'Xélor'],
        correctAnswer: 'Osamodas'
    },
    {
        question: 'Quel est le nom du roi qui règne sur la cité de Bonta ?',
        answers: ['Allister', 'Beldarion', 'Amayiro', 'Danathor'],
        correctAnswer: 'Beldarion'
    },
    {
        question: 'Qui dirige réellement Bonta ?',
        answers: ['Allister', 'Beldarion', 'Amayiro', 'Danathor'],
        correctAnswer: 'Danathor'
    },
    {
        question: 'Quel objet est nécessaire pour devenir un Dofusé ?',
        answers: ['Dofus Émeraude', 'Hein ?', 'Dofus Ocre', 'Dofusteuse'],
        correctAnswer: 'Hein ?'
    },
    {
        question: "Qui est le dragon de l'eau ?",
        answers: ['Bolgrot', 'Khelebragon', 'Ignemikal', 'Aguabrial'],
        correctAnswer: 'Aguabrial'
    }
    // Ajoutez d'autres questions de la même manière
]

// Utilisez un objet pour stocker les scores des participants par canal
const channelScores = new Map()

module.exports = {
    opts: {
        admin: true
    },
    data: new SlashCommandBuilder()
        .setName('quizz')
        .setDescription('Lance un quizz !'),

    async execute (interaction) {
        // Créez un canal de scores pour le canal actuel
        if (!channelScores.has(interaction.channelId)) {
            const currentChannelData = {
                scores: new Map(),
                currentQuestionIndex: 0,
                questions: [],
            }

            // Ajout de 10 questions aléatoires (sans répétition) dans le canal
            const availableQuestions = [...questions]
            for (let i = 0; i < 5; i++) {
                const randomIndex = Math.floor(Math.random() * availableQuestions.length)
                currentChannelData.questions.push(availableQuestions.splice(randomIndex, 1)[0])
            }

            channelScores.set(interaction.channelId, currentChannelData)
        }

        console.log(channelScores.get(interaction.channelId))

        // Commencez le quizz en envoyant la première question
        sendQuestion(interaction)
    },

    async executeButton (interaction, buttonName) {
        const selectedAnswer = buttonName.replace('quizz-', '')
        const currentChannelData = channelScores.get(interaction.channelId)

        if (!currentChannelData) {
            return interaction.reply('Aucun jeu en cours !', { 'ephemeral': true })
        }

        const currentQuestion = currentChannelData.questions[currentChannelData.currentQuestionIndex]
        const currentChannelScores = currentChannelData.scores

        if (!currentChannelScores) {
            return interaction.reply('Aucun jeu en cours !', { 'ephemeral': true })
        }

        if (!currentQuestion) {
            return interaction.reply('Aucune question en cours !', { 'ephemeral': true })
        }

        // Vérifiez si la réponse est correcte
        if (currentQuestion.correctAnswer === selectedAnswer) {
            // Incrémentez le score du participant
            const authorId = interaction.user.id
            if (!currentChannelScores.has(authorId)) {
                currentChannelScores.set(authorId, 0)
            }
            currentChannelScores.set(authorId, currentChannelScores.get(authorId) + 1)
        }

        // Passez à la question suivante
        currentChannelData.currentQuestionIndex++

        // Si le quizz n'est pas terminé, envoyez la question suivante
        if (currentChannelData.currentQuestionIndex < currentChannelData.questions.length) {
            sendQuestion(interaction)
        } else {
            // Le quizz est terminé, annoncez le score
            let scoreMessage = `Quizz terminé ! Scores :\n`
            currentChannelScores.forEach((score, userId) => {
                const user = interaction.guild.members.cache.get(userId)
                scoreMessage += `${user ? user.displayName : 'Utilisateur inconnu'} : ${score} point(s)\n`
            })
            channelScores.delete(interaction.channelId)
            await interaction.deferReply()
            await interaction.followUp(scoreMessage)
            //await interaction.channel.send(scoreMessage);
            currentChannelScores.clear()
        }
    },
}

function sendQuestion (interaction) {
    const currentChannelData = channelScores.get(interaction.channelId)

    if (!currentChannelData) {
        return interaction.reply('Aucun jeu en cours !', { 'ephemeral': true })
    }

    const currentQuestion = currentChannelData.questions[currentChannelData.currentQuestionIndex]

    if (!currentQuestion) {
        return interaction.reply('Plus de questions disponibles !', { 'ephemeral': true })
    }

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
    interaction.reply({
        content: currentQuestion.question,
        components: [row],
    })

    // Définissez un délai de 30 secondes pour répondre à la question
    setTimeout(() => {
        interaction.followUp('Le temps est écoulé !')
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
                scoreMessage += `${user ? user.displayName : 'Utilisateur inconnu'} : ${score} point(s)\n`
            })
            channelScores.delete(interaction.channelId)
            interaction.followUp(scoreMessage)
        }
    }, 30000)
}