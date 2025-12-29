import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Loader2, Copy, Check, Wand2, Palette, FileText, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  generateProductDescription,
  generateMarketingContent,
  generateSEOContent,
  analyzeContent,
  generateColorPalette,
} from '@/lib/gemini';

export default function AITools() {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState('');

  // Product Description Generator State
  const [productName, setProductName] = useState('');
  const [productFeatures, setProductFeatures] = useState('');

  // Marketing Content Generator State
  const [marketingTopic, setMarketingTopic] = useState('');
  const [marketingTone, setMarketingTone] = useState('professional');

  // SEO Content Generator State
  const [seoKeyword, setSeoKeyword] = useState('');
  const [contentType, setContentType] = useState('blog post');

  // Content Analyzer State
  const [contentToAnalyze, setContentToAnalyze] = useState('');

  // Color Palette Generator State
  const [colorDescription, setColorDescription] = useState('');

  useEffect(() => {
    loadApiKey();
  }, []);

  const loadApiKey = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data?.value?.gemini_api_key) {
        setApiKey(data.value.gemini_api_key);
      }
    } catch (error) {
      console.error('Error loading API key:', error);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleProductDescription = async () => {
    if (!productName.trim()) {
      toast.error('Please enter a product name');
      return;
    }

    setLoading(true);
    setResult('');

    const features = productFeatures
      .split(',')
      .map((f) => f.trim())
      .filter((f) => f);

    const response = await generateProductDescription(productName, features, apiKey);

    if (response.success && response.text) {
      setResult(response.text);
      toast.success('Product description generated!');
    } else {
      toast.error(response.error || 'Failed to generate description');
    }

    setLoading(false);
  };

  const handleMarketingContent = async () => {
    if (!marketingTopic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setLoading(true);
    setResult('');

    const response = await generateMarketingContent(marketingTopic, marketingTone, apiKey);

    if (response.success && response.text) {
      setResult(response.text);
      toast.success('Marketing content generated!');
    } else {
      toast.error(response.error || 'Failed to generate content');
    }

    setLoading(false);
  };

  const handleSEOContent = async () => {
    if (!seoKeyword.trim()) {
      toast.error('Please enter a keyword');
      return;
    }

    setLoading(true);
    setResult('');

    const response = await generateSEOContent(seoKeyword, contentType, apiKey);

    if (response.success && response.text) {
      setResult(response.text);
      toast.success('SEO content generated!');
    } else {
      toast.error(response.error || 'Failed to generate content');
    }

    setLoading(false);
  };

  const handleContentAnalysis = async () => {
    if (!contentToAnalyze.trim()) {
      toast.error('Please enter content to analyze');
      return;
    }

    setLoading(true);
    setResult('');

    const response = await analyzeContent(contentToAnalyze, apiKey);

    if (response.success && response.text) {
      setResult(response.text);
      toast.success('Content analyzed!');
    } else {
      toast.error(response.error || 'Failed to analyze content');
    }

    setLoading(false);
  };

  const handleColorPalette = async () => {
    if (!colorDescription.trim()) {
      toast.error('Please enter a description');
      return;
    }

    setLoading(true);
    setResult('');

    const response = await generateColorPalette(colorDescription, apiKey);

    if (response.success && response.text) {
      setResult(response.text);
      toast.success('Color palette generated!');
    } else {
      toast.error(response.error || 'Failed to generate palette');
    }

    setLoading(false);
  };

  if (!apiKey) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">AI Tools</h1>
            <p className="text-muted-foreground mt-2">
              AI-powered content generation using Gemini Pro
            </p>
          </div>

          <Card className="border-amber-500/50 bg-amber-500/5">
            <CardContent className="flex items-start gap-4 pt-6">
              <Sparkles className="h-6 w-6 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground">API Key Required</h3>
                <p className="text-muted-foreground mt-1">
                  To use AI tools, you need to add your Gemini API key in the Settings page.
                  Get your free API key from{' '}
                  <a
                    href="https://ai.google.dev/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Google AI Studio
                  </a>
                  .
                </p>
                <Button asChild className="mt-4">
                  <a href="/admin/settings">Go to Settings</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            AI Tools
          </h1>
          <p className="text-muted-foreground mt-2">
            AI-powered content generation using Gemini Pro (Free Model)
          </p>
        </div>

        <Tabs defaultValue="product" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="product">
              <Wand2 className="h-4 w-4 mr-2" />
              Product
            </TabsTrigger>
            <TabsTrigger value="marketing">
              <TrendingUp className="h-4 w-4 mr-2" />
              Marketing
            </TabsTrigger>
            <TabsTrigger value="seo">
              <FileText className="h-4 w-4 mr-2" />
              SEO
            </TabsTrigger>
            <TabsTrigger value="analyze">
              <FileText className="h-4 w-4 mr-2" />
              Analyze
            </TabsTrigger>
            <TabsTrigger value="colors">
              <Palette className="h-4 w-4 mr-2" />
              Colors
            </TabsTrigger>
          </TabsList>

          <TabsContent value="product" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Product Description Generator</CardTitle>
                <CardDescription>
                  Generate compelling product descriptions for your items
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="productName">Product Name</Label>
                  <Input
                    id="productName"
                    placeholder="e.g., Luxury Brazilian Hair Bundle"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productFeatures">Features (comma-separated)</Label>
                  <Input
                    id="productFeatures"
                    placeholder="e.g., 100% human hair, silky texture, long-lasting"
                    value={productFeatures}
                    onChange={(e) => setProductFeatures(e.target.value)}
                  />
                </div>
                <Button onClick={handleProductDescription} disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Description
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="marketing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Marketing Content Generator</CardTitle>
                <CardDescription>
                  Create engaging marketing content for social media and campaigns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="marketingTopic">Topic</Label>
                  <Input
                    id="marketingTopic"
                    placeholder="e.g., Summer Sale on Hair Extensions"
                    value={marketingTopic}
                    onChange={(e) => setMarketingTopic(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="marketingTone">Tone</Label>
                  <select
                    id="marketingTone"
                    value={marketingTone}
                    onChange={(e) => setMarketingTone(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="enthusiastic">Enthusiastic</option>
                    <option value="elegant">Elegant</option>
                  </select>
                </div>
                <Button onClick={handleMarketingContent} disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Content
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>SEO Content Generator</CardTitle>
                <CardDescription>
                  Create SEO-optimized content for better search rankings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="seoKeyword">Target Keyword</Label>
                  <Input
                    id="seoKeyword"
                    placeholder="e.g., luxury hair extensions"
                    value={seoKeyword}
                    onChange={(e) => setSeoKeyword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contentType">Content Type</Label>
                  <select
                    id="contentType"
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="blog post">Blog Post</option>
                    <option value="product page">Product Page</option>
                    <option value="landing page">Landing Page</option>
                    <option value="meta description">Meta Description</option>
                  </select>
                </div>
                <Button onClick={handleSEOContent} disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate SEO Content
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analyze" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Content Analyzer</CardTitle>
                <CardDescription>
                  Get AI-powered suggestions to improve your content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contentToAnalyze">Content to Analyze</Label>
                  <textarea
                    id="contentToAnalyze"
                    className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Paste your content here..."
                    value={contentToAnalyze}
                    onChange={(e) => setContentToAnalyze(e.target.value)}
                  />
                </div>
                <Button onClick={handleContentAnalysis} disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Analyze Content
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="colors" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Color Palette Generator</CardTitle>
                <CardDescription>
                  Generate beautiful color palettes based on your brand vision
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="colorDescription">Describe Your Vision</Label>
                  <textarea
                    id="colorDescription"
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="e.g., Elegant and luxurious with rose gold accents, modern and sophisticated"
                    value={colorDescription}
                    onChange={(e) => setColorDescription(e.target.value)}
                  />
                </div>
                <Button onClick={handleColorPalette} disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Palette className="mr-2 h-4 w-4" />
                      Generate Palette
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Generated Result
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md bg-muted p-4 whitespace-pre-wrap">{result}</div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
