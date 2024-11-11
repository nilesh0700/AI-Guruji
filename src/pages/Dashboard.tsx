import React from 'react';
import { Target, FileText, Award, TrendingUp } from 'lucide-react';
import { useAssessmentStore } from '../store/assessmentStore';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const { completedTests, getCompletionPercentage, getTopSkills } = useAssessmentStore();
  const completionPercentage = getCompletionPercentage();
  const topSkills = getTopSkills();

  const stats = [
    {
      name: 'Tests Completed',
      value: completedTests.length.toString(),
      icon: Target,
      change: `${4 - completedTests.length} remaining`,
      changeType: 'neutral',
    },
    {
      name: 'Reports Generated',
      value: completedTests.length === 4 ? '1' : '0',
      icon: FileText,
      change: completedTests.length === 4 ? 'Full report available' : 'Complete all tests',
      changeType: 'neutral',
    },
    {
      name: 'Top Skills',
      value: topSkills[0]?.skill || 'N/A',
      icon: Award,
      change: topSkills[0]?.score ? `${topSkills[0].score}% proficiency` : 'Take tests to discover',
      changeType: 'positive',
    },
    {
      name: 'Progress',
      value: `${Math.round(completionPercentage)}%`,
      icon: TrendingUp,
      change: 'Profile completion',
      changeType: 'neutral',
    },
  ];

  const chartData = {
    labels: topSkills.map(skill => skill.skill),
    datasets: [
      {
        label: 'Skill Proficiency',
        data: topSkills.map(skill => skill.score),
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Your Top Skills',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900">Welcome back!</h1>
      <p className="mt-2 text-sm text-gray-600">
        Track your progress and continue your career exploration journey
      </p>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
            >
              <dt>
                <div className="absolute bg-indigo-500 rounded-md p-3">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <p className="ml-16 text-sm font-medium text-gray-500 truncate">
                  {stat.name}
                </p>
              </dt>
              <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                <p className="ml-2 flex items-baseline text-sm text-gray-600">
                  {stat.change}
                </p>
              </dd>
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <Bar options={chartOptions} data={chartData} height={80} />
      </div>
    </div>
  );
}