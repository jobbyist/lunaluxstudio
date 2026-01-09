import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface ActiveVisitor {
  id: string;
  session_id: string;
  page_path: string | null;
  last_seen_at: string;
}

export const useActiveVisitors = () => {
  const [visitors, setVisitors] = useState<ActiveVisitor[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchVisitors = async () => {
    try {
      // Get visitors active in the last 5 minutes
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('active_visitors')
        .select('*')
        .gte('last_seen_at', fiveMinutesAgo)
        .order('last_seen_at', { ascending: false });

      if (error) {
        console.error('Error fetching visitors:', error);
        return;
      }

      setVisitors(data || []);
      setCount(data?.length || 0);
    } catch (err) {
      console.error('Error in fetchVisitors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('active_visitors_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'active_visitors',
        },
        (payload: RealtimePostgresChangesPayload<ActiveVisitor>) => {
          if (payload.eventType === 'INSERT') {
            setVisitors((prev) => {
              const exists = prev.some((v) => v.session_id === (payload.new as ActiveVisitor).session_id);
              if (exists) return prev;
              return [(payload.new as ActiveVisitor), ...prev];
            });
            setCount((prev) => prev + 1);
          } else if (payload.eventType === 'DELETE') {
            setVisitors((prev) => prev.filter((v) => v.id !== (payload.old as ActiveVisitor).id));
            setCount((prev) => Math.max(0, prev - 1));
          } else if (payload.eventType === 'UPDATE') {
            setVisitors((prev) =>
              prev.map((v) =>
                v.id === (payload.new as ActiveVisitor).id ? (payload.new as ActiveVisitor) : v
              )
            );
          }
        }
      )
      .subscribe();

    // Refresh every minute to clean up stale entries from UI
    const interval = setInterval(fetchVisitors, 60000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  return { visitors, count, loading, refetch: fetchVisitors };
};
