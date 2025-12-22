import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';

interface ProductForm {
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
  status: 'draft' | 'active' | 'archived';
  tags: string;
  category: string;
  meta_title: string;
  meta_description: string;
}

const AdminProductEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ProductForm>({
    title: '',
    slug: '',
    description: '',
    price: '',
    compare_at_price: '',
    currency: 'USD',
    sku: '',
    inventory_quantity: '0',
    featured_image: '',
    images: '',
    status: 'draft',
    tags: '',
    category: '',
    meta_title: '',
    meta_description: '',
  });

  const loadProduct = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cms_products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      if (data) {
        setForm({
          title: data.title,
          slug: data.slug,
          description: data.description,
          price: data.price.toString(),
          compare_at_price: data.compare_at_price?.toString() || '',
          currency: data.currency,
          sku: data.sku || '',
          inventory_quantity: data.inventory_quantity.toString(),
          featured_image: data.featured_image || '',
          images: data.images?.join('\n') || '',
          status: data.status,
          tags: data.tags?.join(', ') || '',
          category: data.category || '',
          meta_title: data.meta_title || '',
          meta_description: data.meta_description || '',
        });
      }
    } catch (error) {
      console.error('Error loading product:', error);
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadProduct();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string) => {
    setForm({
      ...form,
      title,
      slug: id ? form.slug : generateSlug(title),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tagsArray = form.tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const imagesArray = form.images
        .split('\n')
        .map(i => i.trim())
        .filter(i => i.length > 0);

      const productData = {
        title: form.title,
        slug: form.slug,
        description: form.description,
        price: parseFloat(form.price),
        compare_at_price: form.compare_at_price ? parseFloat(form.compare_at_price) : null,
        currency: form.currency,
        sku: form.sku || null,
        inventory_quantity: parseInt(form.inventory_quantity),
        featured_image: form.featured_image || null,
        images: imagesArray.length > 0 ? imagesArray : null,
        status: form.status,
        tags: tagsArray.length > 0 ? tagsArray : null,
        category: form.category || null,
        meta_title: form.meta_title || null,
        meta_description: form.meta_description || null,
      };

      if (id) {
        // Update existing product
        const { error } = await supabase
          .from('cms_products')
          .update(productData)
          .eq('id', id);

        if (error) throw error;
        toast.success('Product updated successfully');
      } else {
        // Create new product
        const { error } = await supabase
          .from('cms_products')
          .insert(productData);

        if (error) throw error;
        toast.success('Product created successfully');
      }

      navigate('/admin/products');
    } catch (error) {
      console.error('Error saving product:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save product';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/products')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {id ? 'Edit Product' : 'New Product'}
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  required
                  placeholder="Enter product title"
                />
              </div>

              <div>
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  required
                  placeholder="product-url-slug"
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                  placeholder="Product description"
                  rows={5}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="compare_at_price">Compare at Price</Label>
                  <Input
                    id="compare_at_price"
                    type="number"
                    step="0.01"
                    value={form.compare_at_price}
                    onChange={(e) => setForm({ ...form, compare_at_price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={form.currency}
                    onValueChange={(value) => setForm({ ...form, currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    placeholder="PROD-001"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="inventory_quantity">Inventory Quantity *</Label>
                <Input
                  id="inventory_quantity"
                  type="number"
                  value={form.inventory_quantity}
                  onChange={(e) => setForm({ ...form, inventory_quantity: e.target.value })}
                  required
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="Hair Care, Styling, etc."
                />
              </div>

              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="natural, organic, vegan"
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(value: 'draft' | 'active' | 'archived') => setForm({ ...form, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="featured_image">Featured Image URL</Label>
                <Input
                  id="featured_image"
                  type="url"
                  value={form.featured_image}
                  onChange={(e) => setForm({ ...form, featured_image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <Label htmlFor="images">Additional Images (one URL per line)</Label>
                <Textarea
                  id="images"
                  value={form.images}
                  onChange={(e) => setForm({ ...form, images: e.target.value })}
                  placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                  rows={5}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="meta_title">Meta Title</Label>
                <Input
                  id="meta_title"
                  value={form.meta_title}
                  onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
                  placeholder="SEO title for search engines"
                />
              </div>

              <div>
                <Label htmlFor="meta_description">Meta Description</Label>
                <Textarea
                  id="meta_description"
                  value={form.meta_description}
                  onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
                  placeholder="SEO description for search engines"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/products')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Product'}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminProductEditor;
