import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Save, 
  Sparkles, 
  FileVideo, 
  FileText, 
  Image, 
  Loader2,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Upload
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { logAdminActivity } from '@/hooks/useActivityLogger';

type ContentType = 'video' | 'blog' | 'image';

interface ContentForm {
  title: string;
  description: string;
  content_type: ContentType;
  cover_image_url: string;
  content_url: string;
  content_body: string;
  topic: string;
  external_link: string;
  meta_title: string;
  meta_description: string;
  tags: string[];
  status: 'draft' | 'published';
}

interface SEOAnalysis {
  score: number;
  issues: string[];
  suggestions: string[];
}

const ContentPublisher = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [seoAnalyzing, setSeoAnalyzing] = useState(false);
  const [form, setForm] = useState<ContentForm>({
    title: '',
    description: '',
    content_type: 'blog',
    cover_image_url: '',
    content_url: '',
    content_body: '',
    topic: '',
    external_link: '',
    meta_title: '',
    meta_description: '',
    tags: [],
    status: 'draft',
  });
  const [tagInput, setTagInput] = useState('');
  const [seoAnalysis, setSeoAnalysis] = useState<SEOAnalysis | null>(null);

  const analyzeSEO = async () => {
    setSeoAnalyzing(true);
    
    try {
      const response = await supabase.functions.invoke('chat', {
        body: {
          messages: [
            {
              role: 'user',
              content: `Analyze this content for SEO and return a JSON response with score (0-100), issues (array of problems), and suggestions (array of improvements).

Title: ${form.title}
Description: ${form.description}
Meta Title: ${form.meta_title}
Meta Description: ${form.meta_description}
Content Body: ${form.content_body.substring(0, 500)}
Tags: ${form.tags.join(', ')}

Return ONLY valid JSON in this exact format:
{"score": 75, "issues": ["issue 1", "issue 2"], "suggestions": ["suggestion 1", "suggestion 2"]}`
            }
          ]
        }
      });

      if (response.error) throw response.error;

      // Parse the streamed response
      const text = response.data;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        setSeoAnalysis(analysis);
      }
    } catch (error) {
      console.error('SEO analysis error:', error);
      // Fallback to basic analysis
      const score = calculateBasicSEOScore();
      setSeoAnalysis({
        score,
        issues: getBasicIssues(),
        suggestions: getBasicSuggestions()
      });
    } finally {
      setSeoAnalyzing(false);
    }
  };

  const calculateBasicSEOScore = () => {
    let score = 0;
    if (form.title.length > 10 && form.title.length < 60) score += 20;
    if (form.meta_title.length > 10 && form.meta_title.length < 60) score += 20;
    if (form.meta_description.length > 50 && form.meta_description.length < 160) score += 20;
    if (form.description.length > 50) score += 15;
    if (form.tags.length >= 3) score += 15;
    if (form.cover_image_url) score += 10;
    return Math.min(score, 100);
  };

  const getBasicIssues = () => {
    const issues: string[] = [];
    if (!form.title) issues.push('Title is missing');
    if (form.title.length > 60) issues.push('Title is too long (over 60 characters)');
    if (!form.meta_description) issues.push('Meta description is missing');
    if (form.meta_description.length > 160) issues.push('Meta description is too long');
    if (form.tags.length < 3) issues.push('Not enough tags (recommend at least 3)');
    if (!form.cover_image_url) issues.push('No cover image provided');
    return issues;
  };

  const getBasicSuggestions = () => {
    const suggestions: string[] = [];
    if (!form.meta_title) suggestions.push('Add a custom meta title for better SEO');
    if (form.description.length < 100) suggestions.push('Expand your description for better engagement');
    if (!form.external_link) suggestions.push('Consider adding a link to related content');
    return suggestions;
  };

  const generateWithAI = async (field: 'title' | 'description' | 'content') => {
    setAiLoading(true);
    
    try {
      let prompt = '';
      switch (field) {
        case 'title':
          prompt = `Generate 3 catchy, SEO-friendly titles for a ${form.content_type} about hair care/styling for a luxury hair brand called Luna Luxury Hair. Keep titles under 60 characters. Return just the titles, one per line.`;
          break;
        case 'description':
          prompt = `Write a compelling description (2-3 sentences) for content titled "${form.title}" for a luxury hair brand. Make it engaging and include relevant keywords for SEO.`;
          break;
        case 'content':
          prompt = `Write engaging content for a ${form.content_type === 'blog' ? 'blog post' : 'content piece'} titled "${form.title}" for Luna Luxury Hair. Include helpful tips, maintain a luxurious brand voice, and optimize for SEO. Keep it around 300 words.`;
          break;
      }

      const response = await supabase.functions.invoke('chat', {
        body: {
          messages: [{ role: 'user', content: prompt }]
        }
      });

      if (response.error) throw response.error;
      
      const text = response.data;
      
      if (field === 'title') {
        const titles = text.split('\n').filter((t: string) => t.trim());
        toast.success('AI generated title suggestions', {
          description: titles.slice(0, 3).join(' | ')
        });
        setForm({ ...form, title: titles[0]?.replace(/^\d+\.\s*/, '') || '' });
      } else if (field === 'description') {
        setForm({ ...form, description: text.trim() });
      } else {
        setForm({ ...form, content_body: text.trim() });
      }
      
      toast.success(`AI generated ${field} successfully!`);
    } catch (error) {
      console.error('AI generation error:', error);
      toast.error('Failed to generate content. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm({ ...form, tags: [...form.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setForm({ ...form, tags: form.tags.filter(t => t !== tag) });
  };

  const handleSubmit = async (publish: boolean = false) => {
    if (!form.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setLoading(true);
    const status = publish ? 'published' : 'draft';

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('published_content').insert({
        user_id: user.id,
        title: form.title,
        description: form.description,
        content_type: form.content_type,
        cover_image_url: form.cover_image_url || null,
        content_url: form.content_url || null,
        content_body: form.content_body || null,
        topic: form.topic || null,
        external_link: form.external_link || null,
        seo_score: seoAnalysis?.score || calculateBasicSEOScore(),
        meta_title: form.meta_title || null,
        meta_description: form.meta_description || null,
        tags: form.tags,
        status,
      });

      if (error) throw error;

      await logAdminActivity({
        actionType: 'content_created',
        actionDetails: { title: form.title, type: form.content_type, status }
      });

      toast.success(publish ? 'Content published successfully!' : 'Draft saved!');
      navigate('/admin');
    } catch (error: any) {
      console.error('Error saving content:', error);
      toast.error(error.message || 'Failed to save content');
    } finally {
      setLoading(false);
    }
  };

  const getSEOScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getSEOProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-5xl">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Publish Content</h1>
            <p className="text-muted-foreground">Create content for Featured Stories & Tutorials</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Content Type */}
                <div>
                  <Label>Content Type</Label>
                  <Tabs 
                    value={form.content_type} 
                    onValueChange={(v) => setForm({ ...form, content_type: v as ContentType })}
                    className="mt-2"
                  >
                    <TabsList className="grid grid-cols-3 w-full">
                      <TabsTrigger value="blog" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Blog Post
                      </TabsTrigger>
                      <TabsTrigger value="video" className="flex items-center gap-2">
                        <FileVideo className="h-4 w-4" />
                        Video
                      </TabsTrigger>
                      <TabsTrigger value="image" className="flex items-center gap-2">
                        <Image className="h-4 w-4" />
                        Image
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Title with AI */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label htmlFor="title">Title *</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => generateWithAI('title')}
                      disabled={aiLoading}
                    >
                      <Sparkles className="h-4 w-4 mr-1" />
                      Generate with AI
                    </Button>
                  </div>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Enter a catchy title"
                    maxLength={100}
                  />
                  <p className="text-xs text-muted-foreground mt-1">{form.title.length}/100 characters</p>
                </div>

                {/* Description with AI */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label htmlFor="description">Description</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => generateWithAI('description')}
                      disabled={aiLoading || !form.title}
                    >
                      <Sparkles className="h-4 w-4 mr-1" />
                      Generate with AI
                    </Button>
                  </div>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Brief description of your content"
                    rows={3}
                  />
                </div>

                {/* Topic */}
                <div>
                  <Label htmlFor="topic">Topic / Category</Label>
                  <Select
                    value={form.topic}
                    onValueChange={(v) => setForm({ ...form, topic: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a topic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bundles Collection">Bundles Collection</SelectItem>
                      <SelectItem value="Installation Guide">Installation Guide</SelectItem>
                      <SelectItem value="Styling Tips">Styling Tips</SelectItem>
                      <SelectItem value="Before & After">Before & After</SelectItem>
                      <SelectItem value="Maintenance Tips">Maintenance Tips</SelectItem>
                      <SelectItem value="How To">How To</SelectItem>
                      <SelectItem value="Behind the Scenes">Behind the Scenes</SelectItem>
                      <SelectItem value="Quick Style">Quick Style</SelectItem>
                      <SelectItem value="Product Showcase">Product Showcase</SelectItem>
                      <SelectItem value="Styling Tutorial">Styling Tutorial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Cover Image */}
                <div>
                  <Label htmlFor="cover_image">Cover Image URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="cover_image"
                      value={form.cover_image_url}
                      onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  {form.cover_image_url && (
                    <div className="mt-2 rounded-lg overflow-hidden border border-border">
                      <img 
                        src={form.cover_image_url} 
                        alt="Cover preview" 
                        className="w-full h-32 object-cover"
                        onError={(e) => e.currentTarget.style.display = 'none'}
                      />
                    </div>
                  )}
                </div>

                {/* Content URL (for videos) */}
                {form.content_type === 'video' && (
                  <div>
                    <Label htmlFor="content_url">Video URL</Label>
                    <Input
                      id="content_url"
                      value={form.content_url}
                      onChange={(e) => setForm({ ...form, content_url: e.target.value })}
                      placeholder="https://youtube.com/watch?v=... or Instagram reel URL"
                    />
                  </div>
                )}

                {/* Content Body with AI */}
                {form.content_type === 'blog' && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <Label htmlFor="content_body">Content Body</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => generateWithAI('content')}
                        disabled={aiLoading || !form.title}
                      >
                        <Sparkles className="h-4 w-4 mr-1" />
                        Generate with AI
                      </Button>
                    </div>
                    <Textarea
                      id="content_body"
                      value={form.content_body}
                      onChange={(e) => setForm({ ...form, content_body: e.target.value })}
                      placeholder="Write your blog content here..."
                      rows={10}
                      className="font-mono text-sm"
                    />
                  </div>
                )}

                {/* External Link */}
                <div>
                  <Label htmlFor="external_link">External Link (optional)</Label>
                  <Input
                    id="external_link"
                    value={form.external_link}
                    onChange={(e) => setForm({ ...form, external_link: e.target.value })}
                    placeholder="https://instagram.com/reel/..."
                  />
                </div>

                {/* Tags */}
                <div>
                  <Label>Tags</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Add a tag"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" variant="outline" onClick={addTag}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SEO Settings */}
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
                    placeholder="SEO-optimized title"
                    maxLength={60}
                  />
                  <p className="text-xs text-muted-foreground mt-1">{form.meta_title.length}/60 characters</p>
                </div>
                <div>
                  <Label htmlFor="meta_description">Meta Description</Label>
                  <Textarea
                    id="meta_description"
                    value={form.meta_description}
                    onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
                    placeholder="Brief description for search engines"
                    rows={3}
                    maxLength={160}
                  />
                  <p className="text-xs text-muted-foreground mt-1">{form.meta_description.length}/160 characters</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* SEO Score Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  SEO Strength
                </CardTitle>
                <CardDescription>AI-powered SEO analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {seoAnalysis ? (
                  <>
                    <div className="text-center">
                      <span className={`text-4xl font-bold ${getSEOScoreColor(seoAnalysis.score)}`}>
                        {seoAnalysis.score}
                      </span>
                      <span className="text-muted-foreground">/100</span>
                    </div>
                    <Progress 
                      value={seoAnalysis.score} 
                      className={`h-2 ${getSEOProgressColor(seoAnalysis.score)}`}
                    />
                    
                    {seoAnalysis.issues.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          Issues
                        </p>
                        <ul className="text-xs space-y-1 text-muted-foreground">
                          {seoAnalysis.issues.map((issue, i) => (
                            <li key={i}>• {issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {seoAnalysis.suggestions.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-green-500 flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          Suggestions
                        </p>
                        <ul className="text-xs space-y-1 text-muted-foreground">
                          {seoAnalysis.suggestions.map((sug, i) => (
                            <li key={i}>• {sug}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground text-center">
                    Click analyze to check SEO strength
                  </p>
                )}

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={analyzeSEO}
                  disabled={seoAnalyzing || !form.title}
                >
                  {seoAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Analyze SEO
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Publish Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Publish</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full"
                  onClick={() => handleSubmit(true)}
                  disabled={loading || !form.title}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  Publish Now
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleSubmit(false)}
                  disabled={loading || !form.title}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save as Draft
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => navigate('/admin')}
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ContentPublisher;
