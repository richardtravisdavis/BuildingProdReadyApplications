"use client";

import { useReportWebVitals } from "next/web-vitals";

export default function WebVitals() {
  useReportWebVitals((metric) => {
    // Log to console in development, send to analytics endpoint in production
    if (process.env.NODE_ENV === "development") {
      console.log(`[Web Vital] ${metric.name}: ${metric.value.toFixed(1)}ms (${metric.rating})`);
    }

    // Send to analytics endpoint if configured
    const endpoint = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT;
    if (endpoint) {
      const body = JSON.stringify({
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        id: metric.id,
        navigationType: metric.navigationType,
      });
      if (navigator.sendBeacon) {
        navigator.sendBeacon(endpoint, body);
      }
    }
  });

  return null;
}
