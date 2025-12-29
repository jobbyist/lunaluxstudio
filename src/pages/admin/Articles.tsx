import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, MoreHorizontal, Pencil, Trash2, Eye, FileText, FileVideo, Image, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { logAdminActivity } from '@/hooks/useActivityLogger';
import { format } from 'date-fns';

interface PublishedContent {
  id: string;
  title: string;
  description: string | null;
  content_type: string;
  cover_image_url: string | null;
  status: string;
  seo_score: number | null;
  created_at: string;
  topic: string | null;
}

const Articles = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState<PublishedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<PublishedContent | null>(null);

  const fetchContent = async () => {
    const { data, error } = await supabase.from('published_content').select('*').order('created_at', { ascending: false });
    if (!error) setContent(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchContent(); }, []);

  const handleDelete = async () => {
    if (!contentToDelete) return;
    const { error } = await supabase.from('published_content').delete().eq('id', contentToDelete.id);
    if (!error) {
      await logAdminActivity({ actionType: 'content_deleted', actionDetails: { title: contentToDelete.title } });
      toast.success('Content deleted');
      fetchContent();
    }
    setDeleteDialogOpen(false);
  };

  const toggleStatus = async (item: PublishedContent) => {
    const newStatus = item.status === 'published' ? 'draft' : 'published';
    await supabase.from('published_content').update({ status: newStatus }).eq('id', item.id);
    toast.success(`Content ${newStatus}`);
    fetchContent();
  };

  const getIcon = (type: string) => type === 'video' ? <FileVideo className="h-4 w-4" /> : type === 'image' ? <Image className="h-4 w-4" /> : <FileText className="h-4 w-4" />;
  const filtered = content.filter(i => i.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div><h1 className="text-3xl font-bold">Content Manager</h1><p className="text-muted-foreground">Manage published content</p></div>
          <Button onClick={() => navigate('/admin/publish')}><Plus className="h-4 w-4 mr-2" />New Content</Button>
        </div>
        <Card>
          <CardHeader>
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" /></div>
          </CardHeader>
          <CardContent>
            {loading ? <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div> : filtered.length === 0 ? <div className="text-center py-12"><FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">No content found</p></div> : (
              <Table>
                <TableHeader><TableRow><TableHead>Content</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead>SEO</TableHead><TableHead>Date</TableHead><TableHead></TableHead></TableRow></TableHeader>
                <TableBody>
                  {filtered.map(item => (
                    <TableRow key={item.id}>
                      <TableCell><div className="flex items-center gap-3">{item.cover_image_url && <img src={item.cover_image_url} alt="" className="w-10 h-10 rounded object-cover" />}<span className="font-medium">{item.title}</span></div></TableCell>
                      <TableCell><div className="flex items-center gap-2 capitalize">{getIcon(item.content_type)}{item.content_type}</div></TableCell>
                      <TableCell><Badge className={item.status === 'published' ? 'bg-green-500/20 text-green-500' : ''}>{item.status}</Badge></TableCell>
                      <TableCell>{item.seo_score ?? '-'}/100</TableCell>
                      <TableCell className="text-muted-foreground">{format(new Date(item.created_at), 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/admin/publish/${item.id}`)}><Pencil className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleStatus(item)}><Eye className="h-4 w-4 mr-2" />{item.status === 'published' ? 'Unpublish' : 'Publish'}</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => { setContentToDelete(item); setDeleteDialogOpen(true); }}><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Content</AlertDialogTitle><AlertDialogDescription>Are you sure? This cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default Articles;