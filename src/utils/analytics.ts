// Simple analytics utility for tracking user interactions

// Initialize Google Analytics if measurement ID is provided
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

// Google Analytics 4 integration
const gtag = (...args: any[]) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag(...args);
  }
};

export const analytics = {
  track: (event: string, properties?: Record<string, any>) => {
    // Send to Google Analytics
    if (GA_MEASUREMENT_ID) {
      gtag('event', event, {
        custom_parameter_1: properties?.custom_parameter_1,
        custom_parameter_2: properties?.custom_parameter_2,
        value: properties?.value,
        ...properties
      });
    }
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event:', event, properties);
    }
  },

  page: (pageName: string, properties?: Record<string, any>) => {
    // Send page view to Google Analytics
    if (GA_MEASUREMENT_ID) {
      gtag('config', GA_MEASUREMENT_ID, {
        page_title: pageName,
        page_location: window.location.href,
        ...properties
      });
    }
    
    analytics.track('page_view', { page: pageName, ...properties });
  },

  // Specific events for GitHub Bridge
  tokenValidated: () => {
    analytics.track('token_validated');
  },

  repositorySelected: (isNew: boolean) => {
    analytics.track('repository_selected', { is_new_repository: isNew });
  },

  fileUploaded: (fileSize: number, fileCount: number) => {
    analytics.track('file_uploaded', { 
      file_size_mb: Math.round(fileSize / 1024 / 1024 * 100) / 100,
      file_count: fileCount 
    });
  },

  uploadCompleted: (success: boolean, error?: string) => {
    analytics.track('upload_completed', { success, error });
  },

  // Enhanced tracking methods
  setUserId: (userId: string) => {
    if (GA_MEASUREMENT_ID) {
      gtag('config', GA_MEASUREMENT_ID, {
        user_id: userId
      });
    }
  },

  setUserProperties: (properties: Record<string, any>) => {
    if (GA_MEASUREMENT_ID) {
      gtag('set', 'user_properties', properties);
    }
  }
};