/**
 * Environment Configuration
 * 
 * This file contains environment variables and configuration settings for the application.
 * In a production environment, these values should be loaded from environment variables.
 */

// API Keys
export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY; // Replace with your actual Gemini API key

// Gemini API Configuration
export const GEMINI_MODEL = "gemini-2.0-flash"; // The specific Gemini model to use
export const GEMINI_API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Application Settings
export const APP_NAME = "AI Guruji";
export const APP_VERSION = "1.0.0";

// Feature Flags
export const FEATURES = {
  ENABLE_GEMINI_API: true, // Set to false to use mock data instead of real API calls
  ENABLE_DEBUG_LOGGING: true, // Set to false in production
}; 