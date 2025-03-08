import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Timer, AlertCircle } from 'lucide-react';
import { useAssessmentStore } from '../store/assessmentStore';
import GenericAssessment from '../components/GenericAssessment';

// Import questionsData as JSON
import questionsData from '../data/questions.json';

export default function AssessmentTest() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(1200); // 20 minutes
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Always call hooks at the top level, before any conditional returns
  const questions = useMemo(() => {
    if (!testId || !(testId in questionsData)) {
      return [];
    }
    return questionsData[testId as keyof typeof questionsData];
  }, [testId]);

  const currentQ = questions[currentQuestion];

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (currentQ) {
      handleSubmit();
    }
  }, [timeLeft, currentQ]);

  // Check if we're using one of our specialized assessment types
  const isSpecializedAssessment = ['interest', 'aptitude', 'nonconventional'].includes(testId || '');
  console.log(`Assessment type: ${testId}, isSpecialized: ${isSpecializedAssessment}`);

  // If this is a specialized assessment type, render the GenericAssessment component
  if (isSpecializedAssessment && testId) {
    console.log(`Rendering GenericAssessment for ${testId}`);
    return <GenericAssessment assessmentType={testId} />;
  }

  const handleAnswer = (answer: string) => {
    if (currentQ) {
      setAnswers(prev => ({
        ...prev,
        [currentQ.id]: answer
      }));
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(c => c + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(c => c - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
        const result = {
            id: Date.now().toString(),
            userId: 'default-user',  // Default user ID for all submissions
            assessmentId: testId!,
            answers,
            score: {
                technical: 85,
                analytical: 90,
                communication: 80,
                leadership: 75
            },
            completedAt: new Date().toISOString(),
        };

        const { addTestResult } = useAssessmentStore.getState();
        addTestResult(result);
        navigate('/dashboard/reports');
    } catch (error) {
        console.error('Error submitting assessment:', error);
        alert('Failed to submit assessment. Please try again.');
    } finally {
        setIsSubmitting(false);
    }
};

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentQ) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Assessment not found. Please select a valid assessment from the assessments page.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                Question {currentQuestion + 1} of {questions.length}
              </h2>
              <div className="mt-1 text-sm text-gray-500">
                {testId ? testId.charAt(0).toUpperCase() + testId.slice(1) : 'Unknown'} Assessment
              </div>
            </div>
            <div className="flex items-center text-gray-600">
              <Timer className="h-5 w-5 mr-2" />
              <span className="font-medium">{formatTime(timeLeft)}</span>
            </div>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="px-6 py-8">
          <h3 className="text-xl font-medium text-gray-900 mb-6">
            {currentQ.text}
          </h3>

          <div className="space-y-3">
            {currentQ.options.map((option: string, index: number) => (
              <label
                key={index}
                className={`block relative rounded-lg border p-4 cursor-pointer hover:border-indigo-500 transition-colors ${
                  answers[currentQ.id] === option
                    ? 'border-indigo-500 ring-2 ring-indigo-500'
                    : 'border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="answer"
                  value={option}
                  checked={answers[currentQ.id] === option}
                  onChange={() => handleAnswer(option)}
                  className="sr-only"
                />
                <span className="text-sm font-medium text-gray-900">{option}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          {currentQuestion === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Submitting...
                </div>
              ) : (
                'Submit Assessment'
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!answers[currentQ.id]}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}