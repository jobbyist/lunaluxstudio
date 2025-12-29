import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Save, Globe, Share2, Palette } from 'lucide-react';
import toast from 'react-hot-toast';

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
    font_heading: string;
    font_body: string;
  };
}

export function AdminSettings() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>({
    site_name: 'Luna Studio',
    site_description: 'Portfolio & Blog',
    contact_email: '',
    social_links: {
      instagram: '',
      twitter: '',
      facebook: '',
    },
    appearance: {
      primary_color: '#E5B8D5',
      font_heading: 'font-sans',
      font_body: 'font-sans',
    }
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setSettings(data.value);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ 
          id: 1,
          value: settings,
          updated_at: new Date().toISOString() 
        });

      if (error) throw error;
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-serif text-gray-900">Settings</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Globe className="w-5 h-5 text-rose-400" />
            <h2 className="text-xl font-serif font-medium">General Settings</h2>
          </div>
          
          <div className="space-y-4">
            <Input
              label="Site Name"
              value={settings.site_name}
              onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Site Description
              </label>
              <textarea
                className="w-full px-4 py-2 border border-rose-100 rounded-lg focus:ring-2 focus:ring-rose-200 focus:border-rose-300 outline-none transition-all min-h-[100px]"
                value={settings.site_description}
                onChange={(e) => setSettings({ ...settings, site_description: e.target.value })}
              />
            </div>

            <Input
              label="Contact Email"
              type="email"
              value={settings.contact_email}
              onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
            />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Palette className="w-5 h-5 text-rose-400" />
            <h2 className="text-xl font-serif font-medium">Appearance Settings</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Primary Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.appearance.primary_color}
                  onChange={(e) => setSettings({
                    ...settings,
                    appearance: { ...settings.appearance, primary_color: e.target.value }
                  })}
                  className="h-10 w-20 rounded cursor-pointer border border-gray-200"
                />
                <span className="text-sm text-gray-500 font-mono">
                  {settings.appearance.primary_color}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Heading Font
                </label>
                <select
                  value={settings.appearance.font_heading}
                  onChange={(e) => setSettings({
                    ...settings,
                    appearance: { ...settings.appearance, font_heading: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-rose-100 rounded-lg focus:ring-2 focus:ring-rose-200 focus:border-rose-300 outline-none transition-all bg-white"
                >
                  <option value="font-sans">Sans Serif (Inter)</option>
                  <option value="font-serif">Serif (Playfair Display)</option>
                  <option value="font-mono">Monospace (JetBrains Mono)</option>
                  <option value="font-seasons">The Seasons</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Body Font
                </label>
                <select
                  value={settings.appearance.font_body}
                  onChange={(e) => setSettings({
                    ...settings,
                    appearance: { ...settings.appearance, font_body: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-rose-100 rounded-lg focus:ring-2 focus:ring-rose-200 focus:border-rose-300 outline-none transition-all bg-white"
                >
                  <option value="font-sans">Sans Serif (Inter)</option>
                  <option value="font-serif">Serif (Playfair Display)</option>
                  <option value="font-mono">Monospace (JetBrains Mono)</option>
                  <option value="font-seasons">The Seasons</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Share2 className="w-5 h-5 text-rose-400" />
            <h2 className="text-xl font-serif font-medium">Social Media</h2>
          </div>
          
          <div className="space-y-4">
            <Input
              label="Instagram URL"
              value={settings.social_links.instagram}
              onChange={(e) => setSettings({
                ...settings,
                social_links: { ...settings.social_links, instagram: e.target.value }
              })}
            />
            <Input
              label="Twitter URL"
              value={settings.social_links.twitter}
              onChange={(e) => setSettings({
                ...settings,
                social_links: { ...settings.social_links, twitter: e.target.value }
              })}
            />
            <Input
              label="Facebook URL"
              value={settings.social_links.facebook}
              onChange={(e) => setSettings({
                ...settings,
                social_links: { ...settings.social_links, facebook: e.target.value }
              })}
            />
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={loading} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}