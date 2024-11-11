import React from 'react';
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

  if (!hasCompletedAllTests()) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <BarChart3 className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Please complete all assessments to view your comprehensive report.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const interestData = {
    labels: ['Technology', 'Business', 'Arts', 'Science', 'Social'],
    datasets: [{
      data: [85, 65, 45, 75, 60],
      backgroundColor: [
        'rgba(99, 102, 241, 0.5)',
        'rgba(167, 139, 250, 0.5)',
        'rgba(251, 146, 60, 0.5)',
        'rgba(52, 211, 153, 0.5)',
        'rgba(239, 68, 68, 0.5)',
      ],
      borderColor: [
        'rgb(99, 102, 241)',
        'rgb(167, 139, 250)',
        'rgb(251, 146, 60)',
        'rgb(52, 211, 153)',
        'rgb(239, 68, 68)',
      ],
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
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Interest Areas</h3>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64">
            <Pie data={interestData} />
          </div>
        </div>

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
      </div>

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
    </div>
  );
}