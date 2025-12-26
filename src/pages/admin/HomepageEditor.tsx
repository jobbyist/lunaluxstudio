import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Loader2, 
  Save, 
  Sparkles, 
  GripVertical, 
  Eye, 
  EyeOff,
  RefreshCw
} from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
import { useNavigate } from "react-router-dom";

interface HomepageSection {
  id: string;
  section_key: string;
  section_name: string;
  content: Record<string, string>;
  is_visible: boolean;
  display_order: number;
}

const HomepageEditor = () => {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState<Record<string, string>>({});
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const { isAdmin, loading: adminLoading, requireAdmin } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate("/admin-login");
    }
  }, [isAdmin, adminLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchSections();
    }
  }, [isAdmin]);

  const fetchSections = async () => {
    try {
      const { data, error } = await supabase
        .from("homepage_sections")
        .select("*")
        .order("display_order");

      if (error) throw error;
      // Type assertion to handle Json type from Supabase
      const typedData = (data || []).map(section => ({
        ...section,
        content: section.content as Record<string, string>
      }));
      setSections(typedData);
    } catch (error) {
      console.error("Error fetching sections:", error);
      toast.error("Failed to load sections");
    } finally {
      setLoading(false);
    }
  };

  const updateSection = async (sectionId: string, updates: Partial<HomepageSection>) => {
    setSaving(sectionId);
    try {
      const { error } = await supabase
        .from("homepage_sections")
        .update(updates)
        .eq("id", sectionId);

      if (error) throw error;
      
      setSections(prev => 
        prev.map(s => s.id === sectionId ? { ...s, ...updates } : s)
      );
      toast.success("Section updated");
    } catch (error) {
      console.error("Error updating section:", error);
      toast.error("Failed to update section");
    } finally {
      setSaving(null);
    }
  };

  const updateContentField = (sectionId: string, field: string, value: string) => {
    setSections(prev =>
      prev.map(s => {
        if (s.id === sectionId) {
          return {
            ...s,
            content: { ...s.content, [field]: value }
          };
        }
        return s;
      })
    );
  };

  const saveContent = async (section: HomepageSection) => {
    await updateSection(section.id, { content: section.content });
  };

  const handleAiEdit = async (section: HomepageSection) => {
    const prompt = aiPrompt[section.id];
    if (!prompt?.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setAiLoading(section.id);
    try {
      const response = await supabase.functions.invoke("ai-content-edit", {
        body: {
          prompt,
          currentContent: section.content,
          sectionKey: section.section_key
        }
      });

      if (response.error) {
        throw new Error(response.error.message || "AI request failed");
      }

      const newContent = response.data?.content;
      if (!newContent) {
        throw new Error("No content returned from AI");
      }

      // Update the section with AI-generated content
      await updateSection(section.id, { content: newContent });
      setSections(prev =>
        prev.map(s => s.id === section.id ? { ...s, content: newContent } : s)
      );
      setAiPrompt(prev => ({ ...prev, [section.id]: "" }));
      toast.success("Content updated with AI");
    } catch (error: any) {
      console.error("AI edit error:", error);
      toast.error(error.message || "Failed to update with AI");
    } finally {
      setAiLoading(null);
    }
  };

  const toggleVisibility = async (section: HomepageSection) => {
    await updateSection(section.id, { is_visible: !section.is_visible });
  };

  if (adminLoading || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif">Homepage Editor</h1>
            <p className="text-muted-foreground mt-1">
              Edit homepage sections using AI prompts or manual editing
            </p>
          </div>
          <Button variant="outline" onClick={fetchSections}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="space-y-6">
          {sections.map((section) => (
            <Card key={section.id} className={!section.is_visible ? "opacity-60" : ""}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="flex items-center gap-3">
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                  <div>
                    <CardTitle className="text-lg">{section.section_name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{section.section_key}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {section.is_visible ? (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    )}
                    <Switch
                      checked={section.is_visible}
                      onCheckedChange={() => toggleVisibility(section)}
                    />
                    <Label className="text-sm">Visible</Label>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* AI Prompt Section */}
                <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span>Edit with AI</span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., Make the title more engaging and add emojis..."
                      value={aiPrompt[section.id] || ""}
                      onChange={(e) => setAiPrompt(prev => ({
                        ...prev,
                        [section.id]: e.target.value
                      }))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleAiEdit(section);
                        }
                      }}
                    />
                    <Button
                      onClick={() => handleAiEdit(section)}
                      disabled={aiLoading === section.id}
                    >
                      {aiLoading === section.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Manual Content Editing */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Content Fields</h4>
                  <div className="grid gap-4">
                    {Object.entries(section.content).map(([key, value]) => (
                      <div key={key} className="space-y-2">
                        <Label className="capitalize">{key.replace(/_/g, " ")}</Label>
                        {typeof value === "string" && value.length > 100 ? (
                          <Textarea
                            value={value as string}
                            onChange={(e) => updateContentField(section.id, key, e.target.value)}
                            rows={3}
                          />
                        ) : (
                          <Input
                            value={value as string}
                            onChange={(e) => updateContentField(section.id, key, e.target.value)}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <Button
                    onClick={() => saveContent(section)}
                    disabled={saving === section.id}
                  >
                    {saving === section.id ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default HomepageEditor;