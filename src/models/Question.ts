import {DataTypes, Model} from 'sequelize';
import sequelize from '../utils/database';

interface QuestionAttributes {
    question: string;
    answers: string[];
    correctAnswer: string;
}

type QuestionCreationAttributes = QuestionAttributes;

class Question extends Model<QuestionAttributes, QuestionCreationAttributes> implements QuestionAttributes {
    public question!: string;
    public answers!: string[];
    public correctAnswer!: string;
}

Question.init({
    question: {
        type: DataTypes.STRING, allowNull: false,
    }, answers: {
        type: DataTypes.JSON, // Utilisez le type JSON pour stocker un tableau d'answers
    }, correctAnswer: {
        type: DataTypes.STRING, allowNull: false,
    },
}, {
    sequelize, modelName: 'Question',
});

export default Question;