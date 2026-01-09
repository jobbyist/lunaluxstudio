import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Eye, Globe } from 'lucide-react';
import { useActiveVisitors } from '@/hooks/useActiveVisitors';

export const RealTimeVisitorCard = () => {
  const { visitors, count, loading } = useActiveVisitors();

  // Group visitors by page
  const pageGroups = visitors.reduce(
    (acc, v) => {
      const page = v.page_path || '/';
      acc[page] = (acc[page] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const topPages = Object.entries(pageGroups)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
          <Globe className="h-4 w-4 text-green-500" />
          Live Visitors
        </CardTitle>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-muted-foreground">Real-time</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-serif">{loading ? '...' : count}</span>
          <span className="text-muted-foreground text-sm">
            {count === 1 ? 'visitor' : 'visitors'} now
          </span>
        </div>

        {topPages.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Eye className="h-3 w-3" />
              Currently viewing:
            </p>
            <div className="flex flex-wrap gap-1">
              {topPages.map(([page, pageCount]) => (
                <Badge key={page} variant="secondary" className="text-xs">
                  {page} ({pageCount})
                </Badge>
              ))}
            </div>
          </div>
        )}

        {count === 0 && !loading && (
          <p className="text-xs text-muted-foreground mt-2">No active visitors right now</p>
        )}
      </CardContent>
    </Card>
  );
};
