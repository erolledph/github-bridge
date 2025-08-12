// Simple analytics utility for tracking user interactions
+export const analytics = {
+  track: (event: string, properties?: Record<string, any>) => {
+    // In production, you would integrate with your analytics service
+    // For now, we'll just log to console in development
+    if (process.env.NODE_ENV === 'development') {
+      console.log('Analytics Event:', event, properties);
+    }
+    
+    // Example integration points:
+    // - Google Analytics 4
+    // - Mixpanel
+    // - Amplitude
+    // - PostHog
+  },
+
+  page: (pageName: string, properties?: Record<string, any>) => {
+    analytics.track('page_view', { page: pageName, ...properties });
+  },
+
+  // Specific events for GitHub Bridge
+  tokenValidated: () => {
+    analytics.track('token_validated');
+  },
+
+  repositorySelected: (isNew: boolean) => {
+    analytics.track('repository_selected', { is_new_repository: isNew });
+  },
+
+  fileUploaded: (fileSize: number, fileCount: number) => {
+    analytics.track('file_uploaded', { 
+      file_size_mb: Math.round(fileSize / 1024 / 1024 * 100) / 100,
+      file_count: fileCount 
+    });
+  },
+
+  uploadCompleted: (success: boolean, error?: string) => {
+    analytics.track('upload_completed', { success, error });
+  }
+};