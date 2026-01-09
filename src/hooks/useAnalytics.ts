import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

// Google Analytics Measurement ID - Replace with your actual GA4 ID
const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';

export const useAnalytics = () => {
  const location = useLocation();

  // Track page views
  useEffect(() => {
    if (typeof window.gtag === 'function') {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);

  // Track custom events
  const trackEvent = useCallback((
    eventName: string,
    eventParams?: Record<string, string | number | boolean>
  ) => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, eventParams);
    }
  }, []);

  // Track e-commerce events
  const trackPurchase = useCallback((
    transactionId: string,
    value: number,
    currency: string = 'ZAR',
    items?: Array<{ item_id: string; item_name: string; price: number; quantity: number }>
  ) => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'purchase', {
        transaction_id: transactionId,
        value,
        currency,
        items,
      });
    }
  }, []);

  const trackAddToCart = useCallback((
    itemId: string,
    itemName: string,
    price: number,
    quantity: number = 1
  ) => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'add_to_cart', {
        currency: 'ZAR',
        value: price * quantity,
        items: [{
          item_id: itemId,
          item_name: itemName,
          price,
          quantity,
        }],
      });
    }
  }, []);

  const trackViewItem = useCallback((
    itemId: string,
    itemName: string,
    price: number
  ) => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'view_item', {
        currency: 'ZAR',
        value: price,
        items: [{
          item_id: itemId,
          item_name: itemName,
          price,
        }],
      });
    }
  }, []);

  const trackSearch = useCallback((searchTerm: string) => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'search', {
        search_term: searchTerm,
      });
    }
  }, []);

  const trackSignUp = useCallback((method: string = 'email') => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'sign_up', {
        method,
      });
    }
  }, []);

  const trackLogin = useCallback((method: string = 'email') => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'login', {
        method,
      });
    }
  }, []);

  return {
    trackEvent,
    trackPurchase,
    trackAddToCart,
    trackViewItem,
    trackSearch,
    trackSignUp,
    trackLogin,
  };
};

// Initialize Google Analytics
export const initGA = (measurementId: string = GA_MEASUREMENT_ID) => {
  if (typeof window !== 'undefined' && !window.gtag) {
    // Add the gtag script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    // Initialize dataLayer and gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer.push(args);
    };
    window.gtag('js', new Date());
    window.gtag('config', measurementId);
  }
};
