/**
 * Frontend Logger Utility
 * Simple logging utility for frontend debugging and error tracking
 */

const isDevelopment = process.env.NODE_ENV === 'development';

const logger = {
  debug: (message: string, data?: any) => {
    if (isDevelopment) {
      console.log(`[DEBUG] ${message}`, data);
    }
  },

  info: (message: string, data?: any) => {
    console.log(`[INFO] ${message}`, data);
  },

  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data);
  },

  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error);

    // In production, you could send errors to a service like Sentry
    if (!isDevelopment && error) {
      // sendToSentry(message, error);
    }
  },

  group: (groupName: string) => {
    if (isDevelopment) {
      console.group(groupName);
    }
  },

  groupEnd: () => {
    if (isDevelopment) {
      console.groupEnd();
    }
  },
};

export default logger;
