import React, { useState, useEffect } from 'react';
import CareerChatbot from '../components/CareerChatbot';
import { AssessmentData } from '../utils/geminiApi';

export default function ChatBot() {
  const [assessmentData, setAssessmentData] = useState<AssessmentData>({
    interestResults: null,
    aptitudeResults: null,
    nonConventionalResults: null,
    completedAssessments: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load assessment data from localStorage
  useEffect(() => {
    try {
      // Load interest test scores
      const storedInterestScores = localStorage.getItem('interestTestScores');
      let interestResults = null;
      if (storedInterestScores) {
        interestResults = JSON.parse(storedInterestScores);
      }

      // Load aptitude test scores
      const storedAptitudeScores = localStorage.getItem('aptitudeTestScores');
      let aptitudeResults = null;
      if (storedAptitudeScores) {
        aptitudeResults = JSON.parse(storedAptitudeScores);
      }

      // Load non-conventional careers test scores
      const storedNonConventionalScores = 
        localStorage.getItem('nonConventionalTestScores') || 
        localStorage.getItem('nonconventionalTestScores');
      
      let nonConventionalResults = null;
      if (storedNonConventionalScores) {
        nonConventionalResults = JSON.parse(storedNonConventionalScores);
      }

      // Calculate completed assessments
      const completedCount = [
        !!interestResults, 
        !!aptitudeResults, 
        !!nonConventionalResults
      ].filter(Boolean).length;

      // Update state with assessment data
      setAssessmentData({
        interestResults,
        aptitudeResults,
        nonConventionalResults,
        completedAssessments: completedCount
      });
    } catch (error) {
      console.error('Error loading assessment data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Career Assistant</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Get personalized career guidance based on your assessment results
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : assessmentData.completedAssessments > 0 ? (
        <CareerChatbot assessmentData={assessmentData} />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Assessment Data Available</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You need to complete at least one assessment before using the AI Career Assistant.
            The AI uses your assessment results to provide personalized guidance.
          </p>
          <a 
            href="/dashboard/assessments" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Take an Assessment
          </a>
        </div>
      )}
    </div>
  );
}