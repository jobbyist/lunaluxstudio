import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Scissors, Search, RefreshCw, Eye, CheckCircle, Clock, AlertCircle, Package, CreditCard, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { PrintableOrderSheet } from "@/components/admin/PrintableOrderSheet";

interface CustomWigOrder {
  id: string;
  shopify_order_id: string;
  shopify_order_number: string | null;
  customer_email: string;
  customer_name: string | null;
  base_bundle: string;
  base_price: number;
  addon_cost: number;
  total_price: number;
  configuration: Record<string, string>;
  custom_sku: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  processed_at: string | null;
  payment_status: string | null;
  payment_link_id: string | null;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  processing: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="w-3 h-3" />,
  processing: <Package className="w-3 h-3" />,
  completed: <CheckCircle className="w-3 h-3" />,
  cancelled: <AlertCircle className="w-3 h-3" />,
};

export default function CustomWigOrders() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<CustomWigOrder | null>(null);
  const [notes, setNotes] = useState("");

  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ["custom-wig-orders", search, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("custom_wig_orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      if (search) {
        query = query.or(`customer_email.ilike.%${search}%,custom_sku.ilike.%${search}%,shopify_order_number.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CustomWigOrder[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const updates: Record<string, any> = { status };
      if (notes !== undefined) updates.notes = notes;
      if (status === "completed") updates.processed_at = new Date().toISOString();

      const { error } = await supabase
        .from("custom_wig_orders")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-wig-orders"] });
      toast.success("Order status updated");
      setSelectedOrder(null);
    },
    onError: (error) => {
      toast.error("Failed to update order: " + error.message);
    },
  });

  const sendPaymentLinkMutation = useMutation({
    mutationFn: async (order: CustomWigOrder) => {
      if (Number(order.addon_cost) <= 0) {
        throw new Error("No add-on cost to charge");
      }

      const { data, error } = await supabase.functions.invoke('create-addon-payment-link', {
        body: {
          orderId: order.id,
          amount: Math.round(Number(order.addon_cost) * 100), // Convert to cents
          customerEmail: order.customer_email,
          customerName: order.customer_name,
          orderReference: order.shopify_order_number || order.shopify_order_id,
          customSku: order.custom_sku,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-wig-orders"] });
      toast.success("Payment link sent to customer");
    },
    onError: (error) => {
      toast.error("Failed to send payment link: " + error.message);
    },
  });

  const handleStatusChange = (order: CustomWigOrder, newStatus: string) => {
    updateStatusMutation.mutate({ id: order.id, status: newStatus });
  };

  const handleSaveNotes = () => {
    if (!selectedOrder) return;
    updateStatusMutation.mutate({ id: selectedOrder.id, status: selectedOrder.status, notes });
  };

  const handleSendPaymentLink = (order: CustomWigOrder) => {
    sendPaymentLinkMutation.mutate(order);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(amount);
  };

  const stats = {
    total: orders?.length || 0,
    pending: orders?.filter(o => o.status === "pending").length || 0,
    processing: orders?.filter(o => o.status === "processing").length || 0,
    completed: orders?.filter(o => o.status === "completed").length || 0,
    totalRevenue: orders?.reduce((sum, o) => sum + Number(o.total_price), 0) || 0,
    totalAddons: orders?.reduce((sum, o) => sum + Number(o.addon_cost), 0) || 0,
    pendingAddonPayments: orders?.filter(o => Number(o.addon_cost) > 0 && o.payment_status !== 'paid').length || 0,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif">Custom Wig Orders</h1>
            <p className="text-muted-foreground">Manage custom wig orders and add-on pricing</p>
          </div>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Add-on Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">{formatCurrency(stats.totalAddons)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email, SKU, or order number..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scissors className="w-5 h-5" />
              Custom Wig Orders
            </CardTitle>
            <CardDescription>
              Orders with custom configurations and add-on pricing
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading orders...</div>
            ) : orders?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No custom wig orders found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Bundle</TableHead>
                      <TableHead className="text-right">Base Price</TableHead>
                      <TableHead className="text-right">Add-ons</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders?.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">#{order.shopify_order_number || order.shopify_order_id}</p>
                            {order.custom_sku && (
                              <p className="text-xs text-muted-foreground">{order.custom_sku}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.customer_name || "—"}</p>
                            <p className="text-xs text-muted-foreground">{order.customer_email}</p>
                          </div>
                        </TableCell>
                        <TableCell>{order.base_bundle}</TableCell>
                        <TableCell className="text-right">{formatCurrency(Number(order.base_price))}</TableCell>
                        <TableCell className="text-right">
                          {Number(order.addon_cost) > 0 ? (
                            <span className="text-primary font-medium">+{formatCurrency(Number(order.addon_cost))}</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(Number(order.total_price))}</TableCell>
                        <TableCell>
                          <Select
                            value={order.status}
                            onValueChange={(value) => handleStatusChange(order, value)}
                          >
                            <SelectTrigger className="w-[130px]">
                              <Badge className={`${statusColors[order.status]} flex items-center gap-1`}>
                                {statusIcons[order.status]}
                                {order.status}
                              </Badge>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="processing">Processing</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(order.created_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedOrder(order);
                              setNotes(order.notes || "");
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Detail Dialog */}
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Order #{selectedOrder?.shopify_order_number || selectedOrder?.shopify_order_id}
              </DialogTitle>
              <DialogDescription>
                Custom wig order details and configuration
              </DialogDescription>
            </DialogHeader>

            {selectedOrder && (
              <div className="space-y-6">
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <PrintableOrderSheet order={selectedOrder} />
                  
                  {Number(selectedOrder.addon_cost) > 0 && selectedOrder.payment_status !== 'paid' && (
                    <Button
                      onClick={() => handleSendPaymentLink(selectedOrder)}
                      variant="default"
                      size="sm"
                      disabled={sendPaymentLinkMutation.isPending}
                    >
                      {sendPaymentLinkMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      Send Payment Link ({formatCurrency(Number(selectedOrder.addon_cost))})
                    </Button>
                  )}
                  
                  {selectedOrder.payment_status === 'paid' && (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Add-ons Paid
                    </Badge>
                  )}
                  
                  {selectedOrder.payment_link_id && selectedOrder.payment_status !== 'paid' && (
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 flex items-center gap-1">
                      <CreditCard className="w-3 h-3" />
                      Payment Link Sent
                    </Badge>
                  )}
                </div>

                {/* Customer Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Customer</p>
                    <p className="font-medium">{selectedOrder.customer_name || "—"}</p>
                    <p className="text-sm">{selectedOrder.customer_email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">SKU</p>
                    <p className="font-mono font-medium">{selectedOrder.custom_sku || "—"}</p>
                  </div>
                </div>

                {/* Pricing Breakdown */}
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span>Base Bundle ({selectedOrder.base_bundle})</span>
                    <span>{formatCurrency(Number(selectedOrder.base_price))}</span>
                  </div>
                  {Number(selectedOrder.addon_cost) > 0 && (
                    <div className="flex justify-between text-primary">
                      <span>Add-on Customizations</span>
                      <span>+{formatCurrency(Number(selectedOrder.addon_cost))}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold pt-2 border-t">
                    <span>Total</span>
                    <span>{formatCurrency(Number(selectedOrder.total_price))}</span>
                  </div>
                  {Number(selectedOrder.addon_cost) > 0 && (
                    <div className="flex justify-between text-xs pt-2 border-t">
                      <span className="text-muted-foreground">Payment Status</span>
                      <span className={selectedOrder.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}>
                        {selectedOrder.payment_status === 'paid' ? 'Paid' : 
                         selectedOrder.payment_link_id ? 'Link Sent' : 'Pending'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Configuration */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Configuration</p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(selectedOrder.configuration).map(([key, value]) => (
                      <div key={key} className="p-2 bg-muted/50 rounded">
                        <p className="text-xs text-muted-foreground">{key}</p>
                        <p className="font-medium">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Internal Notes</p>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this order..."
                    rows={3}
                  />
                  <Button
                    onClick={handleSaveNotes}
                    className="mt-2"
                    size="sm"
                    disabled={updateStatusMutation.isPending}
                  >
                    Save Notes
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}