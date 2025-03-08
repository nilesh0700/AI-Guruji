import React, { useState, useEffect } from 'react';
import { Target, Award, TrendingUp, Brain, Briefcase, Calendar, Clock, Star, Sparkles, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { getCareerRecommendations, testGeminiApiConnection, AssessmentData } from '../utils/geminiApi';
import { FEATURES, GEMINI_MODEL } from '../config/env';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const navigate = useNavigate();
  
  // State for assessment results
  const [interestScores, setInterestScores] = useState<Record<string, number>>({});
  const [aptitudeScores, setAptitudeScores] = useState<Record<string, number>>({});
  const [nonConventionalScores, setNonConventionalScores] = useState<Record<string, number>>({});
  const [hasInterestResults, setHasInterestResults] = useState(false);
  const [hasAptitudeResults, setHasAptitudeResults] = useState(false);
  const [hasNonConventionalResults, setHasNonConventionalResults] = useState(false);
  const [recentActivity, setRecentActivity] = useState<{date: string, action: string}[]>([]);

  // State for AI career recommendations
  const [careerRecommendations, setCareerRecommendations] = useState<{career: string, match: number, description: string}[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);

  // State for API connection status
  const [apiConnectionStatus, setApiConnectionStatus] = useState<'untested' | 'success' | 'failed'>('untested');

  // Load assessment results from localStorage
  useEffect(() => {
    // Load interest test scores
    const storedInterestScores = localStorage.getItem('interestTestScores');
    if (storedInterestScores) {
      try {
        const parsedScores = JSON.parse(storedInterestScores);
        setInterestScores(parsedScores);
        setHasInterestResults(true);
        
        // Add to recent activity
        setRecentActivity(prev => [
          { date: new Date().toLocaleDateString(), action: 'Completed Interest Assessment' },
          ...prev
        ]);
      } catch (error) {
        console.error('Error parsing interest test scores:', error);
      }
    }

    // Load aptitude test scores
    const storedAptitudeScores = localStorage.getItem('aptitudeTestScores');
    if (storedAptitudeScores) {
      try {
        const parsedScores = JSON.parse(storedAptitudeScores);
        setAptitudeScores(parsedScores);
        setHasAptitudeResults(true);
        
        // Add to recent activity
        setRecentActivity(prev => [
          { date: new Date().toLocaleDateString(), action: 'Completed Aptitude Assessment' },
          ...prev
        ]);
      } catch (error) {
        console.error('Error parsing aptitude test scores:', error);
      }
    }

    // Load non-conventional careers test scores
    const storedNonConventionalScores = 
      localStorage.getItem('nonConventionalTestScores') || 
      localStorage.getItem('nonconventionalTestScores');
    
    if (storedNonConventionalScores) {
      try {
        const parsedScores = JSON.parse(storedNonConventionalScores);
        setNonConventionalScores(parsedScores);
        setHasNonConventionalResults(true);
        
        // Add to recent activity
        setRecentActivity(prev => [
          { date: new Date().toLocaleDateString(), action: 'Completed Non-Conventional Careers Assessment' },
          ...prev
        ]);
      } catch (error) {
        console.error('Error parsing non-conventional test scores:', error);
      }
    }

    // Test the Gemini API connection
    const testApiConnection = async () => {
      try {
        console.log("Testing API connection...");
        const isConnected = await testGeminiApiConnection();
        setApiConnectionStatus(isConnected ? 'success' : 'failed');
        console.log("API connection test result:", isConnected);
      } catch (error) {
        console.error("Error testing API connection:", error);
        setApiConnectionStatus('failed');
      }
    };
    
    if (FEATURES.ENABLE_GEMINI_API) {
      testApiConnection();
    }

    // Generate AI career recommendations if at least one assessment is completed
    if (hasInterestResults || hasAptitudeResults || hasNonConventionalResults) {
      console.log("Assessments detected, generating recommendations on mount");
      generateCareerRecommendations();
    }
  }, []);

  // Calculate total assessments completed
  const totalAssessmentsCompleted = [
    hasInterestResults, 
    hasAptitudeResults, 
    hasNonConventionalResults
  ].filter(Boolean).length;

  // Calculate average scores for each assessment type
  const calculateAverageScore = (scores: Record<string, number>): number => {
    const scoreValues = Object.entries(scores)
      .filter(([key]) => key !== 'Total Score')
      .map(([, value]) => value);
    
    if (scoreValues.length === 0) return 0;
    return Math.round(scoreValues.reduce((sum, score) => sum + score, 0) / scoreValues.length);
  };

  const interestAvgScore = hasInterestResults ? calculateAverageScore(interestScores) : 0;
  const aptitudeAvgScore = hasAptitudeResults ? calculateAverageScore(aptitudeScores) : 0;
  const nonConventionalAvgScore = hasNonConventionalResults ? calculateAverageScore(nonConventionalScores) : 0;

  // Calculate overall assessment score
  const overallScore = totalAssessmentsCompleted > 0 
    ? Math.round((interestAvgScore + aptitudeAvgScore + nonConventionalAvgScore) / 
        (Number(hasInterestResults) + Number(hasAptitudeResults) + Number(hasNonConventionalResults)))
    : 0;

  // Stats cards data
  const stats = [
    {
      name: 'Assessments Completed',
      value: totalAssessmentsCompleted.toString(),
      icon: Target,
      change: `${3 - totalAssessmentsCompleted} remaining`,
      changeType: totalAssessmentsCompleted === 3 ? 'positive' : 'neutral',
      color: 'bg-blue-500',
    },
    {
      name: 'Assessment Progress',
      value: `${Math.round((totalAssessmentsCompleted / 3) * 100)}%`,
      icon: TrendingUp,
      change: 'Profile completion',
      changeType: 'neutral',
      color: 'bg-green-500',
    },
    {
      name: 'Overall Score',
      value: overallScore > 0 ? `${overallScore}` : 'N/A',
      icon: Award,
      change: overallScore > 0 ? 'Average across assessments' : 'Complete an assessment',
      changeType: 'neutral',
      color: 'bg-purple-500',
    },
    {
      name: 'Assessment Time',
      value: totalAssessmentsCompleted > 0 ? '~20 min' : 'N/A',
      icon: Clock,
      change: 'Per assessment',
      changeType: 'neutral',
      color: 'bg-teal-500',
    },
  ];

  // Chart data for interest assessment
  const interestData = {
    labels: ['Assessment Completion', 'Questions Answered', 'Time Spent'],
    datasets: [{
      label: 'Interest Assessment Metrics',
      data: hasInterestResults ? [100, 100, 100] : [0, 0, 0],
      backgroundColor: [
        'rgba(99, 102, 241, 0.5)',
        'rgba(167, 139, 250, 0.5)',
        'rgba(251, 146, 60, 0.5)',
      ],
      borderColor: [
        'rgb(99, 102, 241)',
        'rgb(167, 139, 250)',
        'rgb(251, 146, 60)',
      ],
    }],
  };

  // Chart data for non-conventional careers
  const nonConventionalData = {
    labels: ['Assessment Completion', 'Questions Answered', 'Time Spent'],
    datasets: [{
      label: 'Non-Conventional Assessment Metrics',
      data: hasNonConventionalResults ? [100, 100, 100] : [0, 0, 0],
      backgroundColor: [
        'rgba(20, 184, 166, 0.5)',
        'rgba(6, 182, 212, 0.5)',
        'rgba(14, 165, 233, 0.5)',
      ],
      borderColor: [
        'rgb(20, 184, 166)',
        'rgb(6, 182, 212)',
        'rgb(14, 165, 233)',
      ],
    }],
  };

  // Chart data for aptitude assessment
  const aptitudeData = {
    labels: ['Logical', 'Numerical', 'Verbal', 'Spatial', 'Memory'],
    datasets: [{
      label: 'Aptitude Assessment Areas',
      data: hasAptitudeResults ? [75, 80, 65, 70, 85] : [0, 0, 0, 0, 0],
      backgroundColor: 'rgba(99, 102, 241, 0.5)',
      borderColor: 'rgb(99, 102, 241)',
      borderWidth: 1,
    }],
  };

  // Chart options
  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: 'Assessment Metrics',
      },
    },
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Aptitude Areas',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Handle navigation to assessments
  const handleStartAssessment = (assessmentType: string) => {
    navigate(`/dashboard/assessments/${assessmentType}`);
  };

  // Function to generate AI career recommendations based on assessment results
  const generateCareerRecommendations = async () => {
    console.log("generateCareerRecommendations called");
    setIsLoadingRecommendations(true);
    setCareerRecommendations([]); // Clear previous recommendations
    
    try {
      // Check API connection status
      if (apiConnectionStatus === 'failed' && FEATURES.ENABLE_GEMINI_API) {
        console.warn("API connection previously failed, attempting to reconnect...");
        const isConnected = await testGeminiApiConnection();
        setApiConnectionStatus(isConnected ? 'success' : 'failed');
        
        if (!isConnected) {
          console.error("API connection still failed, using mock data");
          throw new Error("API connection failed");
        }
      }
      
      // Prepare assessment data to send to Gemini API
      const assessmentData: AssessmentData = {
        interestResults: hasInterestResults ? interestScores : null,
        aptitudeResults: hasAptitudeResults ? aptitudeScores : null,
        nonConventionalResults: hasNonConventionalResults ? nonConventionalScores : null,
        completedAssessments: totalAssessmentsCompleted
      };
      
      console.log("Calling getCareerRecommendations with data:", assessmentData);
      
      // Call the Gemini API utility function
      const recommendations = await getCareerRecommendations(assessmentData);
      console.log("Received recommendations from API:", recommendations);
      
      if (recommendations && recommendations.length > 0) {
        setCareerRecommendations(recommendations);
        console.log("Updated state with recommendations");
      } else {
        console.error("Received empty recommendations array");
        throw new Error("Empty recommendations");
      }
      
    } catch (error) {
      console.error("Error generating career recommendations:", error);
      // Show error state - don't set any fallback recommendations here
      // as the API utility already handles fallbacks
    } finally {
      setIsLoadingRecommendations(false);
      console.log("Set loading state to false");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Welcome to AI Guruji!</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Track your progress and continue your career exploration journey
        </p>
      </div>

      {/* API Status Indicator (for debugging) */}
      {FEATURES.ENABLE_DEBUG_LOGGING && (
        <div className="mt-4 p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm">
          <p>
            API Status: 
            {apiConnectionStatus === 'untested' && <span className="ml-2 text-gray-500">Not tested yet</span>}
            {apiConnectionStatus === 'success' && <span className="ml-2 text-green-500">Connected</span>}
            {apiConnectionStatus === 'failed' && <span className="ml-2 text-red-500">Connection failed</span>}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {FEATURES.ENABLE_GEMINI_API 
              ? `Using Gemini model: ${GEMINI_MODEL} for recommendations` 
              : "Using mock data for recommendations (API disabled)"}
          </p>
        </div>
      )}

      {/* AI Career Recommendations Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Sparkles className="h-5 w-5 text-yellow-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Gemini AI Career Recommendations
            </h2>
            <div className="relative ml-2 group">
              <AlertCircle className="h-4 w-4 text-gray-400 cursor-help" />
              <div className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-10">
                These recommendations are generated by Google's Gemini AI (model: {GEMINI_MODEL}) based on your assessment results. The AI analyzes patterns in your interests, aptitudes, and preferences to suggest careers that might be a good match for you.
              </div>
            </div>
          </div>
          {totalAssessmentsCompleted > 0 && (
            <button
              onClick={generateCareerRecommendations}
              className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center"
              disabled={isLoadingRecommendations}
            >
              <span>{isLoadingRecommendations ? 'Analyzing with Gemini...' : 'Refresh Analysis'}</span>
            </button>
          )}
        </div>

        {totalAssessmentsCompleted === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
            <Briefcase className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Career Recommendations Yet</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Complete at least one assessment to receive personalized AI career recommendations.
            </p>
            <button
              onClick={() => handleStartAssessment('interest')}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Start an Assessment
            </button>
          </div>
        ) : isLoadingRecommendations ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <div className="animate-pulse flex flex-col items-center">
              <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-16 w-16 mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
            <p className="mt-4 text-gray-500 dark:text-gray-400">
              {FEATURES.ENABLE_GEMINI_API 
                ? `Gemini AI (${GEMINI_MODEL}) is analyzing your assessment results...` 
                : "Simulating AI analysis of your assessment results..."}
            </p>
            {FEATURES.ENABLE_GEMINI_API && (
              <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                Connecting to Google's Gemini API for personalized career recommendations
              </p>
            )}
          </div>
        ) : (
          <div>
            {careerRecommendations.length > 0 ? (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {careerRecommendations.map((recommendation, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                      <div className={`h-2 ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-indigo-500' : 'bg-teal-500'}`}></div>
                      <div className="p-5">
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{recommendation.career}</h3>
                          <div className="flex items-center bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded text-xs font-medium">
                            <Star className="h-3 w-3 text-yellow-500 mr-1" />
                            <span className="text-indigo-700 dark:text-indigo-300">{recommendation.match}% Match</span>
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          {recommendation.description}
                        </p>
                        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Match Strength</span>
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{recommendation.match}%</span>
                          </div>
                          <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                            <div 
                              className={`h-1.5 rounded-full ${
                                index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-indigo-500' : 'bg-teal-500'
                              }`} 
                              style={{ width: `${recommendation.match}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
                  <div className="flex">
                    <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-indigo-800 dark:text-indigo-300">
                        AI-Generated Career Recommendations
                      </p>
                      <p className="mt-1 text-sm text-indigo-700 dark:text-indigo-400">
                        These recommendations are generated by analyzing your assessment results using Google's Gemini AI. 
                        The AI considers your interests, aptitudes, and preferences to suggest careers that might be a good match for you.
                      </p>
                      {totalAssessmentsCompleted < 3 && (
                        <p className="mt-2 text-sm text-indigo-700 dark:text-indigo-400">
                          Complete all three assessments for more accurate recommendations.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
                <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Recommendations Available</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  We couldn't generate career recommendations at this time. Please try again later.
                </p>
                <button
                  onClick={generateCareerRecommendations}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}
        
        {totalAssessmentsCompleted > 0 && totalAssessmentsCompleted < 3 && !isLoadingRecommendations && careerRecommendations.length > 0 && (
          <div className="mt-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 text-sm">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2 flex-shrink-0" />
              <div>
                <p className="font-medium text-indigo-800 dark:text-indigo-300">
                  Complete all assessments for more accurate recommendations
                </p>
                <p className="mt-1 text-indigo-700 dark:text-indigo-400">
                  You've completed {totalAssessmentsCompleted} out of 3 assessments. For the most accurate career recommendations, 
                  complete all three assessment types: Interest, Aptitude, and Non-Conventional Careers.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="relative bg-white dark:bg-gray-800 pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
            >
              <dt>
                <div className={`absolute ${stat.color} rounded-md p-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <p className="ml-16 text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  {stat.name}
                </p>
              </dt>
              <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="ml-2 flex items-baseline text-sm text-gray-600 dark:text-gray-400">
                  {stat.change}
                </p>
              </dd>
            </div>
          );
        })}
      </div>

      {/* Assessment Progress */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Assessment Cards */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Assessments</h2>
          
          <div className="space-y-4">
            {/* Interest Assessment Card */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="bg-blue-500 p-2 rounded-md">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-md font-medium text-gray-900 dark:text-white">Interest Assessment</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {hasInterestResults ? 'Completed' : 'Not started'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleStartAssessment('interest')}
                  className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
                >
                  {hasInterestResults ? 'Retake' : 'Start'}
                </button>
              </div>
              {hasInterestResults && (
                <div className="mt-3">
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Average Score</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{interestAvgScore} points</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Questions</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">25 answered</p>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                    <div className="flex items-center mt-1">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                      <span className="ml-2 text-xs font-medium text-gray-700 dark:text-gray-300">Complete</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Aptitude Assessment Card */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="bg-purple-500 p-2 rounded-md">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-md font-medium text-gray-900 dark:text-white">Aptitude Assessment</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {hasAptitudeResults ? 'Completed' : 'Not started'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleStartAssessment('aptitude')}
                  className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
                >
                  {hasAptitudeResults ? 'Retake' : 'Start'}
                </button>
              </div>
              {hasAptitudeResults && (
                <div className="mt-3">
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Average Score</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{aptitudeAvgScore} points</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Questions</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">20 answered</p>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                    <div className="flex items-center mt-1">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                      <span className="ml-2 text-xs font-medium text-gray-700 dark:text-gray-300">Complete</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Non-Conventional Careers Assessment Card */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="bg-teal-500 p-2 rounded-md">
                    <Briefcase className="h-5 w-5 text-white" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-md font-medium text-gray-900 dark:text-white">Non-Conventional Careers</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {hasNonConventionalResults ? 'Completed' : 'Not started'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleStartAssessment('nonconventional')}
                  className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
                >
                  {hasNonConventionalResults ? 'Retake' : 'Start'}
                </button>
              </div>
              {hasNonConventionalResults && (
                <div className="mt-3">
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Average Score</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{nonConventionalAvgScore} points</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Questions</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">15 answered</p>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                    <div className="flex items-center mt-1">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-teal-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                      <span className="ml-2 text-xs font-medium text-gray-700 dark:text-gray-300">Complete</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* View All Reports Button */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/dashboard/reports')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              View Detailed Reports
            </button>
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
          
          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0 bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-full">
                    <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.action}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{activity.date}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Complete an assessment to see activity here</p>
            </div>
          )}
        </div>
      </div>

      {/* Charts Section */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Interest Chart */}
        {hasInterestResults && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Interest Assessment</h3>
            <div className="h-64">
              <Pie data={interestData} options={pieOptions} />
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Assessment completed successfully
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Results will be analyzed by AI
              </p>
            </div>
          </div>
        )}

        {/* Aptitude Chart */}
        {hasAptitudeResults && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Aptitude Assessment</h3>
            <div className="h-64">
              <Bar data={aptitudeData} options={barOptions} />
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Assessment completed successfully
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Results will be analyzed by AI
              </p>
            </div>
          </div>
        )}

        {/* Non-Conventional Careers Chart */}
        {hasNonConventionalResults && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Non-Conventional Careers</h3>
            <div className="h-64">
              <Pie data={nonConventionalData} options={pieOptions} />
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Assessment completed successfully
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Results will be analyzed by AI
              </p>
            </div>
          </div>
        )}
        
        {/* Placeholder for when no charts are available */}
        {!hasInterestResults && !hasAptitudeResults && !hasNonConventionalResults && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow lg:col-span-3">
            <div className="text-center py-12">
              <Target className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Assessment Data Yet</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                Complete at least one assessment to see your personalized charts and insights.
              </p>
              <button
                onClick={() => navigate('/dashboard/assessments')}
                className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Start an Assessment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}