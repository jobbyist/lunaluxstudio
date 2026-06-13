import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

// Generate a unique session ID for this browser session
const getSessionId = (): string => {
  const key = 'luna_visitor_session';
  let sessionId = sessionStorage.getItem(key);
  
  if (!sessionId) {
    sessionId = `v_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    sessionStorage.setItem(key, sessionId);
  }
  
  return sessionId;
};

export const useVisitorTracking = () => {
  const location = useLocation();
  const sessionId = useRef(getSessionId());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const updatePresence = async (pagePath: string) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).rpc('upsert_visitor_session', {
        p_session_id: sessionId.current,
        p_page_path: pagePath,
        p_user_agent: navigator.userAgent.substring(0, 200),
      });

      if (error) {
        console.debug('Visitor presence update skipped:', error.message);
      }
    } catch (err) {
      // Silently fail - visitor tracking is non-critical
    }
  };

  useEffect(() => {
    // Update presence on page change
    updatePresence(location.pathname);

    // Set up heartbeat every 30 seconds
    intervalRef.current = setInterval(() => {
      updatePresence(location.pathname);
    }, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [location.pathname]);

  // Cleanup on page unload
  useEffect(() => {
    const handleBeforeUnload = async () => {
      // Try to remove the session on close (best effort)
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).rpc('delete_visitor_session', {
          p_session_id: sessionId.current,
        });
      } catch {
        // Ignore errors on cleanup
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);
};
