export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  duration: number;
  questions: Question[];
  completed?: boolean;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  category: string;
}

export interface TestResult {
  id: string;
  userId: string;
  assessmentId: string;
  answers: Record<string, string>;
  score: Record<string, number>;
  completedAt: string;
}