import React, { useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, Wand2, Layout, Palette, Type, Image } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface SuggestionItem {
  type: 'layout' | 'color' | 'content' | 'image';
  title: string;
  description: string;
  preview?: string;
}

export default function AISiteManager() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [response, setResponse] = useState('');

  const examplePrompts = [
    "Make the homepage more modern with a dark theme",
    "Add a promotional banner for a 20% off sale",
    "Suggest color changes for a more luxurious feel",
    "Create a new section for customer testimonials",
    "Update the hero section with seasonal content",
  ];

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setLoading(true);
    setSuggestions([]);
    setResponse('');

    try {
      const { data, error } = await supabase.functions.invoke('ai-content-edit', {
        body: { 
          prompt: `You are a website design and content assistant for Luna Luxury Hair, a premium hair extensions and beauty brand. 
          
The user wants to make changes to their website. Based on their request, provide specific, actionable suggestions.

User request: "${prompt}"

Provide a detailed response with:
1. What changes you recommend
2. Specific implementation steps
3. Any design considerations

Format your response in a clear, organized way.`,
          type: 'site-suggestions'
        }
      });

      if (error) throw error;

      setResponse(data.text || data.result || 'AI suggestions generated successfully.');
      
      // Parse suggestions from the response
      const parsedSuggestions: SuggestionItem[] = [];
      
      if (prompt.toLowerCase().includes('color') || prompt.toLowerCase().includes('theme')) {
        parsedSuggestions.push({
          type: 'color',
          title: 'Color Scheme Update',
          description: 'Apply suggested color changes to the design system',
        });
      }
      
      if (prompt.toLowerCase().includes('layout') || prompt.toLowerCase().includes('section')) {
        parsedSuggestions.push({
          type: 'layout',
          title: 'Layout Modification',
          description: 'Update page structure based on suggestions',
        });
      }
      
      if (prompt.toLowerCase().includes('content') || prompt.toLowerCase().includes('text') || prompt.toLowerCase().includes('banner')) {
        parsedSuggestions.push({
          type: 'content',
          title: 'Content Update',
          description: 'Modify text and messaging on the site',
        });
      }

      setSuggestions(parsedSuggestions);
      toast.success('AI suggestions generated!');
    } catch (error: any) {
      console.error('AI Site Manager error:', error);
      toast.error(error.message || 'Failed to generate suggestions');
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'layout': return <Layout className="h-4 w-4" />;
      case 'color': return <Palette className="h-4 w-4" />;
      case 'content': return <Type className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      default: return <Wand2 className="h-4 w-4" />;
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'layout': return 'default';
      case 'color': return 'secondary';
      case 'content': return 'outline';
      default: return 'default';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            AI Site Manager
          </h1>
          <p className="text-muted-foreground mt-2">
            Use AI to suggest and implement changes to your website
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle>What would you like to change?</CardTitle>
              <CardDescription>
                Describe the changes you want to make to your website and AI will provide suggestions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="e.g., Make the hero section more eye-catching with a seasonal promotion..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[150px]"
              />
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Try these examples:</p>
                <div className="flex flex-wrap gap-2">
                  {examplePrompts.map((example, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer hover:bg-muted transition-colors"
                      onClick={() => setPrompt(example)}
                    >
                      {example}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleSubmit} 
                disabled={loading || !prompt.trim()} 
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating suggestions...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Get AI Suggestions
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common site modifications you can make
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                <Button 
                  variant="outline" 
                  className="justify-start h-auto py-3"
                  onClick={() => setPrompt('Update the homepage hero section with a new promotional message')}
                >
                  <Layout className="mr-3 h-5 w-5 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">Update Hero Section</p>
                    <p className="text-xs text-muted-foreground">Modify the main banner content</p>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="justify-start h-auto py-3"
                  onClick={() => setPrompt('Suggest a new color scheme that feels more luxurious and modern')}
                >
                  <Palette className="mr-3 h-5 w-5 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">Change Color Theme</p>
                    <p className="text-xs text-muted-foreground">Get color palette suggestions</p>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="justify-start h-auto py-3"
                  onClick={() => setPrompt('Create compelling product category descriptions for hair bundles and wigs')}
                >
                  <Type className="mr-3 h-5 w-5 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">Generate Content</p>
                    <p className="text-xs text-muted-foreground">Create text for pages and sections</p>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="justify-start h-auto py-3"
                  onClick={() => setPrompt('Add a featured products section to showcase bestsellers')}
                >
                  <Wand2 className="mr-3 h-5 w-5 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">Add New Section</p>
                    <p className="text-xs text-muted-foreground">Suggest new page components</p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        {(response || suggestions.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle>AI Suggestions</CardTitle>
              <CardDescription>
                Based on your request, here are the recommended changes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {suggestions.map((suggestion, index) => (
                    <Badge key={index} variant={getTypeBadgeVariant(suggestion.type) as any}>
                      {getTypeIcon(suggestion.type)}
                      <span className="ml-1">{suggestion.title}</span>
                    </Badge>
                  ))}
                </div>
              )}
              
              {response && (
                <div className="bg-muted/50 rounded-lg p-4 prose prose-sm dark:prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-sm font-sans">{response}</pre>
                </div>
              )}
              
              <div className="flex gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => navigator.clipboard.writeText(response)}>
                  Copy Response
                </Button>
                <Button variant="outline" onClick={() => { setPrompt(''); setResponse(''); setSuggestions([]); }}>
                  Start New Request
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
