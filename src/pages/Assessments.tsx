import React from 'react';
import { Link } from 'react-router-dom';
import { Target, Brain, Briefcase } from 'lucide-react';

const assessments = [
  {
    id: 'interest',
    title: 'Interest Assessment',
    description: 'Discover your natural interests and passions through a comprehensive assessment.',
    duration: '20 minutes',
    questions: 40,
    icon: Target,
    color: 'bg-blue-500',
  },
  {
    id: 'aptitude',
    title: 'Aptitude Test',
    description: 'Evaluate your strengths and abilities in different areas.',
    duration: '30 minutes',
    questions: 50,
    icon: Brain,
    color: 'bg-purple-500',
  },
  {
    id: 'nonconventional',
    title: 'Non-Conventional Careers',
    description: 'Explore alternative and emerging career paths that match your interests.',
    duration: '25 minutes',
    questions: 105,
    icon: Briefcase,
    color: 'bg-teal-500',
  },
  // {
  //   id: 'career',
  //   title: 'Career Explorer',
  //   description: 'Explore various career paths suited to your profile.',
  //   duration: '25 minutes',
  //   questions: 45,
  //   icon: Lightbulb,
  //   color: 'bg-green-500',
  // },
  // {
  //   id: 'personality',
  //   title: 'Personality Assessment',
  //   description: 'Understand your personality type and work preferences.',
  //   duration: '15 minutes',
  //   questions: 30,
  //   icon: UserCircle2,
  //   color: 'bg-yellow-500',
  // },
];

export default function Assessments() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Assessments</h1>
        <p className="mt-2 text-gray-600">
          Take our comprehensive assessments to discover your career path
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {assessments.map((assessment) => {
          const Icon = assessment.icon;
          return (
            <div
              key={assessment.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div
                    className={`${assessment.color} p-3 rounded-lg text-white`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {assessment.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {assessment.duration} • {assessment.questions} questions
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-gray-600">{assessment.description}</p>
                <div className="mt-6">
                  <Link
                    to={`/dashboard/assessments/${assessment.id}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Start Assessment
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}