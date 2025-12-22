import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Save } from 'lucide-react';

interface SiteSettings {
  site_name: string;
  site_description: string;
  contact_email: string;
  social_media: {
    instagram: string;
    facebook: string;
    twitter: string;
  };
}

interface SettingsData {
  key: string;
  value: string | { [key: string]: string };
}

const AdminSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>({
    site_name: '',
    site_description: '',
    contact_email: '',
    social_media: {
      instagram: '',
      facebook: '',
      twitter: '',
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('site_settings')
        .select('*');

      if (error) throw error;

      const settingsObj: { [key: string]: string | { [key: string]: string } } = {};
      data?.forEach((item: SettingsData) => {
        settingsObj[item.key] = item.value;
      });

      setSettings({
        site_name: typeof settingsObj.site_name === 'string' ? settingsObj.site_name : '',
        site_description: typeof settingsObj.site_description === 'string' ? settingsObj.site_description : '',
        contact_email: typeof settingsObj.contact_email === 'string' ? settingsObj.contact_email : '',
        social_media: typeof settingsObj.social_media === 'object' && settingsObj.social_media !== null ? 
          settingsObj.social_media as { instagram: string; facebook: string; twitter: string } : 
          { instagram: '', facebook: '', twitter: '' },
      });
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const updates = [
        { key: 'site_name', value: settings.site_name },
        { key: 'site_description', value: settings.site_description },
        { key: 'contact_email', value: settings.contact_email },
        { key: 'social_media', value: settings.social_media },
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from('site_settings')
          .upsert({
            key: update.key,
            value: update.value,
            updated_by: user.id,
          }, {
            onConflict: 'key'
          });

        if (error) throw error;
      }

      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save settings';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your website settings
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="site_name">Site Name</Label>
                  <Input
                    id="site_name"
                    value={settings.site_name}
                    onChange={(e) =>
                      setSettings({ ...settings, site_name: e.target.value })
                    }
                    placeholder="LunaStudio"
                  />
                </div>

                <div>
                  <Label htmlFor="site_description">Site Description</Label>
                  <Input
                    id="site_description"
                    value={settings.site_description}
                    onChange={(e) =>
                      setSettings({ ...settings, site_description: e.target.value })
                    }
                    placeholder="Premium hair care and styling products"
                  />
                </div>

                <div>
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={settings.contact_email}
                    onChange={(e) =>
                      setSettings({ ...settings, contact_email: e.target.value })
                    }
                    placeholder="info@lunastudio.com"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Social Media</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="instagram">Instagram URL</Label>
                  <Input
                    id="instagram"
                    type="url"
                    value={settings.social_media.instagram}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        social_media: {
                          ...settings.social_media,
                          instagram: e.target.value,
                        },
                      })
                    }
                    placeholder="https://instagram.com/lunastudio"
                  />
                </div>

                <div>
                  <Label htmlFor="facebook">Facebook URL</Label>
                  <Input
                    id="facebook"
                    type="url"
                    value={settings.social_media.facebook}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        social_media: {
                          ...settings.social_media,
                          facebook: e.target.value,
                        },
                      })
                    }
                    placeholder="https://facebook.com/lunastudio"
                  />
                </div>

                <div>
                  <Label htmlFor="twitter">Twitter URL</Label>
                  <Input
                    id="twitter"
                    type="url"
                    value={settings.social_media.twitter}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        social_media: {
                          ...settings.social_media,
                          twitter: e.target.value,
                        },
                      })
                    }
                    placeholder="https://twitter.com/lunastudio"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
