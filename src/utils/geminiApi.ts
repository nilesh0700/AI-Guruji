/**
 * Gemini API Integration for AI Guruji
 * 
 * This utility provides functions to interact with Google's Gemini API
 * for generating career recommendations based on assessment results.
 */

import { GEMINI_API_KEY, GEMINI_API_ENDPOINT, GEMINI_MODEL, FEATURES } from '../config/env';

// Type definitions
export interface AssessmentData {
  interestResults: Record<string, number> | null;
  aptitudeResults: Record<string, number> | null;
  nonConventionalResults: Record<string, number> | null;
  completedAssessments: number;
}

export interface CareerRecommendation {
  career: string;
  match: number;
  description: string;
}

/**
 * Test function to verify the Gemini API connection
 * This can be called to check if the API key is valid and if there are any CORS issues
 */
export async function testGeminiApiConnection(): Promise<boolean> {
  try {
    console.log("Testing Gemini API connection...");
    console.log(`Using model: ${GEMINI_MODEL}`);
    console.log(`API endpoint: ${GEMINI_API_ENDPOINT}`);
    
    const response = await fetch(GEMINI_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "Hello, please respond with the word 'SUCCESS' if you can read this message."
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 10,
        }
      })
    });
    
    console.log("API test response status:", response.status, response.statusText);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Could not parse error response" }));
      console.error("Gemini API test error:", errorData);
      return false;
    }
    
    const data = await response.json();
    console.log("Gemini API test response:", data);
    
    return true;
  } catch (error) {
    console.error("Error testing Gemini API connection:", error);
    return false;
  }
}

/**
 * Generates career recommendations using Gemini API based on assessment results
 * 
 * @param assessmentData Object containing the user's assessment results
 * @returns Promise resolving to an array of career recommendations
 */
export async function getCareerRecommendations(
  assessmentData: AssessmentData
): Promise<CareerRecommendation[]> {
  console.log("getCareerRecommendations called with data:", assessmentData);
  console.log("FEATURES.ENABLE_GEMINI_API:", FEATURES.ENABLE_GEMINI_API);
  console.log("GEMINI_API_KEY available:", !!GEMINI_API_KEY);
  console.log("Using Gemini model:", GEMINI_MODEL);
  
  // If Gemini API is explicitly disabled, use mock data
  // if (!FEATURES.ENABLE_GEMINI_API) {
  //   console.log("Gemini API is disabled. Using mock data.");
  //   return getMockRecommendations(assessmentData);
  // }

  // If no API key is available, use mock data
  // if (!GEMINI_API_KEY) {
  //   console.error("No Gemini API key provided. Using mock data.");
  //   return getMockRecommendations(assessmentData);
  // }

  try {
    // Extract the top categories from each assessment
    const topInterestCategories = assessmentData.interestResults 
      ? getTopCategories(assessmentData.interestResults, 5)
      : [];
      
    const topAptitudeCategories = assessmentData.aptitudeResults
      ? getTopCategories(assessmentData.aptitudeResults, 5)
      : [];
      
    const topNonConventionalCategories = assessmentData.nonConventionalResults
      ? getTopCategories(assessmentData.nonConventionalResults, 5)
      : [];

    // Prepare the prompt for Gemini API with detailed analysis instructions
    const prompt = `
You are a career guidance AI assistant. Based on the assessment results provided, recommend the top 3 most suitable career options for the user.

## Assessment Results

${assessmentData.interestResults ? `
### Interest Assessment (Top Categories)
${topInterestCategories.map(cat => `- ${cat.category}: ${cat.score} points`).join('\n')}

Full Interest Results:
${JSON.stringify(assessmentData.interestResults, null, 2)}
` : 'Interest Assessment: Not completed'}

${assessmentData.aptitudeResults ? `
### Aptitude Assessment (Top Categories)
${topAptitudeCategories.map(cat => `- ${cat.category}: ${cat.score} points`).join('\n')}

Full Aptitude Results:
${JSON.stringify(assessmentData.aptitudeResults, null, 2)}
` : 'Aptitude Assessment: Not completed'}

${assessmentData.nonConventionalResults ? `
### Non-Conventional Careers Assessment (Top Categories)
${topNonConventionalCategories.map(cat => `- ${cat.category}: ${cat.score} points`).join('\n')}

Full Non-Conventional Results:
${JSON.stringify(assessmentData.nonConventionalResults, null, 2)}
` : 'Non-Conventional Careers Assessment: Not completed'}

## Analysis Instructions

1. Analyze the assessment results to identify patterns, strengths, and preferences.
2. Consider both traditional and non-traditional career paths that align with the results.
3. Focus on careers that match the user's highest-scoring categories across all completed assessments.
4. For each recommended career, provide:
   - A specific career title (not a general field)
   - A match percentage between 75-98% that reflects how well it aligns with the assessment results
   - A concise, informative one-sentence description of the career

## Response Format

Respond ONLY with a valid JSON array of exactly 3 career recommendation objects with the following structure:
[
  {
    "career": "Specific Career Title",
    "match": 95,
    "description": "Brief description of what this career involves and why it matches the user's profile."
  },
  ...
]

Do not include any explanatory text before or after the JSON array.
`;

    console.log("Sending request to Gemini API with prompt:", prompt);
    console.log("API Endpoint:", GEMINI_API_ENDPOINT);
    
    // Prepare the request payload
    const requestPayload = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };
    
    console.log("Request payload:", JSON.stringify(requestPayload));
    
    // Make the API call to Gemini
    const response = await fetch(GEMINI_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY
      },
      body: JSON.stringify(requestPayload)
    });

    console.log("API Response status:", response.status, response.statusText);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Could not parse error response" }));
      console.error("Gemini API error:", errorData);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Gemini API response data:", data);
    
    // Extract the text from the response
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0].text) {
      console.error("Unexpected response format:", data);
      throw new Error("Unexpected response format from Gemini API");
    }
    
    const recommendationsText = data.candidates[0].content.parts[0].text;
    console.log("Raw recommendations text:", recommendationsText);
    
    // Parse the JSON response
    try {
      // Clean up the response text - remove any markdown formatting or extra text
      const cleanedText = recommendationsText.trim()
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
        
      console.log("Cleaned recommendations text:", cleanedText);
      
      const recommendations = JSON.parse(cleanedText);
      console.log("Parsed recommendations:", recommendations);
      
      // Validate the response format
      if (!Array.isArray(recommendations) || recommendations.length === 0) {
        console.error("Invalid recommendations format:", recommendations);
        throw new Error("Invalid recommendations format");
      }
      
      // Ensure each recommendation has the required fields
      const validatedRecommendations = recommendations.map(rec => ({
        career: rec.career || "Unknown Career",
        match: typeof rec.match === 'number' ? rec.match : 80,
        description: rec.description || "No description available"
      }));
      
      console.log("Returning AI-generated recommendations:", validatedRecommendations);
      return validatedRecommendations;
    } catch (parseError) {
      console.error("Error parsing Gemini API response:", parseError);
      console.error("Raw response:", recommendationsText);
      throw new Error("Failed to parse career recommendations from Gemini API");
    }
  } catch (error) {
    console.error("Error generating career recommendations:", error);
    
    // If the API call fails, fall back to mock data
    console.warn("Falling back to mock recommendations due to API error");
    return [];
  }
}

