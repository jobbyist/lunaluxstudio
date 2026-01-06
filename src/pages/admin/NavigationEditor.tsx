import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Loader2, 
  Save, 
  Trash2,
  Plus,
  GripVertical,
  Eye, 
  EyeOff,
  RefreshCw
} from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
import { useNavigate } from "react-router-dom";

interface NavigationMenuItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  display_order: number;
  is_visible: boolean;
  is_mobile_only: boolean;
  is_desktop_only: boolean;
}

const NavigationEditor = () => {
  const [menuItems, setMenuItems] = useState<NavigationMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate("/admin-login");
    }
  }, [isAdmin, adminLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchMenuItems();
    }
  }, [isAdmin]);

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from("navigation_menu")
        .select("*")
        .order("display_order");

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      toast.error("Failed to load navigation menu");
    } finally {
      setLoading(false);
    }
  };

  const updateMenuItem = async (itemId: string, updates: Partial<NavigationMenuItem>) => {
    setSaving(itemId);
    try {
      const { error } = await supabase
        .from("navigation_menu")
        .update(updates)
        .eq("id", itemId);

      if (error) throw error;
      
      setMenuItems(prev => 
        prev.map(item => item.id === itemId ? { ...item, ...updates } : item)
      );
      toast.success("Menu item updated");
    } catch (error) {
      console.error("Error updating menu item:", error);
      toast.error("Failed to update menu item");
    } finally {
      setSaving(null);
    }
  };

  const deleteMenuItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from("navigation_menu")
        .delete()
        .eq("id", itemId);

      if (error) throw error;
      
      setMenuItems(prev => prev.filter(item => item.id !== itemId));
      toast.success("Menu item deleted");
    } catch (error) {
      console.error("Error deleting menu item:", error);
      toast.error("Failed to delete menu item");
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleDeleteClick = (itemId: string) => {
    setItemToDelete(itemId);
    setDeleteDialogOpen(true);
  };

  const addMenuItem = async () => {
    try {
      const newItem = {
        label: "New Item",
        path: "/",
        icon: "Home",
        display_order: menuItems.length,
        is_visible: true,
        is_mobile_only: false,
        is_desktop_only: false,
      };

      const { data, error } = await supabase
        .from("navigation_menu")
        .insert([newItem])
        .select()
        .single();

      if (error) throw error;
      
      setMenuItems(prev => [...prev, data]);
      toast.success("Menu item added");
    } catch (error) {
      console.error("Error adding menu item:", error);
      toast.error("Failed to add menu item");
    }
  };

  const updateField = (itemId: string, field: keyof NavigationMenuItem, value: any) => {
    setMenuItems(prev =>
      prev.map(item => {
        if (item.id === itemId) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
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
            <h1 className="text-3xl font-serif">Navigation Menu Editor</h1>
            <p className="text-muted-foreground mt-1">
              Manage your site navigation menu items
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchMenuItems}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={addMenuItem}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {menuItems.map((item) => (
            <Card key={item.id} className={!item.is_visible ? "opacity-60" : ""}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="flex items-center gap-3">
                  <div>
                    <CardTitle className="text-lg">{item.label}</CardTitle>
                    <p className="text-sm text-muted-foreground">{item.path}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {item.is_visible ? (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    )}
                    <Switch
                      checked={item.is_visible}
                      onCheckedChange={(checked) => updateMenuItem(item.id, { is_visible: checked })}
                    />
                    <Label className="text-sm">Visible</Label>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteClick(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Label</Label>
                    <Input
                      value={item.label}
                      onChange={(e) => updateField(item.id, "label", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Path</Label>
                    <Input
                      value={item.path}
                      onChange={(e) => updateField(item.id, "path", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Icon (Lucide name)</Label>
                    <Input
                      value={item.icon || ""}
                      onChange={(e) => updateField(item.id, "icon", e.target.value)}
                      placeholder="Home, Mail, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Display Order</Label>
                    <Input
                      type="number"
                      value={item.display_order}
                      onChange={(e) => updateField(item.id, "display_order", parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={item.is_mobile_only}
                      onCheckedChange={(checked) => updateField(item.id, "is_mobile_only", checked)}
                    />
                    <Label className="text-sm">Mobile Only</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={item.is_desktop_only}
                      onCheckedChange={(checked) => updateField(item.id, "is_desktop_only", checked)}
                    />
                    <Label className="text-sm">Desktop Only</Label>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={() => updateMenuItem(item.id, item)}
                    disabled={saving === item.id}
                  >
                    {saving === item.id ? (
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

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Menu Item</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this menu item? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => itemToDelete && deleteMenuItem(itemToDelete)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default NavigationEditor;
