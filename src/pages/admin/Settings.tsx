import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
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

const AdminSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>({
    site_name: 'Luna Luxury Hair',
    site_description: 'Premium luxury hair and beauty products',
    contact_email: 'info@lunaluxhair.com',
    social_media: {
      instagram: 'https://instagram.com/lunaluxhair',
      facebook: 'https://facebook.com/lunaluxhair',
      twitter: 'https://twitter.com/lunaluxhair',
    },
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      // Settings table not yet configured - show info toast
      toast.info('Settings feature will be available once the database is configured');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
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
                placeholder="Luna Luxury Hair"
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
                placeholder="info@lunaluxhair.com"
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
                placeholder="https://instagram.com/lunaluxhair"
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
                placeholder="https://facebook.com/lunaluxhair"
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
                placeholder="https://twitter.com/lunaluxhair"
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
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