/**
 * Helper function to extract top categories from assessment scores
 */
function getTopCategories(scores: Record<string, number>, count: number = 3): {category: string, score: number}[] {
  return Object.entries(scores)
    .filter(([category]) => category !== 'Total Score')
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([category, score]) => ({ category, score }));
}

/**
 * Generates mock career recommendations for development purposes
 * This is used as a fallback if the Gemini API call fails
 * 
 * @param assessmentData Object containing the user's assessment results
 * @returns Array of career recommendations
 */
// function getMockRecommendations(assessmentData: AssessmentData): CareerRecommendation[] {
//   console.log("Using mock recommendations as fallback");
  
//   const { interestResults, aptitudeResults, nonConventionalResults } = assessmentData;
//   const hasInterest = !!interestResults;
//   const hasAptitude = !!aptitudeResults;
//   const hasNonConventional = !!nonConventionalResults;
  
//   // Different recommendation sets based on which assessments are completed
//   if (hasInterest && hasAptitude && hasNonConventional) {
//     // All assessments completed
//     return [
//       {
//         career: "Data Scientist (Mock)",
//         match: 95,
//         description: "Combines analytical skills with programming to extract insights from complex data."
//       },
//       {
//         career: "UX/UI Designer (Mock)",
//         match: 88,
//         description: "Creates intuitive, engaging digital experiences through research and design."
//       },
//       {
//         career: "Environmental Consultant (Mock)",
//         match: 82,
//         description: "Advises organizations on sustainable practices and environmental compliance."
//       }
//     ];
//   } else if (hasInterest && hasAptitude) {
//     // Interest and Aptitude completed
//     return [
//       {
//         career: "Software Engineer (Mock)",
//         match: 90,
//         description: "Designs and builds applications and systems using programming languages."
//       },
//       {
//         career: "Financial Analyst (Mock)",
//         match: 85,
//         description: "Evaluates financial data to guide business decisions and investment strategies."
//       },
//       {
//         career: "Marketing Specialist (Mock)",
//         match: 80,
//         description: "Develops strategies to promote products and services to target audiences."
//       }
//     ];
//   }
  
//   // Default fallback for other combinations
//   return [
//     {
//       career: "Digital Marketer (Mock)",
//       match: 88,
//       description: "Promotes brands and products through digital channels and campaigns."
//     },
//     {
//       career: "Project Manager (Mock)",
//       match: 84,
//       description: "Plans, executes, and closes projects while meeting deadlines and requirements."
//     },
//     {
//       career: "Content Creator (Mock)",
//       match: 79,
//       description: "Produces engaging digital content across various platforms and formats."
//     }
//   ];
// } 