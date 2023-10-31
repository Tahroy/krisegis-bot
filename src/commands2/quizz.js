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
        question: 'Quel dragon a pondu le Dofus Ébène ?',
        answers: ['Grougalorasalar', 'Gargoylone', 'Grougaloragran', 'Ouronigride'],
        correctAnswer: 'Grougalorasalar'
    },
    {
        question: 'Quel est le continent principal du Monde des Douze ?',
        answers: ['Amakna', 'Frigost', 'Otomaï', 'Astrub'],
        correctAnswer: 'Amakna'
    },
    {
        question: 'Quel Favori possède une toge rouge vive ?',
        answers: ['Malma', 'Malvadar', 'Morre', 'Mirah'],
        correctAnswer: 'Malvadar'
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
        question: 'Qui est le dragon de l\'eau ?',
        answers: ['Bolgrot', 'Khelebragon', 'Ignemikal', 'Aguabrial'],
        correctAnswer: 'Aguabrial'
    },
    {
        question: "Qui est le Méryde du fer ?",
        answers: ['Macugny', 'Patawaii', 'Kuri', 'Sili'],
        correctAnswer: 'Sili'
    },
    {
        question: "Où demeure Belladone ?",
        answers: ['Ereboria', 'Albuera', 'Plan Astral', 'Ephedrya'],
        correctAnswer: 'Ephedrya'
    },
    {
        question: "Qui est le chef des Kitsounes tué par Daïgoro ?",
        answers: ['Red', 'Kazuo', 'Pichon', 'Pandalia'],
        correctAnswer: 'Red'
    },
    {
        question: "Qui est Méthée ?",
        answers: ['Une sorcière', 'Une fermière', 'Une aventurière', 'Une divinité'],
        correctAnswer: 'Une sorcière'
    },
    {
        question: "Qui est le maître de Bavdur ?",
        answers: ['Guerre', 'Misère', 'Servitude', 'Corruption'],
        correctAnswer: 'Servitude'
    },
    {
        question: "Quel clan de Nimbos n'existe pas ?",
        answers: ['Boutefeu', 'Ventrepierre', 'Clochecuivre', 'Blanchebière'],
        correctAnswer: 'Clochecuivre'
    },
    {
        question: "Quel est le nom du Saigneur de Jade ?",
        answers: ['Crocdjade', 'Crodur', 'Crolaklakos', 'Crocahualpa'],
        correctAnswer: 'Crocahualpa'
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
                let question = availableQuestions.splice(randomIndex, 1)[0];
                question.participations = new Map()
                currentChannelData.questions.push(question)
            }

            console.log(currentChannelData);
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
        await interaction.reply({ 'content': `Tu as répondu ! « ${selectedAnswer} »`, 'ephemeral': true })
    },
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

    console.log(currentQuestion);
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
        await interaction.followUp(`Le temps est écoulé ! La réponse était « ${currentQuestion.correctAnswer} »`)
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
            await interaction.followUp(scoreMessage)
        }
    }, 10000)
}