import { create } from 'zustand';
import { TestResult } from '../types';

interface AssessmentStore {
    completedTests: TestResult[];
    addTestResult: (result: TestResult) => void;
    getCompletionPercentage: () => number;
    getTopSkills: () => Array<{ skill: string; score: number }>;
    hasCompletedAllTests: () => boolean;
}

export const useAssessmentStore = create<AssessmentStore>((set, get) => ({
    completedTests: [],
    
    addTestResult: (result) => {
        set((state) => ({
            completedTests: [...state.completedTests, result]
        }));
    },
    
    getCompletionPercentage: () => {
        const { completedTests } = get();
        return (completedTests.length / 4) * 100;
    },
    
    getTopSkills: () => {
        const { completedTests } = get();
        const skillScores: Record<string, number[]> = {};
        
        completedTests.forEach(test => {
            Object.entries(test.score).forEach(([skill, score]) => {
                if (!skillScores[skill]) {
                    skillScores[skill] = [];
                }
                skillScores[skill].push(score);
            });
        });
        
        return Object.entries(skillScores)
            .map(([skill, scores]) => ({
                skill,
                score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
            }))
            .sort((a, b) => b.score - a.score);
    },
    
    hasCompletedAllTests: () => {
        const { completedTests } = get();
        return completedTests.length === 4;
    },
}));