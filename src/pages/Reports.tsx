import React, { useState, useEffect } from 'react';
import { BarChart3, PieChart, LineChart, Download } from 'lucide-react';
import { useAssessmentStore } from '../store/assessmentStore';
import { Bar, Pie, Line } from 'react-chartjs-2';
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

export default function Reports() {
  const { completedTests, hasCompletedAllTests, getTopSkills } = useAssessmentStore();
  const topSkills = getTopSkills();
  const [interestScores, setInterestScores] = useState<Record<string, number>>({});
  const [aptitudeScores, setAptitudeScores] = useState<Record<string, number>>({});
  const [nonConventionalScores, setNonConventionalScores] = useState<Record<string, number>>({});
  const [hasInterestResults, setHasInterestResults] = useState(false);
  const [hasAptitudeResults, setHasAptitudeResults] = useState(false);
  const [hasNonConventionalResults, setHasNonConventionalResults] = useState(false);

  useEffect(() => {
    // Load interest test scores from localStorage
    const storedInterestScores = localStorage.getItem('interestTestScores');
    if (storedInterestScores) {
      try {
        const parsedScores = JSON.parse(storedInterestScores);
        setInterestScores(parsedScores);
        setHasInterestResults(true);
      } catch (error) {
        console.error('Error parsing interest test scores:', error);
      }
    }

    // Load aptitude test scores from localStorage
    const storedAptitudeScores = localStorage.getItem('aptitudeTestScores');
    if (storedAptitudeScores) {
      try {
        const parsedScores = JSON.parse(storedAptitudeScores);
        setAptitudeScores(parsedScores);
        setHasAptitudeResults(true);
      } catch (error) {
        console.error('Error parsing aptitude test scores:', error);
      }
    }

    // Load non-conventional careers test scores from localStorage
    // Try both possible keys to ensure backward compatibility
    const storedNonConventionalScores = 
      localStorage.getItem('nonConventionalTestScores') || 
      localStorage.getItem('nonconventionalTestScores');
    
    if (storedNonConventionalScores) {
      try {
        const parsedScores = JSON.parse(storedNonConventionalScores);
        setNonConventionalScores(parsedScores);
        setHasNonConventionalResults(true);
        console.log('Loaded non-conventional scores:', parsedScores);
      } catch (error) {
        console.error('Error parsing non-conventional test scores:', error);
      }
    }
  }, []);

  useEffect(() => {
    console.log('Current state:', {
      hasInterestResults,
      hasAptitudeResults,
      hasNonConventionalResults,
      nonConventionalScores
    });
  }, [hasInterestResults, hasAptitudeResults, hasNonConventionalResults, nonConventionalScores]);

  // Force display of non-conventional results section for debugging
  const forceShowNonConventional = true;

  if (!hasCompletedAllTests() && !hasInterestResults && !hasAptitudeResults && !hasNonConventionalResults) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <BarChart3 className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Please complete at least one assessment to view your report.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Prepare interest data from localStorage if available
  const interestData = {
    labels: hasInterestResults 
      ? Object.keys(interestScores).filter(key => key !== 'Total Score')
      : ['Technology', 'Business', 'Arts', 'Science', 'Social'],
    datasets: [{
      data: hasInterestResults 
        ? Object.entries(interestScores)
            .filter(([key]) => key !== 'Total Score')
            .map(([, value]) => value)
        : [85, 65, 45, 75, 60],
      backgroundColor: [
        'rgba(99, 102, 241, 0.5)',
        'rgba(167, 139, 250, 0.5)',
        'rgba(251, 146, 60, 0.5)',
        'rgba(52, 211, 153, 0.5)',
        'rgba(239, 68, 68, 0.5)',
        'rgba(16, 185, 129, 0.5)',
        'rgba(245, 158, 11, 0.5)',
        'rgba(6, 182, 212, 0.5)',
        'rgba(236, 72, 153, 0.5)',
        'rgba(124, 58, 237, 0.5)',
        'rgba(59, 130, 246, 0.5)',
        'rgba(234, 88, 12, 0.5)',
      ],
      borderColor: [
        'rgb(99, 102, 241)',
        'rgb(167, 139, 250)',
        'rgb(251, 146, 60)',
        'rgb(52, 211, 153)',
        'rgb(239, 68, 68)',
        'rgb(16, 185, 129)',
        'rgb(245, 158, 11)',
        'rgb(6, 182, 212)',
        'rgb(236, 72, 153)',
        'rgb(124, 58, 237)',
        'rgb(59, 130, 246)',
        'rgb(234, 88, 12)',
      ],
    }],
  };

  // Prepare aptitude data from localStorage if available
  const aptitudeData = {
    labels: hasAptitudeResults 
      ? Object.keys(aptitudeScores).filter(key => key !== 'Total Score')
      : ['Verbal', 'Numerical', 'Logical', 'Spatial'],
    datasets: [{
      label: 'Aptitude Scores',
      data: hasAptitudeResults 
        ? Object.entries(aptitudeScores)
            .filter(([key]) => key !== 'Total Score')
            .map(([, value]) => value)
        : [70, 80, 65, 75],
      backgroundColor: 'rgba(99, 102, 241, 0.5)',
      borderColor: 'rgb(99, 102, 241)',
      borderWidth: 1,
    }],
  };

  // Prepare non-conventional careers data from localStorage if available
  const nonConventionalData = {
    labels: hasNonConventionalResults 
      ? Object.keys(nonConventionalScores)
          .filter(key => key !== 'Total Score')
          .slice(0, 10) // Show top 10 categories for readability
      : ['Content Creator', 'Photography', 'Fitness Trainer', 'Event Management', 'Actor'],
    datasets: [{
      label: 'Non-Conventional Career Scores',
      data: hasNonConventionalResults 
        ? Object.entries(nonConventionalScores)
            .filter(([key]) => key !== 'Total Score')
            .sort((a, b) => b[1] - a[1]) // Sort by score in descending order
            .slice(0, 10) // Show top 10 categories
            .map(([, value]) => value)
        : [4, 3, 5, 2, 3],
      backgroundColor: 'rgba(20, 184, 166, 0.5)', // Teal color to match the assessment icon
      borderColor: 'rgb(20, 184, 166)',
      borderWidth: 1,
    }],
  };

  const skillsData = {
    labels: topSkills.map(skill => skill.skill),
    datasets: [{
      label: 'Proficiency',
      data: topSkills.map(skill => skill.score),
      backgroundColor: 'rgba(99, 102, 241, 0.5)',
      borderColor: 'rgb(99, 102, 241)',
      borderWidth: 1,
    }],
  };

  const progressData = {
    labels: completedTests.map(test => test.completedAt.split('T')[0]),
    datasets: [{
      label: 'Assessment Scores',
      data: completedTests.map(test => 
        Object.values(test.score).reduce((a, b) => a + b, 0) / Object.values(test.score).length
      ),
      borderColor: 'rgb(99, 102, 241)',
      tension: 0.1,
    }],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Assessment Reports</h1>
        <p className="mt-2 text-gray-600">
          Comprehensive analysis of your assessment results
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {hasInterestResults && (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Interest Areas</h3>
              <PieChart className="h-5 w-5 text-gray-400" />
            </div>
            <div className="h-64">
              <Pie data={interestData} />
            </div>
          </div>
        )}

        {hasAptitudeResults && (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Aptitude Scores</h3>
              <BarChart3 className="h-5 w-5 text-gray-400" />
            </div>
            <div className="h-64">
              <Bar data={aptitudeData} />
            </div>
          </div>
        )}

        {(hasNonConventionalResults || forceShowNonConventional) && (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Non-Conventional Careers</h3>
              <BarChart3 className="h-5 w-5 text-gray-400" />
            </div>
            <div className="h-64">
              <Bar data={nonConventionalData} />
            </div>
          </div>
        )}

        {hasCompletedAllTests() && (
          <>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Top Skills</h3>
                <BarChart3 className="h-5 w-5 text-gray-400" />
              </div>
              <div className="h-64">
                <Bar data={skillsData} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Progress Timeline</h3>
                <LineChart className="h-5 w-5 text-gray-400" />
              </div>
              <div className="h-64">
                <Line data={progressData} />
              </div>
            </div>
          </>
        )}
      </div>

      {hasInterestResults && (
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Interest Assessment Results
            </h2>
            <div className="space-y-4">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Category</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {Object.entries(interestScores).map(([category, score]) => (
                      <tr key={category}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{category}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {hasAptitudeResults && (
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Aptitude Assessment Results
            </h2>
            <div className="space-y-4">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Category</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {Object.entries(aptitudeScores).map(([category, score]) => (
                      <tr key={category}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{category}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {(hasNonConventionalResults || forceShowNonConventional) && (
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Non-Conventional Careers Assessment Results
            </h2>
            <div className="space-y-4">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Career Path</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {Object.entries(nonConventionalScores)
                      .filter(([category]) => category !== 'Total Score')
                      .sort((a, b) => b[1] - a[1]) // Sort by score in descending order
                      .map(([category, score]) => (
                        <tr key={category}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{category}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{score}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {hasCompletedAllTests() && (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Detailed Reports
            </h2>
            <div className="space-y-4">
              {completedTests.map((test, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {test.assessmentId.charAt(0).toUpperCase() + test.assessmentId.slice(1)} Assessment
                    </h4>
                    <p className="text-sm text-gray-500">
                      Completed on {new Date(test.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {(hasInterestResults || hasAptitudeResults || hasNonConventionalResults) && (
        <div className="mt-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold mb-2 text-indigo-800 dark:text-indigo-300">Need Personalized Career Guidance?</h2>
          <p className="text-indigo-700 dark:text-indigo-400 mb-4 max-w-2xl mx-auto">
            Chat with our AI career guidance counselor to get personalized advice based on your assessment results.
            Ask questions about career paths, educational requirements, or skill development.
          </p>
          <a 
            href="/dashboard/chatbot" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            Open AI Career Assistant
          </a>
        </div>
      )}
    </div>
  );
}