// Performance monitoring utilities
+export const performance = {
+  // Mark the start of an operation
+  mark: (name: string) => {
+    if ('performance' in window && 'mark' in window.performance) {
+      window.performance.mark(`${name}-start`);
+    }
+  },
+
+  // Measure the duration of an operation
+  measure: (name: string) => {
+    if ('performance' in window && 'measure' in window.performance) {
+      try {
+        window.performance.mark(`${name}-end`);
+        const measure = window.performance.measure(
+          name,
+          `${name}-start`,
+          `${name}-end`
+        );
+        
+        if (process.env.NODE_ENV === 'development') {
+          console.log(`Performance: ${name} took ${measure.duration.toFixed(2)}ms`);
+        }
+        
+        return measure.duration;
+      } catch (error) {
+        console.warn('Performance measurement failed:', error);
+      }
+    }
+    return 0;
+  },
+
+  // Monitor Core Web Vitals
+  observeWebVitals: () => {
+    if ('PerformanceObserver' in window) {
+      // Largest Contentful Paint
+      const lcpObserver = new PerformanceObserver((list) => {
+        const entries = list.getEntries();
+        const lastEntry = entries[entries.length - 1];
+        console.log('LCP:', lastEntry.startTime);
+      });
+      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
+
+      // First Input Delay
+      const fidObserver = new PerformanceObserver((list) => {
+        const entries = list.getEntries();
+        entries.forEach((entry) => {
+          console.log('FID:', entry.processingStart - entry.startTime);
+        });
+      });
+      fidObserver.observe({ entryTypes: ['first-input'] });
+
+      // Cumulative Layout Shift
+      const clsObserver = new PerformanceObserver((list) => {
+        let clsValue = 0;
+        const entries = list.getEntries();
+        entries.forEach((entry: any) => {
+          if (!entry.hadRecentInput) {
+            clsValue += entry.value;
+          }
+        });
+        console.log('CLS:', clsValue);
+      });
+      clsObserver.observe({ entryTypes: ['layout-shift'] });
+    }
+  }
+};