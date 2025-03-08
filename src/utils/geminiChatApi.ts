/**
 * Gemini Chat API Integration for AI Guruji
 * 
 * This utility provides functions to interact with Google's Gemini API
 * for career guidance conversations based on assessment results.
 */

import { GEMINI_API_KEY, GEMINI_MODEL, FEATURES } from '../config/env';
import { AssessmentData } from './geminiApi';

// Define the chat API endpoint specifically for the chat model
const GEMINI_CHAT_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  message: ChatMessage;
  isError: boolean;
}

/**
 * Message format for Gemini API
 */
interface GeminiMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

/**
 * Sends a message to the Gemini API and gets a response
 * 
 * @param messages Previous chat messages
 * @param assessmentData User's assessment results
 * @returns Promise resolving to the AI's response
 */
export async function sendChatMessage(
  messages: ChatMessage[],
  assessmentData: AssessmentData
): Promise<ChatResponse> {
  console.log("Sending chat message to Gemini API");
  console.log("Using Gemini model:", GEMINI_MODEL);
  console.log("API endpoint:", GEMINI_CHAT_ENDPOINT);
  
  if (!FEATURES.ENABLE_GEMINI_API || !GEMINI_API_KEY) {
    console.warn("Gemini API is disabled or no API key. Using mock response.");
    return getMockChatResponse(messages);
  }

  try {
    // Create system prompt with assessment data and instructions
    const systemPrompt = createSystemPrompt(assessmentData);
    
    // Prepare the conversation history
    // Note: For Gemini, we need to format the conversation differently
    const formattedMessages = formatMessagesForGemini(messages, systemPrompt);
    
    console.log("Sending formatted conversation to Gemini API:", formattedMessages);
    
    // Prepare the request payload
    const requestPayload = {
      contents: formattedMessages,
      generationConfig: {
        temperature: 0.7,
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
    
    // Make the API call to Gemini
    const response = await fetch(GEMINI_CHAT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY
      },
      body: JSON.stringify(requestPayload)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Could not parse error response" }));
      console.error("Gemini API chat error:", errorData);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Gemini API chat response:", data);
    
    // Extract the text from the response
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0].text) {
      console.error("Unexpected response format:", data);
      throw new Error("Unexpected response format from Gemini API");
    }
    
    const responseText = data.candidates[0].content.parts[0].text;
    
    return {
      message: {
        role: 'assistant',
        content: responseText
      },
      isError: false
    };
  } catch (error) {
    console.error("Error in chat with Gemini API:", error);
    return {
      message: {
        role: 'assistant',
        content: "I'm sorry, I encountered an error while processing your request. Please try again later."
      },
      isError: true
    };
  }
}

/**
 * Formats messages for the Gemini API
 * Gemini has specific requirements for how messages should be formatted
 */
function formatMessagesForGemini(messages: ChatMessage[], systemPrompt: string): GeminiMessage[] {
  const formattedMessages: GeminiMessage[] = [];
  
  // Add system message as the first user message with a special prefix
  formattedMessages.push({
    role: "user",
    parts: [{ text: systemPrompt }]
  });
  
  // Add a model response acknowledging the instructions
  formattedMessages.push({
    role: "model",
    parts: [{ text: "I understand my role as a career guidance counselor. I will only answer questions related to education and careers, using the student's assessment results to provide personalized advice." }]
  });
  
  // Add the rest of the conversation
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    
    // Map our roles to Gemini roles
    const role = message.role === 'assistant' ? 'model' : 'user';
    
    formattedMessages.push({
      role: role as "user" | "model",
      parts: [{ text: message.content }]
    });
  }
  
  return formattedMessages;
}

/**
 * Creates a system prompt with assessment data and instructions
 */
function createSystemPrompt(assessmentData: AssessmentData): string {
  const { interestResults, aptitudeResults, nonConventionalResults } = assessmentData;
  
  // Format assessment results for the prompt
  const interestSection = interestResults 
    ? `Interest Assessment Results: ${JSON.stringify(interestResults, null, 2)}`
    : 'Interest Assessment: Not completed';
    
  const aptitudeSection = aptitudeResults
    ? `Aptitude Assessment Results: ${JSON.stringify(aptitudeResults, null, 2)}`
    : 'Aptitude Assessment: Not completed';
    
  const nonConventionalSection = nonConventionalResults
    ? `Non-Conventional Careers Assessment Results: ${JSON.stringify(nonConventionalResults, null, 2)}`
    : 'Non-Conventional Careers Assessment: Not completed';
  
  return `
You are an AI career guidance counselor for AI Guruji, an educational platform. Your purpose is to help students with career-related questions based on their assessment results.

## Student's Assessment Results
${interestSection}

${aptitudeSection}

${nonConventionalSection}

## Your Role and Restrictions
1. ONLY answer questions related to education, careers, skills development, and professional growth.
2. If a question is not related to careers or education, politely redirect the conversation by saying: "I'm your career guidance counselor. Please ask me questions related to your education or career path."
3. Use the student's assessment results to provide personalized advice.
4. Be encouraging, supportive, and professional in your responses.
5. Provide specific, actionable advice when possible.
6. When discussing careers, focus on those that align with the student's assessment results.
7. If asked about sensitive topics, politics, entertainment, or anything unrelated to education/careers, politely redirect.

Remember, your purpose is to guide students in their career journey based on their assessment results. Stay focused on this mission.
`;
}

/**
 * Provides a mock chat response for testing
 */
function getMockChatResponse(messages: ChatMessage[]): ChatResponse {
  const lastMessage = messages[messages.length - 1].content.toLowerCase();
  
  // Check if the message is career-related
  const isCareerRelated = 
    lastMessage.includes('career') || 
    lastMessage.includes('job') || 
    lastMessage.includes('profession') ||
    lastMessage.includes('study') ||
    lastMessage.includes('college') ||
    lastMessage.includes('course') ||
    lastMessage.includes('education') ||
    lastMessage.includes('skill');
  
  if (!isCareerRelated) {
    return {
      message: {
        role: 'assistant',
        content: "I'm your career guidance counselor. Please ask me questions related to your education or career path."
      },
      isError: false
    };
  }
  
  // Mock responses for career-related questions
  const careerResponses = [
    "Based on your assessment results, you show strong aptitude in analytical thinking. Have you considered careers in data analysis or research?",
    "Your interest assessment indicates a preference for creative work. Fields like design, content creation, or marketing might be good fits for you.",
    "Looking at your assessment results, I notice you score highly in both technical and communication skills. Roles that combine these, like technical project management, could be worth exploring.",
    "Your non-conventional career assessment suggests you might thrive in emerging fields. Have you looked into sustainability consulting or digital experience design?",
    "Based on your aptitude scores, you have strong logical reasoning skills. This would be valuable in fields like software development, engineering, or financial analysis."
  ];
  
  const randomResponse = careerResponses[Math.floor(Math.random() * careerResponses.length)];
  
  return {
    message: {
      role: 'assistant',
      content: randomResponse
    },
    isError: false
  };
} 