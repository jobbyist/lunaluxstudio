import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';

const AdminProductEditor = () => {
  const navigate = useNavigate();

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
            <h1 className="text-3xl font-bold">Product Editor</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Shopify Integration</CardTitle>
          </CardHeader>
          <CardContent className="py-8 text-center space-y-4">
            <p className="text-muted-foreground">
              Products are managed through your Shopify store. Use the Shopify admin to add, edit, or remove products.
            </p>
            <Button variant="outline" asChild>
              <a 
                href="https://admin.shopify.com" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Shopify Admin
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminProductEditor;
