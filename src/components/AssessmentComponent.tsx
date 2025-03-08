import React, { useState, useEffect } from 'react';
import { getQuestionsByCategory, Question } from '../utils/questionLoader';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface AssessmentComponentProps {
  assessmentType: string;
}

const AssessmentComponent: React.FC<AssessmentComponentProps> = ({ assessmentType }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const loadedQuestions = getQuestionsByCategory(assessmentType.toLowerCase());
        setQuestions(loadedQuestions);
        setLoading(false);
      } catch (error) {
        console.error(`Error loading ${assessmentType} questions:`, error);
        setLoading(false);
      }
    };

    loadQuestions();
  }, [assessmentType]);

  const handleAnswerSelect = (answerIndex: number, score: number, category: string) => {
    setSelectedAnswer(answerIndex);
    
    // Update scores for the category
    setScores(prevScores => {
      const categoryScore = (prevScores[category] || 0) + score;
      return { ...prevScores, [category]: categoryScore };
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    } else {
      setIsCompleted(true);
      saveResults();
    }
  };

  const saveResults = async () => {
    // Save to localStorage for the Reports page
    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    const scoresWithTotal = {
      ...scores,
      "Total Score": totalScore
    };
    localStorage.setItem(`${assessmentType.toLowerCase()}TestScores`, JSON.stringify(scoresWithTotal));
    
    // Log results to console
    console.log('Assessment results:', {
      user_id: user?.id || 'anonymous',
      assessment_type: assessmentType.toLowerCase(),
      scores: scores,
      completed_at: new Date().toISOString()
    });
  };

  const getTopCategories = () => {
    return Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category, score]) => ({ category, score }));
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading questions...</div>;
  }

  if (questions.length === 0) {
    return <div className="flex justify-center items-center h-screen">No questions available for {assessmentType}.</div>;
  }

  if (isCompleted) {
    const topCategories = getTopCategories();
    
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Assessment Completed!</h2>
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4">Your Top {assessmentType} Matches:</h3>
          <ul className="list-disc pl-6 space-y-2">
            {topCategories.map((item, index) => (
              <li key={index} className="text-lg">
                <span className="font-medium">{item.category}:</span> {item.score} points
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/dashboard/reports')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            View All Results
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="mb-4 text-sm text-gray-500">
        Question {currentQuestionIndex + 1} of {questions.length}
      </div>
      <h2 className="text-xl font-bold mb-6">{currentQuestion.question}</h2>
      <div className="space-y-4">
        {currentQuestion.answers.map((answer, index) => (
          <button
            key={index}
            onClick={() => handleAnswerSelect(index, answer.score, currentQuestion.category)}
            className={`w-full text-left p-4 rounded-md border ${
              selectedAnswer === index
                ? 'bg-blue-100 border-blue-500'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            {answer.text}
          </button>
        ))}
      </div>
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleNextQuestion}
          disabled={selectedAnswer === null}
          className={`px-6 py-2 rounded-md ${
            selectedAnswer === null
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          } transition-colors`}
        >
          {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Complete Assessment'}
        </button>
      </div>
    </div>
  );
};

export default AssessmentComponent; 