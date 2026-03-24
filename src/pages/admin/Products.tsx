import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus, Search, MoreHorizontal, Pencil, Trash2, Loader2, Package, RefreshCw, Tag, Percent, DollarSign, Copy
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface CmsProduct {
  id: string;
  title: string;
  handle: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  currency_code: string;
  sku: string | null;
  inventory_quantity: number;
  category: string | null;
  tags: string[] | null;
  status: string;
  featured_image_url: string | null;
  additional_images: string[] | null;
  collection: string | null;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

interface CmsDiscount {
  id: string;
  code: string | null;
  title: string;
  discount_type: string;
  discount_value: number;
  min_order_amount: number | null;
  max_uses: number | null;
  uses_count: number;
  applies_to: string;
  applies_to_ids: string[] | null;
  is_active: boolean;
  starts_at: string | null;
  expires_at: string | null;
  created_at: string;
}

const emptyProduct: Partial<CmsProduct> = {
  title: '', handle: '', description: '', price: 0, compare_at_price: null,
  currency_code: 'ZAR', sku: '', inventory_quantity: 0, category: '',
  tags: [], status: 'active', featured_image_url: '', collection: '', is_featured: false,
};

const emptyDiscount: Partial<CmsDiscount> = {
  code: '', title: '', discount_type: 'percentage', discount_value: 0,
  min_order_amount: null, max_uses: null, applies_to: 'all', is_active: true,
};

const AdminProducts = () => {
  const [products, setProducts] = useState<CmsProduct[]>([]);
  const [discounts, setDiscounts] = useState<CmsDiscount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'product' | 'discount'; title: string } | null>(null);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [discountDialogOpen, setDiscountDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<CmsProduct>>(emptyProduct);
  const [editingDiscount, setEditingDiscount] = useState<Partial<CmsDiscount>>(emptyDiscount);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, discRes] = await Promise.all([
        supabase.from('cms_products').select('*').order('created_at', { ascending: false }),
        supabase.from('cms_discounts').select('*').order('created_at', { ascending: false }),
      ]);
      if (prodRes.error) throw prodRes.error;
      if (discRes.error) throw discRes.error;
      setProducts((prodRes.data || []) as CmsProduct[]);
      setDiscounts((discRes.data || []) as CmsDiscount[]);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = searchQuery.trim()
    ? products.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.handle?.toLowerCase().includes(searchQuery.toLowerCase()))
    : products;

  const generateHandle = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleSaveProduct = async () => {
    if (!editingProduct.title?.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      const data = {
        ...editingProduct,
        handle: editingProduct.handle || generateHandle(editingProduct.title),
        tags: editingProduct.tags && typeof editingProduct.tags === 'string'
          ? (editingProduct.tags as unknown as string).split(',').map((t: string) => t.trim())
          : editingProduct.tags || [],
      };

      if (editingProduct.id) {
        const { error } = await supabase.from('cms_products').update(data).eq('id', editingProduct.id);
        if (error) throw error;
        toast.success('Product updated');
      } else {
        const { error } = await supabase.from('cms_products').insert(data as any);
        if (error) throw error;
        toast.success('Product created');
      }
      setProductDialogOpen(false);
      setEditingProduct(emptyProduct);
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDiscount = async () => {
    if (!editingDiscount.title?.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      const data = {
        ...editingDiscount,
        code: editingDiscount.code || editingDiscount.title!.toUpperCase().replace(/\s+/g, ''),
      };

      if (editingDiscount.id) {
        const { error } = await supabase.from('cms_discounts').update(data).eq('id', editingDiscount.id);
        if (error) throw error;
        toast.success('Discount updated');
      } else {
        const { error } = await supabase.from('cms_discounts').insert(data as any);
        if (error) throw error;
        toast.success('Discount created');
      }
      setDiscountDialogOpen(false);
      setEditingDiscount(emptyDiscount);
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save discount');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      const table = itemToDelete.type === 'product' ? 'cms_products' : 'cms_discounts';
      const { error } = await supabase.from(table).delete().eq('id', itemToDelete.id);
      if (error) throw error;
      toast.success(`${itemToDelete.type === 'product' ? 'Product' : 'Discount'} deleted`);
      loadData();
    } catch (error) {
      toast.error('Failed to delete');
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif">Product Manager</h1>
            <p className="text-muted-foreground mt-1">Manage products and discounts</p>
          </div>
          <Button variant="outline" onClick={loadData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <Tabs defaultValue="products">
          <TabsList>
            <TabsTrigger value="products"><Package className="h-4 w-4 mr-2" />Products ({products.length})</TabsTrigger>
            <TabsTrigger value="discounts"><Tag className="h-4 w-4 mr-2" />Discounts ({discounts.length})</TabsTrigger>
          </TabsList>

          {/* PRODUCTS TAB */}
          <TabsContent value="products" className="space-y-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input placeholder="Search products..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
              <Button onClick={() => { setEditingProduct(emptyProduct); setProductDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />Add Product
              </Button>
            </div>

            <Card>
              <CardContent className="pt-6">
                {loading ? (
                  <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">{searchQuery ? 'No products match your search' : 'No products yet. Add your first product!'}</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[60px]">Image</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[80px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map(product => (
                        <TableRow key={product.id}>
                          <TableCell>
                            {product.featured_image_url ? (
                              <img src={product.featured_image_url} alt={product.title} className="w-10 h-10 object-cover rounded" />
                            ) : (
                              <div className="w-10 h-10 bg-muted rounded flex items-center justify-center"><Package className="h-5 w-5 text-muted-foreground" /></div>
                            )}
                          </TableCell>
                          <TableCell>
                            <p className="font-medium">{product.title}</p>
                            <p className="text-xs text-muted-foreground">{product.handle}</p>
                          </TableCell>
                          <TableCell>{formatPrice(product.price)}</TableCell>
                          <TableCell><Badge variant={product.inventory_quantity > 0 ? 'secondary' : 'destructive'}>{product.inventory_quantity}</Badge></TableCell>
                          <TableCell><Badge variant={product.status === 'active' ? 'default' : 'outline'}>{product.status}</Badge></TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => { setEditingProduct(product); setProductDialogOpen(true); }}><Pencil className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { setItemToDelete({ id: product.id, type: 'product', title: product.title }); setDeleteDialogOpen(true); }} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
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
          </TabsContent>

          {/* DISCOUNTS TAB */}
          <TabsContent value="discounts" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => { setEditingDiscount(emptyDiscount); setDiscountDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />Create Discount
              </Button>
            </div>

            <Card>
              <CardContent className="pt-6">
                {discounts.length === 0 ? (
                  <div className="text-center py-12">
                    <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No discounts yet</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Discount</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Uses</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[80px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {discounts.map(discount => (
                        <TableRow key={discount.id}>
                          <TableCell className="font-medium">{discount.title}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <code className="text-xs bg-muted px-2 py-1 rounded">{discount.code}</code>
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { navigator.clipboard.writeText(discount.code || ''); toast.success('Code copied'); }}>
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            {discount.discount_type === 'percentage' ? `${discount.discount_value}%` : formatPrice(discount.discount_value)}
                          </TableCell>
                          <TableCell>{discount.uses_count}{discount.max_uses ? `/${discount.max_uses}` : ''}</TableCell>
                          <TableCell><Badge variant={discount.is_active ? 'default' : 'outline'}>{discount.is_active ? 'Active' : 'Inactive'}</Badge></TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => { setEditingDiscount(discount); setDiscountDialogOpen(true); }}><Pencil className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { setItemToDelete({ id: discount.id, type: 'discount', title: discount.title }); setDeleteDialogOpen(true); }} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
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
          </TabsContent>
        </Tabs>
      </div>

      {/* PRODUCT DIALOG */}
      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct.id ? 'Edit Product' : 'Add Product'}</DialogTitle>
            <DialogDescription>Fill in the product details below.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input value={editingProduct.title || ''} onChange={e => setEditingProduct(p => ({ ...p, title: e.target.value, handle: p.handle || generateHandle(e.target.value) }))} />
              </div>
              <div className="space-y-2">
                <Label>Handle</Label>
                <Input value={editingProduct.handle || ''} onChange={e => setEditingProduct(p => ({ ...p, handle: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={editingProduct.description || ''} onChange={e => setEditingProduct(p => ({ ...p, description: e.target.value }))} rows={3} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Price (ZAR) *</Label>
                <Input type="number" value={editingProduct.price || 0} onChange={e => setEditingProduct(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))} />
              </div>
              <div className="space-y-2">
                <Label>Compare at Price</Label>
                <Input type="number" value={editingProduct.compare_at_price || ''} onChange={e => setEditingProduct(p => ({ ...p, compare_at_price: parseFloat(e.target.value) || null }))} />
              </div>
              <div className="space-y-2">
                <Label>Stock</Label>
                <Input type="number" value={editingProduct.inventory_quantity || 0} onChange={e => setEditingProduct(p => ({ ...p, inventory_quantity: parseInt(e.target.value) || 0 }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>SKU</Label>
                <Input value={editingProduct.sku || ''} onChange={e => setEditingProduct(p => ({ ...p, sku: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Collection</Label>
                <Select value={editingProduct.collection || ''} onValueChange={v => setEditingProduct(p => ({ ...p, collection: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select collection" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brazilian-virgin">Brazilian Virgin</SelectItem>
                    <SelectItem value="vietnamese-virgin">Vietnamese Virgin</SelectItem>
                    <SelectItem value="raw-vietnamese">Raw Vietnamese</SelectItem>
                    <SelectItem value="main-character">Main Character</SelectItem>
                    <SelectItem value="cafe-de-luna">Café De Luna</SelectItem>
                    <SelectItem value="premium-accessories">Premium Accessories</SelectItem>
                    <SelectItem value="bestsellers">Bestsellers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Input value={editingProduct.category || ''} onChange={e => setEditingProduct(p => ({ ...p, category: e.target.value }))} placeholder="e.g. Wigs, Bundles, Accessories" />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={editingProduct.status || 'active'} onValueChange={v => setEditingProduct(p => ({ ...p, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Featured Image URL</Label>
              <Input value={editingProduct.featured_image_url || ''} onChange={e => setEditingProduct(p => ({ ...p, featured_image_url: e.target.value }))} placeholder="https://..." />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={editingProduct.is_featured || false} onCheckedChange={v => setEditingProduct(p => ({ ...p, is_featured: v }))} />
              <Label>Featured on homepage</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProductDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveProduct} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingProduct.id ? 'Update' : 'Create'} Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DISCOUNT DIALOG */}
      <Dialog open={discountDialogOpen} onOpenChange={setDiscountDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingDiscount.id ? 'Edit Discount' : 'Create Discount'}</DialogTitle>
            <DialogDescription>Configure the discount details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input value={editingDiscount.title || ''} onChange={e => setEditingDiscount(d => ({ ...d, title: e.target.value }))} placeholder="e.g. Summer Sale 10% Off" />
            </div>
            <div className="space-y-2">
              <Label>Discount Code</Label>
              <Input value={editingDiscount.code || ''} onChange={e => setEditingDiscount(d => ({ ...d, code: e.target.value.toUpperCase() }))} placeholder="Auto-generated if empty" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={editingDiscount.discount_type || 'percentage'} onValueChange={v => setEditingDiscount(d => ({ ...d, discount_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage"><div className="flex items-center gap-2"><Percent className="h-4 w-4" />Percentage</div></SelectItem>
                    <SelectItem value="fixed"><div className="flex items-center gap-2"><DollarSign className="h-4 w-4" />Fixed Amount</div></SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Value</Label>
                <Input type="number" value={editingDiscount.discount_value || 0} onChange={e => setEditingDiscount(d => ({ ...d, discount_value: parseFloat(e.target.value) || 0 }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min Order Amount</Label>
                <Input type="number" value={editingDiscount.min_order_amount || ''} onChange={e => setEditingDiscount(d => ({ ...d, min_order_amount: parseFloat(e.target.value) || null }))} placeholder="No minimum" />
              </div>
              <div className="space-y-2">
                <Label>Max Uses</Label>
                <Input type="number" value={editingDiscount.max_uses || ''} onChange={e => setEditingDiscount(d => ({ ...d, max_uses: parseInt(e.target.value) || null }))} placeholder="Unlimited" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Applies To</Label>
              <Select value={editingDiscount.applies_to || 'all'} onValueChange={v => setEditingDiscount(d => ({ ...d, applies_to: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="collection">Specific Collection</SelectItem>
                  <SelectItem value="product">Specific Products</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={editingDiscount.is_active ?? true} onCheckedChange={v => setEditingDiscount(d => ({ ...d, is_active: v }))} />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDiscountDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveDiscount} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingDiscount.id ? 'Update' : 'Create'} Discount
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE DIALOG */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {itemToDelete?.type}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{itemToDelete?.title}"? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminProducts;
