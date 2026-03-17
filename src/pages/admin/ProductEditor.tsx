import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2, Save, Package } from "lucide-react";
import { toast } from "sonner";

interface ProductFormData {
  title: string;
  slug: string;
  description: string;
  price: string;
  compare_at_price: string;
  currency: string;
  sku: string;
  inventory_quantity: string;
  featured_image: string;
  images: string;
  status: string;
  category: string;
  tags: string;
  meta_title: string;
  meta_description: string;
}

const defaultForm: ProductFormData = {
  title: "",
  slug: "",
  description: "",
  price: "",
  compare_at_price: "",
  currency: "ZAR",
  sku: "",
  inventory_quantity: "0",
  featured_image: "",
  images: "",
  status: "draft",
  category: "",
  tags: "",
  meta_title: "",
  meta_description: "",
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const AdminProductEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const isNew = id === "new";
  const [form, setForm] = useState<ProductFormData>(defaultForm);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ["cms-product", id],
    queryFn: async () => {
      if (isNew) return null;
      const { data, error } = await supabase
        .from("cms_products")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !isNew,
  });

  useEffect(() => {
    if (product) {
      setForm({
        title: product.title || "",
        slug: product.slug || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        compare_at_price: product.compare_at_price?.toString() || "",
        currency: product.currency || "ZAR",
        sku: product.sku || "",
        inventory_quantity: product.inventory_quantity?.toString() || "0",
        featured_image: product.featured_image || "",
        images: (product.images || []).join("\n"),
        status: product.status || "draft",
        category: product.category || "",
        tags: (product.tags || []).join(", "),
        meta_title: product.meta_title || "",
        meta_description: product.meta_description || "",
      });
      setSlugManuallyEdited(true);
    }
  }, [product]);

  const saveMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const payload = {
        title: data.title.trim(),
        slug: data.slug.trim(),
        description: data.description.trim(),
        price: parseFloat(data.price),
        compare_at_price: data.compare_at_price ? parseFloat(data.compare_at_price) : null,
        currency: data.currency,
        sku: data.sku.trim() || null,
        inventory_quantity: parseInt(data.inventory_quantity) || 0,
        featured_image: data.featured_image.trim() || null,
        images: data.images
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        status: data.status,
        category: data.category.trim() || null,
        tags: data.tags
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        meta_title: data.meta_title.trim() || null,
        meta_description: data.meta_description.trim() || null,
      };

      if (isNew) {
        const { data: created, error } = await supabase
          .from("cms_products")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        return created;
      } else {
        const { data: updated, error } = await supabase
          .from("cms_products")
          .update(payload)
          .eq("id", id!)
          .select()
          .single();
        if (error) throw error;
        return updated;
      }
    },
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ["cms-products"] });
      queryClient.invalidateQueries({ queryKey: ["cms-product", id] });
      toast.success(isNew ? "Product created" : "Product updated");
      if (isNew) {
        navigate(`/manage/products/${saved.id}`);
      }
    },
    onError: (error: Error) => {
      toast.error("Failed to save product: " + error.message);
    },
  });

  const handleTitleChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      title: value,
      slug: slugManuallyEdited ? prev.slug : slugify(value),
    }));
  };

  const handleSlugChange = (value: string) => {
    setSlugManuallyEdited(true);
    setForm((prev) => ({ ...prev, slug: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Product title is required");
      return;
    }
    if (!form.price || isNaN(parseFloat(form.price))) {
      toast.error("Valid price is required");
      return;
    }
    if (!form.slug.trim()) {
      toast.error("Product slug is required");
      return;
    }
    saveMutation.mutate(form);
  };

  if (!isNew && isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (!isNew && !product && !isLoading) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Product not found</p>
          <Button variant="outline" onClick={() => navigate("/manage/products")} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => navigate("/manage/products")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{isNew ? "New Product" : form.title || "Edit Product"}</h1>
            <p className="text-muted-foreground mt-1">
              {isNew ? "Create a new commerce product" : `Editing: ${product?.slug}`}
            </p>
          </div>
          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isNew ? "Create" : "Save"}
          </Button>
        </div>

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Product name"
                  required
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={form.slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="product-slug"
                  required
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Product description"
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={form.category}
                  onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                  placeholder="e.g. Wigs, Bundles"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  value={form.tags}
                  onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
                  placeholder="tag1, tag2, tag3"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing & Inventory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="compare_at_price">Compare at Price</Label>
                <Input
                  id="compare_at_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.compare_at_price}
                  onChange={(e) => setForm((p) => ({ ...p, compare_at_price: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={form.currency}
                  onValueChange={(v) => setForm((p) => ({ ...p, currency: v }))}
                >
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ZAR">ZAR (R)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={form.sku}
                  onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))}
                  placeholder="PROD-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inventory_quantity">Stock Quantity</Label>
                <Input
                  id="inventory_quantity"
                  type="number"
                  min="0"
                  value={form.inventory_quantity}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, inventory_quantity: e.target.value }))
                  }
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm((p) => ({ ...p, status: v }))}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="featured_image">Featured Image URL</Label>
              <Input
                id="featured_image"
                value={form.featured_image}
                onChange={(e) => setForm((p) => ({ ...p, featured_image: e.target.value }))}
                placeholder="https://example.com/image.jpg"
              />
              {form.featured_image && (
                <img
                  src={form.featured_image}
                  alt="Featured"
                  className="mt-2 h-32 w-32 object-cover rounded border"
                />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="images">Additional Image URLs (one per line)</Label>
              <Textarea
                id="images"
                value={form.images}
                onChange={(e) => setForm((p) => ({ ...p, images: e.target.value }))}
                placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* SEO */}
        <Card>
          <CardHeader>
            <CardTitle>SEO (optional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="meta_title">Meta Title</Label>
              <Input
                id="meta_title"
                value={form.meta_title}
                onChange={(e) => setForm((p) => ({ ...p, meta_title: e.target.value }))}
                placeholder="Page title for search engines"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meta_description">Meta Description</Label>
              <Textarea
                id="meta_description"
                value={form.meta_description}
                onChange={(e) => setForm((p) => ({ ...p, meta_description: e.target.value }))}
                placeholder="Brief description for search results"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2 pb-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/manage/products")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isNew ? "Create Product" : "Save Changes"}
          </Button>
        </div>
      </form>
    </AdminLayout>
  );
};

export default AdminProductEditor;
