import React, { useState, useEffect } from 'react';
import { getQuestionsByCategory, Question } from '../utils/questionLoader';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

const AptitudeAssessment: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [scores, setScores] = useState<Record<string, number>>({});
  const [totalScore, setTotalScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Load aptitude questions
    const loadedQuestions = getQuestionsByCategory('aptitude');
    setQuestions(loadedQuestions);
  }, []);

  const handleAnswerSelect = (questionId: string, answerIndex: number, score: number) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answerIndex
    });

    // Update category scores
    const question = questions.find(q => q.id === questionId);
    if (question) {
      const category = question.category;
      const newScores = { ...scores };
      newScores[category] = (newScores[category] || 0) + score;
      setScores(newScores);
      setTotalScore(prevTotal => prevTotal + score);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResults(true);
      // Save scores to localStorage
      saveScoresToLocalStorage();
    }
  };

  const saveScoresToLocalStorage = () => {
    const scoresObject = {
      ...scores,
      "Total Score": totalScore
    };
    localStorage.setItem("aptitudeTestScores", JSON.stringify(scoresObject));
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setScores({});
    setTotalScore(0);
    setShowResults(false);
  };

  const handleViewResults = () => {
    navigate('/dashboard/reports');
  };

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="ml-3 text-gray-600">Loading questions...</p>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Assessment Results</h2>
        
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Your Scores:</h3>
          <div className="space-y-3">
            {Object.entries(scores).map(([category, score]) => (
              <div key={category} className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">{category}:</span>
                <span className="font-medium text-indigo-600 dark:text-indigo-400">{score}</span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
              <span className="font-semibold text-gray-800 dark:text-gray-200">Total Score:</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">{totalScore}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <button
            onClick={handleRestart}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Take Again
          </button>
          <button
            onClick={handleViewResults}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            View Detailed Results
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const questionNumber = currentQuestionIndex + 1;
  const isAnswerSelected = selectedAnswers[currentQuestion.id] !== undefined;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Aptitude Assessment</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Question {questionNumber} of {questions.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div 
            className="bg-indigo-600 h-2.5 rounded-full" 
            style={{ width: `${(questionNumber / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {questionNumber}. {currentQuestion.question}
        </h3>
        
        <div className="space-y-3">
          {currentQuestion.answers.map((answer, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(currentQuestion.id, index, answer.score)}
              className={`w-full text-left p-3 rounded-md border ${
                selectedAnswers[currentQuestion.id] === index
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700'
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {answer.text}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => currentQuestionIndex > 0 && setCurrentQuestionIndex(currentQuestionIndex - 1)}
          className={`px-4 py-2 rounded-md ${
            currentQuestionIndex > 0
              ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
          }`}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </button>
        
        <button
          onClick={handleNext}
          disabled={!isAnswerSelected}
          className={`px-4 py-2 rounded-md ${
            isAnswerSelected
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-indigo-300 dark:bg-indigo-800 text-indigo-100 dark:text-indigo-300 cursor-not-allowed'
          }`}
        >
          {currentQuestionIndex < questions.length - 1 ? 'Next' : 'Finish'}
        </button>
      </div>
    </div>
  );
};

export default AptitudeAssessment; 