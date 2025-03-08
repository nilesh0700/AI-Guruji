import interestQuestions from '../data/interestQuestions.json';
import aptitudeQuestions from '../data/aptitudeQuestions.json';

// Define the Question type
export interface Question {
  id: string;
  question: string;
  answers: {
    text: string;
    score: number;
  }[];
  category: string;
}

// Function to get questions by category
export const getQuestionsByCategory = (category: string): Question[] => {
  switch (category.toLowerCase()) {
    case 'interest':
      return interestQuestions;
    case 'aptitude':
      return aptitudeQuestions;
    default:
      return [];
  }
};

// Function to get all questions
export const getAllQuestions = (): Question[] => {
  return [
    ...interestQuestions,
    ...aptitudeQuestions
  ];
};

// Function to get questions by multiple categories
export const getQuestionsByCategories = (categories: string[]): Question[] => {
  const lowerCaseCategories = categories.map(cat => cat.toLowerCase());
  return getAllQuestions().filter(q => 
    lowerCaseCategories.includes(q.category.toLowerCase())
  );
};

// Function to calculate scores by category
export const calculateScoresByCategory = (answers: Record<string, number>): Record<string, number> => {
  const scores: Record<string, number> = {};
  const questions = getAllQuestions();
  
  for (const [questionId, answerIndex] of Object.entries(answers)) {
    const question = questions.find(q => q.id === questionId);
    if (question) {
      const answer = question.answers[answerIndex];
      if (answer) {
        scores[question.category] = (scores[question.category] || 0) + answer.score;
      }
    }
  }
  
  return scores;
}; 