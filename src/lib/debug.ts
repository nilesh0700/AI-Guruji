// Simple debug utility to help troubleshoot auth issues
export const debugLog = (message: string, data?: unknown) => {
  if (import.meta.env.DEV) {
    console.log(`[DEBUG] ${message}`, data || '');
  }
}; 