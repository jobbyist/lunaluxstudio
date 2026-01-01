import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Globe, Share2, Palette, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface SiteSettings {
  site_name: string;
  site_description: string;
  contact_email: string;
  social_links: {
    instagram: string;
    twitter: string;
    facebook: string;
  };
  appearance: {
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    background_color: string;
    text_color: string;
    font_heading: string;
    font_body: string;
  };
  gemini_api_key?: string;
}

export default function AdminSettings() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>({
    site_name: 'Luna Luxury Hair',
    site_description: 'Premium Hair Extensions & Beauty Products',
    contact_email: '',
    social_links: {
      instagram: '',
      twitter: '',
      facebook: '',
    },
    appearance: {
      primary_color: '#E5B8D5',
      secondary_color: '#D4A5C7',
      accent_color: '#F0C8E0',
      background_color: '#FFFFFF',
      text_color: '#1F2937',
      font_heading: 'font-seasons',
      font_body: 'font-sans',
    },
    gemini_api_key: '',
  });

  useEffect(() => {
    // Settings loading disabled - using localStorage as temporary storage
    const savedSettings = localStorage.getItem('site_settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error parsing saved settings:', error);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Save to localStorage temporarily until site_settings table is created
      localStorage.setItem('site_settings', JSON.stringify(settings));
      toast.success('Settings saved locally');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground mt-2">
              Configure your site settings, appearance, and integrations
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-primary" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="site_name">Site Name</Label>
                <Input
                  id="site_name"
                  value={settings.site_name}
                  onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="site_description">Site Description</Label>
                <textarea
                  id="site_description"
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={settings.site_description}
                  onChange={(e) => setSettings({ ...settings, site_description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={settings.contact_email}
                  onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Palette className="w-5 h-5 text-primary" />
                Appearance Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary_color">Primary Color</Label>
                  <div className="flex items-center gap-3">
                    <input
                      id="primary_color"
                      type="color"
                      value={settings.appearance.primary_color}
                      onChange={(e) => setSettings({
                        ...settings,
                        appearance: { ...settings.appearance, primary_color: e.target.value }
                      })}
                      className="h-10 w-20 rounded cursor-pointer border border-input"
                    />
                    <Input
                      value={settings.appearance.primary_color}
                      onChange={(e) => setSettings({
                        ...settings,
                        appearance: { ...settings.appearance, primary_color: e.target.value }
                      })}
                      className="font-mono text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondary_color">Secondary Color</Label>
                  <div className="flex items-center gap-3">
                    <input
                      id="secondary_color"
                      type="color"
                      value={settings.appearance.secondary_color}
                      onChange={(e) => setSettings({
                        ...settings,
                        appearance: { ...settings.appearance, secondary_color: e.target.value }
                      })}
                      className="h-10 w-20 rounded cursor-pointer border border-input"
                    />
                    <Input
                      value={settings.appearance.secondary_color}
                      onChange={(e) => setSettings({
                        ...settings,
                        appearance: { ...settings.appearance, secondary_color: e.target.value }
                      })}
                      className="font-mono text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accent_color">Accent Color</Label>
                  <div className="flex items-center gap-3">
                    <input
                      id="accent_color"
                      type="color"
                      value={settings.appearance.accent_color}
                      onChange={(e) => setSettings({
                        ...settings,
                        appearance: { ...settings.appearance, accent_color: e.target.value }
                      })}
                      className="h-10 w-20 rounded cursor-pointer border border-input"
                    />
                    <Input
                      value={settings.appearance.accent_color}
                      onChange={(e) => setSettings({
                        ...settings,
                        appearance: { ...settings.appearance, accent_color: e.target.value }
                      })}
                      className="font-mono text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="background_color">Background Color</Label>
                  <div className="flex items-center gap-3">
                    <input
                      id="background_color"
                      type="color"
                      value={settings.appearance.background_color}
                      onChange={(e) => setSettings({
                        ...settings,
                        appearance: { ...settings.appearance, background_color: e.target.value }
                      })}
                      className="h-10 w-20 rounded cursor-pointer border border-input"
                    />
                    <Input
                      value={settings.appearance.background_color}
                      onChange={(e) => setSettings({
                        ...settings,
                        appearance: { ...settings.appearance, background_color: e.target.value }
                      })}
                      className="font-mono text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="text_color">Text Color</Label>
                  <div className="flex items-center gap-3">
                    <input
                      id="text_color"
                      type="color"
                      value={settings.appearance.text_color}
                      onChange={(e) => setSettings({
                        ...settings,
                        appearance: { ...settings.appearance, text_color: e.target.value }
                      })}
                      className="h-10 w-20 rounded cursor-pointer border border-input"
                    />
                    <Input
                      value={settings.appearance.text_color}
                      onChange={(e) => setSettings({
                        ...settings,
                        appearance: { ...settings.appearance, text_color: e.target.value }
                      })}
                      className="font-mono text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label htmlFor="font_heading">Heading Font</Label>
                  <select
                    id="font_heading"
                    value={settings.appearance.font_heading}
                    onChange={(e) => setSettings({
                      ...settings,
                      appearance: { ...settings.appearance, font_heading: e.target.value }
                    })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="font-sans">Sans Serif (Inter)</option>
                    <option value="font-serif">Serif (Playfair Display)</option>
                    <option value="font-mono">Monospace (JetBrains Mono)</option>
                    <option value="font-seasons">The Seasons</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="font_body">Body Font</Label>
                  <select
                    id="font_body"
                    value={settings.appearance.font_body}
                    onChange={(e) => setSettings({
                      ...settings,
                      appearance: { ...settings.appearance, font_body: e.target.value }
                    })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="font-sans">Sans Serif (Inter)</option>
                    <option value="font-serif">Serif (Playfair Display)</option>
                    <option value="font-mono">Monospace (JetBrains Mono)</option>
                    <option value="font-seasons">The Seasons</option>
                  </select>
                </div>
              </div>

              {/* Color Preview */}
              <div className="pt-4 border-t">
                <Label className="mb-3 block">Theme Preview</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div 
                    className="p-4 rounded-lg border-2 text-center"
                    style={{ 
                      backgroundColor: settings.appearance.primary_color,
                      color: settings.appearance.text_color
                    }}
                  >
                    <p className="text-sm font-semibold">Primary</p>
                  </div>
                  <div 
                    className="p-4 rounded-lg border-2 text-center"
                    style={{ 
                      backgroundColor: settings.appearance.secondary_color,
                      color: settings.appearance.text_color
                    }}
                  >
                    <p className="text-sm font-semibold">Secondary</p>
                  </div>
                  <div 
                    className="p-4 rounded-lg border-2 text-center"
                    style={{ 
                      backgroundColor: settings.appearance.accent_color,
                      color: settings.appearance.text_color
                    }}
                  >
                    <p className="text-sm font-semibold">Accent</p>
                  </div>
                  <div 
                    className="p-4 rounded-lg border-2 text-center"
                    style={{ 
                      backgroundColor: settings.appearance.background_color,
                      color: settings.appearance.text_color,
                      borderColor: settings.appearance.primary_color
                    }}
                  >
                    <p className="text-sm font-semibold">Background</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Share2 className="w-5 h-5 text-primary" />
                Social Media
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram URL</Label>
                <Input
                  id="instagram"
                  value={settings.social_links.instagram}
                  onChange={(e) => setSettings({
                    ...settings,
                    social_links: { ...settings.social_links, instagram: e.target.value }
                  })}
                  placeholder="https://instagram.com/yourprofile"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter URL</Label>
                <Input
                  id="twitter"
                  value={settings.social_links.twitter}
                  onChange={(e) => setSettings({
                    ...settings,
                    social_links: { ...settings.social_links, twitter: e.target.value }
                  })}
                  placeholder="https://twitter.com/yourprofile"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook URL</Label>
                <Input
                  id="facebook"
                  value={settings.social_links.facebook}
                  onChange={(e) => setSettings({
                    ...settings,
                    social_links: { ...settings.social_links, facebook: e.target.value }
                  })}
                  placeholder="https://facebook.com/yourpage"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-primary" />
                AI Integration (Gemini 3 Pro)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gemini_api_key">Gemini API Key</Label>
                <Input
                  id="gemini_api_key"
                  type="password"
                  value={settings.gemini_api_key || ''}
                  onChange={(e) => setSettings({ ...settings, gemini_api_key: e.target.value })}
                  placeholder="Enter your Gemini API key"
                />
                <p className="text-xs text-muted-foreground">
                  Get your API key from the{' '}
                  <a 
                    href="https://ai.google.dev/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Google AI Studio
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}