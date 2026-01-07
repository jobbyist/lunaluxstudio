import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Save, GripVertical, ExternalLink, Link as LinkIcon, Menu, LayoutGrid } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Switch } from '@/components/ui/switch';

interface NavLink {
  label: string;
  path: string;
  translationKey?: string;
  external?: boolean;
}

interface SocialLink {
  platform: string;
  url: string;
  label: string;
}

interface NavigationSection {
  id: string;
  location: string;
  section: string | null;
  links: NavLink[];
  social_links: SocialLink[];
}

const NavigationEditor = () => {
  const [navigation, setNavigation] = useState<NavigationSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchNavigation();
  }, []);

  const fetchNavigation = async () => {
    try {
      const { data, error } = await supabase
        .from('navigation_settings')
        .select('*')
        .order('location');

      if (error) throw error;
      setNavigation(data?.map(item => ({
        id: item.id,
        location: item.location,
        section: item.section,
        links: (item.links as unknown as NavLink[]) || [],
        social_links: (item.social_links as unknown as SocialLink[]) || []
      })) || []);
    } catch (error) {
      console.error('Error fetching navigation:', error);
      toast.error('Failed to load navigation settings');
    } finally {
      setLoading(false);
    }
  };

  const updateLinks = (sectionId: string, newLinks: NavLink[]) => {
    setNavigation(prev => prev.map(section => 
      section.id === sectionId ? { ...section, links: newLinks } : section
    ));
  };

  const updateSocialLinks = (sectionId: string, newLinks: SocialLink[]) => {
    setNavigation(prev => prev.map(section => 
      section.id === sectionId ? { ...section, social_links: newLinks } : section
    ));
  };

  const addLink = (sectionId: string) => {
    const section = navigation.find(s => s.id === sectionId);
    if (!section) return;
    
    const newLinks = [...section.links, { label: 'New Link', path: '/' }];
    updateLinks(sectionId, newLinks);
  };

  const addSocialLink = (sectionId: string) => {
    const section = navigation.find(s => s.id === sectionId);
    if (!section) return;
    
    const newLinks = [...section.social_links, { platform: 'instagram', url: 'https://', label: 'New Social' }];
    updateSocialLinks(sectionId, newLinks);
  };

  const removeLink = (sectionId: string, index: number) => {
    const section = navigation.find(s => s.id === sectionId);
    if (!section) return;
    
    const newLinks = section.links.filter((_, i) => i !== index);
    updateLinks(sectionId, newLinks);
  };

  const removeSocialLink = (sectionId: string, index: number) => {
    const section = navigation.find(s => s.id === sectionId);
    if (!section) return;
    
    const newLinks = section.social_links.filter((_, i) => i !== index);
    updateSocialLinks(sectionId, newLinks);
  };

  const updateLink = (sectionId: string, index: number, field: keyof NavLink, value: string | boolean) => {
    const section = navigation.find(s => s.id === sectionId);
    if (!section) return;
    
    const newLinks = section.links.map((link, i) => 
      i === index ? { ...link, [field]: value } : link
    );
    updateLinks(sectionId, newLinks);
  };

  const updateSocialLink = (sectionId: string, index: number, field: keyof SocialLink, value: string) => {
    const section = navigation.find(s => s.id === sectionId);
    if (!section) return;
    
    const newLinks = section.social_links.map((link, i) => 
      i === index ? { ...link, [field]: value } : link
    );
    updateSocialLinks(sectionId, newLinks);
  };

  const saveSection = async (section: NavigationSection) => {
    setSaving(section.id);
    try {
      const { error } = await supabase
        .from('navigation_settings')
        .update({
          links: JSON.parse(JSON.stringify(section.links)),
          social_links: JSON.parse(JSON.stringify(section.social_links))
        })
        .eq('id', section.id);

      if (error) throw error;
      toast.success(`${section.section || section.location} navigation saved`);
    } catch (error) {
      console.error('Error saving navigation:', error);
      toast.error('Failed to save navigation');
    } finally {
      setSaving(null);
    }
  };

  const getSectionTitle = (section: NavigationSection) => {
    if (section.location === 'header') {
      return section.section === 'main' ? 'Main Navigation' : 'More Menu';
    }
    return section.section ? section.section.charAt(0).toUpperCase() + section.section.slice(1) : 'Links';
  };

  const renderLinkEditor = (section: NavigationSection) => (
    <div className="space-y-4">
      {section.links.map((link, index) => (
        <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Label</Label>
              <Input
                value={link.label}
                onChange={(e) => updateLink(section.id, index, 'label', e.target.value)}
                placeholder="Link label"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Path / URL</Label>
              <Input
                value={link.path}
                onChange={(e) => updateLink(section.id, index, 'path', e.target.value)}
                placeholder="/page or https://..."
                className="mt-1"
              />
            </div>
            <div className="flex items-end gap-3">
              <div className="flex items-center gap-2">
                <Switch
                  checked={link.external || false}
                  onCheckedChange={(checked) => updateLink(section.id, index, 'external', checked)}
                />
                <Label className="text-xs">External</Label>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeLink(section.id, index)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
      
      <div className="flex justify-between">
        <Button variant="outline" size="sm" onClick={() => addLink(section.id)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Link
        </Button>
        <Button onClick={() => saveSection(section)} disabled={saving === section.id}>
          <Save className="h-4 w-4 mr-2" />
          {saving === section.id ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );

  const renderSocialLinkEditor = (section: NavigationSection) => (
    <div className="space-y-4">
      {section.social_links.map((link, index) => (
        <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Platform</Label>
              <Input
                value={link.platform}
                onChange={(e) => updateSocialLink(section.id, index, 'platform', e.target.value)}
                placeholder="instagram, facebook, etc."
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">URL</Label>
              <Input
                value={link.url}
                onChange={(e) => updateSocialLink(section.id, index, 'url', e.target.value)}
                placeholder="https://..."
                className="mt-1"
              />
            </div>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Label</Label>
                <Input
                  value={link.label}
                  onChange={(e) => updateSocialLink(section.id, index, 'label', e.target.value)}
                  placeholder="Display name"
                  className="mt-1"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeSocialLink(section.id, index)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
      
      <div className="flex justify-between">
        <Button variant="outline" size="sm" onClick={() => addSocialLink(section.id)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Social Link
        </Button>
        <Button onClick={() => saveSection(section)} disabled={saving === section.id}>
          <Save className="h-4 w-4 mr-2" />
          {saving === section.id ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  const headerSections = navigation.filter(n => n.location === 'header');
  const footerSections = navigation.filter(n => n.location === 'footer');

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-serif tracking-wider">Navigation Editor</h1>
          <p className="text-muted-foreground mt-2">
            Manage header and footer navigation links. Changes are reflected on the live site in real-time.
          </p>
        </div>

        <Tabs defaultValue="header" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="header" className="flex items-center gap-2">
              <Menu className="h-4 w-4" />
              Header
            </TabsTrigger>
            <TabsTrigger value="footer" className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" />
              Footer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="header" className="mt-6 space-y-6">
            {headerSections.map(section => (
              <Card key={section.id} className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-serif">
                    <LinkIcon className="h-5 w-5 text-primary" />
                    {getSectionTitle(section)}
                  </CardTitle>
                  <CardDescription>
                    {section.section === 'main' 
                      ? 'Main navigation links shown in the header' 
                      : 'Links shown in the "More" dropdown menu'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {renderLinkEditor(section)}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="footer" className="mt-6 space-y-6">
            {footerSections.map(section => (
              <Card key={section.id} className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-serif">
                    {section.section === 'social' ? (
                      <ExternalLink className="h-5 w-5 text-primary" />
                    ) : (
                      <LinkIcon className="h-5 w-5 text-primary" />
                    )}
                    {getSectionTitle(section)} Section
                  </CardTitle>
                  <CardDescription>
                    {section.section === 'social' 
                      ? 'Social media links shown in the footer' 
                      : `Links in the "${section.section}" column of the footer`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {section.section === 'social' 
                    ? renderSocialLinkEditor(section)
                    : renderLinkEditor(section)}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default NavigationEditor;
