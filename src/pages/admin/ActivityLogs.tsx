import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Shield, LogIn, LogOut, FileText, Settings, AlertCircle, CheckCircle } from 'lucide-react';

interface ActivityLog {
  id: string;
  user_id: string | null;
  action_type: string;
  action_details: unknown;
  success: boolean;
  user_agent: string | null;
  created_at: string;
}

const ActivityLogs = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'login_attempt':
      case 'login_success':
      case 'login_failed':
        return LogIn;
      case 'logout':
        return LogOut;
      case 'content_created':
      case 'content_updated':
      case 'content_deleted':
        return FileText;
      case 'settings_updated':
        return Settings;
      default:
        return Shield;
    }
  };

  const getActionColor = (actionType: string, success: boolean) => {
    if (!success) return 'destructive';
    switch (actionType) {
      case 'login_success':
        return 'default';
      case 'login_failed':
        return 'destructive';
      case 'logout':
        return 'secondary';
      case 'content_created':
      case 'content_updated':
        return 'default';
      case 'content_deleted':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatActionType = (actionType: string) => {
    return actionType.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Activity Logs</h1>
          <p className="text-muted-foreground">Track admin login attempts and actions</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : logs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No activity recorded yet
              </p>
            ) : (
              <div className="space-y-4">
                {logs.map((log) => {
                  const Icon = getActionIcon(log.action_type);
                  return (
                    <div
                      key={log.id}
                      className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className={`p-2 rounded-full ${log.success ? 'bg-primary/10' : 'bg-destructive/10'}`}>
                        <Icon className={`h-5 w-5 ${log.success ? 'text-primary' : 'text-destructive'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={getActionColor(log.action_type, log.success)}>
                            {formatActionType(log.action_type)}
                          </Badge>
                          {log.success ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-destructive" />
                          )}
                        </div>
                        {Object.keys(log.action_details).length > 0 && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {JSON.stringify(log.action_details)}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(new Date(log.created_at), 'PPpp')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default ActivityLogs;
