import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Package, Truck, CheckCircle, XCircle, Clock, Search, Download } from 'lucide-react';
import { format } from 'date-fns';

interface Order {
  id: string;
  snipcart_order_id: string;
  snipcart_invoice_number: string;
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  total_amount: number;
  currency: string;
  payment_status: string;
  fulfillment_status: string;
  created_at: string;
  tracking_number?: string;
  shipping_carrier?: string;
  items: any[];
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('fulfillment_status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateFulfillmentStatus = async (orderId: string, status: string) => {
    try {
      const updates: any = { 
        fulfillment_status: status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'shipped') {
        updates.shipped_at = new Date().toISOString();
      } else if (status === 'delivered') {
        updates.delivered_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId);

      if (error) throw error;

      toast.success('Order status updated');
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, fulfillment_status: status });
      }
    } catch (error: any) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order status');
    }
  };

  const addTrackingInfo = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          tracking_number: trackingNumber,
          tracking_url: trackingUrl || null,
          shipped_at: new Date().toISOString(),
          fulfillment_status: 'shipped',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (error) throw error;

      toast.success('Tracking information added');
      setTrackingNumber('');
      setTrackingUrl('');
      fetchOrders();
      setSelectedOrder(null);
    } catch (error: any) {
      console.error('Error adding tracking:', error);
      toast.error('Failed to add tracking information');
    }
  };

  const exportToCSV = () => {
    const filteredOrders = orders.filter(order => {
      const matchesSearch = 
        order.customer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.snipcart_invoice_number?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });

    const csv = [
      ['Order ID', 'Invoice #', 'Customer', 'Email', 'Total', 'Status', 'Date'].join(','),
      ...filteredOrders.map(order => [
        order.snipcart_order_id,
        order.snipcart_invoice_number,
        order.customer_name,
        order.customer_email,
        `${order.currency} ${order.total_amount}`,
        order.fulfillment_status,
        format(new Date(order.created_at), 'yyyy-MM-dd HH:mm')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unfulfilled': return 'bg-yellow-500';
      case 'processing': return 'bg-blue-500';
      case 'shipped': return 'bg-purple-500';
      case 'delivered': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'unfulfilled': return <Clock className="h-4 w-4" />;
      case 'processing': return <Package className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.snipcart_invoice_number?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Order Management</h1>
          <p className="text-muted-foreground">Manage and track all customer orders</p>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="search">Search Orders</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="search"
                  placeholder="Search by email, name, or invoice #"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Fulfillment Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="unfulfilled">Unfulfilled</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {loading ? (
          <Card>
            <CardContent className="py-8 text-center">
              Loading orders...
            </CardContent>
          </Card>
        ) : filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              No orders found
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedOrder(order)}>
              <CardContent className="py-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                  <div>
                    <p className="font-semibold">{order.snipcart_invoice_number || order.snipcart_order_id.substring(0, 8)}</p>
                    <p className="text-sm text-muted-foreground">{format(new Date(order.created_at), 'MMM dd, yyyy')}</p>
                  </div>
                  <div>
                    <p className="font-medium">{order.customer_name || 'Unknown'}</p>
                    <p className="text-sm text-muted-foreground">{order.customer_email}</p>
                  </div>
                  <div>
                    <p className="font-semibold">{order.currency} {order.total_amount.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">{order.items?.length || 0} items</p>
                  </div>
                  <div>
                    <Badge className={getStatusColor(order.fulfillment_status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(order.fulfillment_status)}
                        {order.fulfillment_status}
                      </span>
                    </Badge>
                  </div>
                  <div className="text-right">
                    {order.tracking_number && (
                      <p className="text-sm text-muted-foreground">Track: {order.tracking_number}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Invoice #{selectedOrder?.snipcart_invoice_number || 'N/A'}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Customer</Label>
                  <p className="font-medium">{selectedOrder.customer_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.customer_email}</p>
                  {selectedOrder.customer_phone && (
                    <p className="text-sm text-muted-foreground">{selectedOrder.customer_phone}</p>
                  )}
                </div>
                <div>
                  <Label>Order Date</Label>
                  <p>{format(new Date(selectedOrder.created_at), 'PPpp')}</p>
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Order Items</Label>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                      <div className="flex items-center gap-3">
                        {item.image && <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />}
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-semibold">{selectedOrder.currency} {(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{selectedOrder.currency} {(selectedOrder.subtotal || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{selectedOrder.currency} {(selectedOrder.shipping_cost || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>{selectedOrder.currency} {(selectedOrder.tax_amount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total</span>
                    <span>{selectedOrder.currency} {selectedOrder.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Fulfillment Status</Label>
                <Select 
                  value={selectedOrder.fulfillment_status} 
                  onValueChange={(value) => updateFulfillmentStatus(selectedOrder.id, value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unfulfilled">Unfulfilled</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label>Tracking Information</Label>
                {selectedOrder.tracking_number ? (
                  <div className="p-4 bg-secondary rounded-lg">
                    <p className="font-medium">Tracking Number: {selectedOrder.tracking_number}</p>
                    {selectedOrder.tracking_url && (
                      <a href={selectedOrder.tracking_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                        Track Package
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Input
                      placeholder="Tracking number"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                    />
                    <Input
                      placeholder="Tracking URL (optional)"
                      value={trackingUrl}
                      onChange={(e) => setTrackingUrl(e.target.value)}
                    />
                    <Button onClick={() => addTrackingInfo(selectedOrder.id)} disabled={!trackingNumber}>
                      Add Tracking Info
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
