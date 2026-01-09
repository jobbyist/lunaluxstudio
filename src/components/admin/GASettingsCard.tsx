import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Save, ExternalLink, Info, CheckCircle2 } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export const GASettingsCard = () => {
  const { settings, loading, updateSetting, getGAMeasurementId } = useSiteSettings();
  const [measurementId, setMeasurementId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading) {
      setMeasurementId(getGAMeasurementId());
    }
  }, [loading, settings]);

  const handleSave = async () => {
    setSaving(true);
    await updateSetting('google_analytics_id', measurementId.trim());
    setSaving(false);
  };

  const isValidFormat = /^G-[A-Z0-9]+$/.test(measurementId.trim());
  const isConfigured = !!getGAMeasurementId();

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-serif flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Google Analytics 4
          </CardTitle>
          {isConfigured && (
            <Badge variant="default" className="bg-green-500/20 text-green-500 border-green-500/50">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          )}
        </div>
        <CardDescription>
          Connect Google Analytics to track website traffic, user behavior, and conversions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ga-id">Measurement ID</Label>
          <div className="flex gap-2">
            <Input
              id="ga-id"
              placeholder="G-XXXXXXXXXX"
              value={measurementId}
              onChange={(e) => setMeasurementId(e.target.value.toUpperCase())}
              className={measurementId && !isValidFormat ? 'border-destructive' : ''}
            />
            <Button onClick={handleSave} disabled={saving || loading}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
          {measurementId && !isValidFormat && (
            <p className="text-xs text-destructive">
              Invalid format. Should be G-XXXXXXXXXX
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Find your Measurement ID in Google Analytics → Admin → Data Streams
          </p>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-accent mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">How to set up Google Analytics:</p>
              <ol className="list-decimal list-inside mt-2 space-y-1 text-muted-foreground">
                <li>
                  Go to{' '}
                  <a
                    href="https://analytics.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    analytics.google.com
                  </a>
                </li>
                <li>Create or select a property for your website</li>
                <li>Set up a Web data stream with your domain</li>
                <li>Copy the Measurement ID (G-XXXXXXXXXX)</li>
                <li>Paste it above and click Save</li>
              </ol>
            </div>
          </div>
        </div>

        {isConfigured && (
          <Button variant="outline" className="w-full" asChild>
            <a
              href="https://analytics.google.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Google Analytics Dashboard
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
