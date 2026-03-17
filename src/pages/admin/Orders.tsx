import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Search, Loader2, ShoppingBag, RefreshCw, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface CmsOrder {
  id: string;
  order_number: string | null;
  customer_name: string | null;
  customer_email: string;
  customer_phone: string | null;
  items: any[];
  subtotal: number;
  discount_amount: number;
  shipping_cost: number;
  total: number;
  status: string;
  payment_status: string;
  payment_method: string | null;
  discount_code: string | null;
  notes: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: 'outline',
  processing: 'secondary',
  shipped: 'default',
  delivered: 'default',
  cancelled: 'destructive',
};

const AdminOrders = () => {
  const [orders, setOrders] = useState<CmsOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<CmsOrder | null>(null);

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('cms_orders').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setOrders((data || []) as CmsOrder[]);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase.from('cms_orders').update({ status }).eq('id', orderId);
      if (error) throw error;
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      toast.success('Order status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const filtered = searchQuery.trim()
    ? orders.filter(o => o.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) || o.customer_email.toLowerCase().includes(searchQuery.toLowerCase()) || o.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()))
    : orders;

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif">Orders</h1>
            <p className="text-muted-foreground mt-1">{orders.length} total orders</p>
          </div>
          <Button variant="outline" onClick={loadOrders} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['pending', 'processing', 'shipped', 'delivered'].map(status => (
            <Card key={status}>
              <CardContent className="pt-4 pb-4">
                <p className="text-sm text-muted-foreground capitalize">{status}</p>
                <p className="text-2xl font-bold">{orders.filter(o => o.status === status).length}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input placeholder="Search by order #, name, or email..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
        </div>

        <Card>
          <CardContent className="pt-6">
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No orders found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(order => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.order_number || order.id.slice(0, 8)}</TableCell>
                      <TableCell>
                        <p className="font-medium">{order.customer_name || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">{order.customer_email}</p>
                      </TableCell>
                      <TableCell>{formatPrice(order.total)}</TableCell>
                      <TableCell>
                        <Select value={order.status} onValueChange={v => updateOrderStatus(order.id, v)}>
                          <SelectTrigger className="w-[120px] h-8">
                            <Badge variant={(statusColors[order.status] || 'outline') as any}>{order.status}</Badge>
                          </SelectTrigger>
                          <SelectContent>
                            {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
                              <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell><Badge variant={order.payment_status === 'paid' ? 'default' : 'outline'}>{order.payment_status}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(order)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order {selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Customer:</span> {selectedOrder.customer_name}</div>
                <div><span className="text-muted-foreground">Email:</span> {selectedOrder.customer_email}</div>
                <div><span className="text-muted-foreground">Phone:</span> {selectedOrder.customer_phone || 'N/A'}</div>
                <div><span className="text-muted-foreground">Payment:</span> {selectedOrder.payment_method || 'N/A'}</div>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Items</h4>
                {Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 ? (
                  selectedOrder.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm py-1">
                      <span>{item.title || 'Product'} × {item.quantity || 1}</span>
                      <span>{formatPrice(item.price || 0)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No items</p>
                )}
              </div>
              <div className="border-t pt-4 space-y-1 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(selectedOrder.subtotal)}</span></div>
                {selectedOrder.discount_amount > 0 && <div className="flex justify-between text-green-600"><span>Discount ({selectedOrder.discount_code})</span><span>-{formatPrice(selectedOrder.discount_amount)}</span></div>}
                <div className="flex justify-between"><span>Shipping</span><span>{formatPrice(selectedOrder.shipping_cost)}</span></div>
                <div className="flex justify-between font-bold text-base"><span>Total</span><span>{formatPrice(selectedOrder.total)}</span></div>
              </div>
              {selectedOrder.notes && <div className="border-t pt-4"><h4 className="font-medium mb-1">Notes</h4><p className="text-sm text-muted-foreground">{selectedOrder.notes}</p></div>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminOrders;
