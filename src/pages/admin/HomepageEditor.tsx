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
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface HomepageSection {
  id: string;
  section_key: string;
  section_name: string;
  content: Record<string, string>;
  is_visible: boolean;
  display_order: number;
}

interface SortableSectionProps {
  section: HomepageSection;
  saving: string | null;
  aiPrompt: Record<string, string>;
  aiLoading: string | null;
  onUpdateContentField: (sectionId: string, field: string, value: string) => void;
  onSaveContent: (section: HomepageSection) => void;
  onToggleVisibility: (section: HomepageSection) => void;
  onAiEdit: (section: HomepageSection) => void;
  onAiPromptChange: (sectionId: string, value: string) => void;
}

const SortableSection = ({
  section,
  saving,
  aiPrompt,
  aiLoading,
  onUpdateContentField,
  onSaveContent,
  onToggleVisibility,
  onAiEdit,
  onAiPromptChange,
}: SortableSectionProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={!section.is_visible ? "opacity-60" : ""}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-3">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing touch-none"
            >
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>
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
                onCheckedChange={() => onToggleVisibility(section)}
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
                onChange={(e) => onAiPromptChange(section.id, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    onAiEdit(section);
                  }
                }}
              />
              <Button
                onClick={() => onAiEdit(section)}
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
                      onChange={(e) => onUpdateContentField(section.id, key, e.target.value)}
                      rows={3}
                    />
                  ) : (
                    <Input
                      value={value as string}
                      onChange={(e) => onUpdateContentField(section.id, key, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={() => onSaveContent(section)}
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
    </div>
  );
};

const HomepageEditor = () => {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState<Record<string, string>>({});
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const { isAdmin, loading: adminLoading, requireAdmin } = useAdmin();
  const navigate = useNavigate();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);

    const newSections = arrayMove(sections, oldIndex, newIndex);

    // Update local state immediately for responsive UI
    setSections(newSections);

    // Update display_order in database for all affected sections
    try {
      const updates = newSections.map((section, index) => ({
        id: section.id,
        display_order: index,
      }));

      // Batch update all sections concurrently
      await Promise.all(
        updates.map((update) =>
          supabase
            .from("homepage_sections")
            .update({ display_order: update.display_order })
            .eq("id", update.id)
        )
      );

      toast.success("Section order updated");
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update section order");
      // Revert on error
      fetchSections();
    }
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
            <h1 className="text-3xl font-serif">Visual Homepage Builder</h1>
            <p className="text-muted-foreground mt-1">
              Drag and drop to reorder sections, edit content with AI or manually
            </p>
          </div>
          <Button variant="outline" onClick={fetchSections}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sections.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-6">
              {sections.map((section) => (
                <SortableSection
                  key={section.id}
                  section={section}
                  saving={saving}
                  aiPrompt={aiPrompt}
                  aiLoading={aiLoading}
                  onUpdateContentField={updateContentField}
                  onSaveContent={saveContent}
                  onToggleVisibility={toggleVisibility}
                  onAiEdit={handleAiEdit}
                  onAiPromptChange={(sectionId, value) =>
                    setAiPrompt((prev) => ({ ...prev, [sectionId]: value }))
                  }
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </AdminLayout>
  );
};

export default HomepageEditor;