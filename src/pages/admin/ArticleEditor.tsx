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

interface ArticleForm {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image: string;
  status: 'draft' | 'published' | 'archived';
  meta_title: string;
  meta_description: string;
  tags: string;
}

const AdminArticleEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ArticleForm>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featured_image: '',
    status: 'draft',
    meta_title: '',
    meta_description: '',
    tags: '',
  });

  const loadArticle = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      if (data) {
        setForm({
          title: data.title,
          slug: data.slug,
          content: data.content,
          excerpt: data.excerpt || '',
          featured_image: data.featured_image || '',
          status: data.status,
          meta_title: data.meta_title || '',
          meta_description: data.meta_description || '',
          tags: data.tags?.join(', ') || '',
        });
      }
    } catch (error) {
      console.error('Error loading article:', error);
      toast.error('Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadArticle();
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const tagsArray = form.tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const articleData = {
        title: form.title,
        slug: form.slug,
        content: form.content,
        excerpt: form.excerpt || null,
        featured_image: form.featured_image || null,
        status: form.status,
        meta_title: form.meta_title || null,
        meta_description: form.meta_description || null,
        tags: tagsArray.length > 0 ? tagsArray : null,
        published_at: form.status === 'published' ? new Date().toISOString() : null,
      };

      if (id) {
        // Update existing article
        const { error } = await supabase
          .from('articles')
          .update(articleData)
          .eq('id', id);

        if (error) throw error;
        toast.success('Article updated successfully');
      } else {
        // Create new article
        const { error } = await supabase
          .from('articles')
          .insert({
            ...articleData,
            author_id: user.id,
          });

        if (error) throw error;
        toast.success('Article created successfully');
      }

      navigate('/admin/articles');
    } catch (error) {
      console.error('Error saving article:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save article';
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
            onClick={() => navigate('/admin/articles')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {id ? 'Edit Article' : 'New Article'}
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Article Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  required
                  placeholder="Enter article title"
                />
              </div>

              <div>
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  required
                  placeholder="article-url-slug"
                />
              </div>

              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  placeholder="Short description of the article"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  required
                  placeholder="Write your article content here..."
                  rows={15}
                  className="font-mono text-sm"
                />
              </div>

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
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="hair care, styling, tips"
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(value: 'draft' | 'published' | 'archived') => setForm({ ...form, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
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
              onClick={() => navigate('/admin/articles')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Article'}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminArticleEditor;
