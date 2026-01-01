import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Package, Loader2, DollarSign, Layers } from 'lucide-react';
import { fetchProducts, ShopifyProduct } from '@/lib/shopify';
import { toast } from 'sonner';

const AdminProductEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ShopifyProduct | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const products = await fetchProducts(100);
      const decodedId = decodeURIComponent(id!);
      const found = products.find(p => p.node.id === decodedId || p.node.id.includes(id!));
      if (found) {
        setProduct(found);
      } else {
        toast.error('Product not found');
        navigate('/manage/products');
      }
    } catch (error) {
      console.error('Failed to load product:', error);
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
  };

  const getShopifyProductId = () => {
    if (!product) return '';
    return product.node.id.split('/').pop() || product.node.id;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (!product) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Product not found</p>
          <Button variant="outline" onClick={() => navigate('/manage/products')} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const productNode = product.node;

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-5xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/manage/products')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{productNode.title}</h1>
              <p className="text-muted-foreground mt-1">{productNode.handle}</p>
            </div>
          </div>
          <Button asChild>
            <a 
              href={`https://admin.shopify.com/store/lunasstudio/products/${getShopifyProductId()}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Edit in Shopify
            </a>
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
              </CardHeader>
              <CardContent>
                {productNode.images.edges.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {productNode.images.edges.map((image, index) => (
                      <img
                        key={index}
                        src={image.node.url}
                        alt={image.node.altText || `${productNode.title} - Image ${index + 1}`}
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-12 bg-muted rounded-lg">
                    <Package className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                {productNode.description ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p>{productNode.description}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No description available</p>
                )}
              </CardContent>
            </Card>

            {/* Variants */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Variants ({productNode.variants.edges.length})
                </CardTitle>
                <CardDescription>
                  Product options and pricing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {productNode.variants.edges.map((variant, index) => (
                    <div 
                      key={variant.node.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{variant.node.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {variant.node.availableForSale ? 'In Stock' : 'Out of Stock'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatPrice(variant.node.price.amount)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle>Product Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Handle</span>
                  <span className="font-medium text-sm">{productNode.handle}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Variants</span>
                  <Badge variant="secondary">{productNode.variants.edges.length}</Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    Starting Price
                  </span>
                  <span className="font-semibold">
                    {formatPrice(productNode.priceRange.minVariantPrice.amount)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Options */}
            {productNode.options && productNode.options.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {productNode.options.map((option, index) => (
                    <div key={index}>
                      <p className="text-sm font-medium mb-2">{option.name}</p>
                      <div className="flex flex-wrap gap-2">
                        {option.values.map((value, vIndex) => (
                          <Badge key={vIndex} variant="outline">
                            {value}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full" asChild>
                  <a 
                    href={`https://admin.shopify.com/store/lunasstudio/products/${getShopifyProductId()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Edit in Shopify
                  </a>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <a href={`/product/${productNode.handle}`} target="_blank" rel="noopener noreferrer">
                    View on Store
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProductEditor;
