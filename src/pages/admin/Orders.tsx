import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ShoppingCart,
  Search,
  RefreshCw,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface CommerceOrderItem {
  product_id: string;
  title: string;
  slug: string;
  image: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
}

interface CommerceOrder {
  id: string;
  order_reference: string;
  customer_email: string;
  customer_name: string | null;
  customer_phone: string | null;
  items: CommerceOrderItem[];
  subtotal: number;
  total: number;
  currency: string;
  status: string;
  payment_method: string | null;
  payment_reference: string | null;
  shipping_address: Record<string, string> | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    icon: <Clock className="w-3 h-3" />,
  },
  paid: {
    label: "Paid",
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  failed: {
    label: "Failed",
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    icon: <XCircle className="w-3 h-3" />,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    icon: <AlertCircle className="w-3 h-3" />,
  },
};

export default function CommerceOrders() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<CommerceOrder | null>(null);

  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ["commerce-orders", search, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("commerce_orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      if (search.trim()) {
        query = query.or(
          `customer_email.ilike.%${search}%,order_reference.ilike.%${search}%,customer_name.ilike.%${search}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CommerceOrder[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: Record<string, unknown> = { status };
      if (status === "paid") {
        updates.paid_at = new Date().toISOString();
      }
      const { error } = await supabase
        .from("commerce_orders")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commerce-orders"] });
      toast.success("Order status updated");
      if (selectedOrder) {
        setSelectedOrder(null);
      }
    },
    onError: (error: Error) => {
      toast.error("Failed to update order: " + error.message);
    },
  });

  const formatCurrency = (amount: number, currency = "ZAR") => {
    return new Intl.NumberFormat("en-ZA", { style: "currency", currency }).format(amount);
  };

  const stats = {
    total: orders?.length || 0,
    pending: orders?.filter((o) => o.status === "pending").length || 0,
    paid: orders?.filter((o) => o.status === "paid").length || 0,
    failed: orders?.filter((o) => o.status === "failed").length || 0,
    revenue: orders
      ?.filter((o) => o.status === "paid")
      .reduce((sum, o) => sum + Number(o.total), 0) || 0,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Commerce Orders</h1>
            <p className="text-muted-foreground">Manage and track customer orders</p>
          </div>
          <Button onClick={() => refetch()} variant="outline" disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-5">
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
              <CardTitle className="text-sm font-medium text-muted-foreground">Paid</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">{formatCurrency(stats.revenue)}</p>
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
                  placeholder="Search by email, reference, or name..."
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
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : !orders || orders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {search || statusFilter !== "all"
                    ? "No orders match your search"
                    : "No orders yet"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => {
                      const config = statusConfig[order.status] || statusConfig.pending;
                      return (
                        <TableRow key={order.id}>
                          <TableCell>
                            <p className="font-mono text-sm font-medium">{order.order_reference}</p>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{order.customer_name || "—"}</p>
                              <p className="text-sm text-muted-foreground">{order.customer_email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {Array.isArray(order.items) ? order.items.length : 0} item
                              {Array.isArray(order.items) && order.items.length !== 1 ? "s" : ""}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(Number(order.total), order.currency)}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
                            >
                              {config.icon}
                              {config.label}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(order.created_at), "dd MMM yyyy")}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Reference: <span className="font-mono">{selectedOrder?.order_reference}</span>
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Customer</p>
                  <p className="font-medium">{selectedOrder.customer_name || "—"}</p>
                  <p>{selectedOrder.customer_email}</p>
                  {selectedOrder.customer_phone && <p>{selectedOrder.customer_phone}</p>}
                </div>
                <div>
                  <p className="text-muted-foreground">Order Date</p>
                  <p className="font-medium">
                    {format(new Date(selectedOrder.created_at), "dd MMM yyyy HH:mm")}
                  </p>
                  {selectedOrder.paid_at && (
                    <>
                      <p className="text-muted-foreground mt-1">Paid</p>
                      <p className="font-medium text-green-600">
                        {format(new Date(selectedOrder.paid_at), "dd MMM yyyy HH:mm")}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.shipping_address && (
                <div className="text-sm">
                  <p className="text-muted-foreground mb-1">Shipping Address</p>
                  <p>{selectedOrder.shipping_address.street}</p>
                  <p>
                    {selectedOrder.shipping_address.city},{" "}
                    {selectedOrder.shipping_address.province}{" "}
                    {selectedOrder.shipping_address.postal_code}
                  </p>
                  <p>{selectedOrder.shipping_address.country}</p>
                </div>
              )}

              {/* Items */}
              <div>
                <p className="text-muted-foreground text-sm mb-2">Items</p>
                <div className="border rounded-lg divide-y">
                  {Array.isArray(selectedOrder.items) &&
                    selectedOrder.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-3">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-10 h-10 object-cover rounded"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(item.unit_price, selectedOrder.currency)} × {item.quantity}
                          </p>
                        </div>
                        <p className="font-semibold text-sm">
                          {formatCurrency(item.line_total, selectedOrder.currency)}
                        </p>
                      </div>
                    ))}
                </div>
                <div className="flex justify-end mt-2 text-sm font-bold">
                  Total: {formatCurrency(Number(selectedOrder.total), selectedOrder.currency)}
                </div>
              </div>

              {/* Payment Info */}
              {(selectedOrder.payment_method || selectedOrder.payment_reference) && (
                <div className="text-sm">
                  <p className="text-muted-foreground mb-1">Payment</p>
                  {selectedOrder.payment_method && (
                    <p>
                      Method: <span className="font-medium">{selectedOrder.payment_method}</span>
                    </p>
                  )}
                  {selectedOrder.payment_reference && (
                    <p className="font-mono text-xs">Ref: {selectedOrder.payment_reference}</p>
                  )}
                </div>
              )}

              {/* Status Update */}
              <div className="flex items-center gap-3 pt-2 border-t">
                <p className="text-sm text-muted-foreground">Update status:</p>
                <Select
                  value={selectedOrder.status}
                  onValueChange={(status) =>
                    updateStatusMutation.mutate({ id: selectedOrder.id, status })
                  }
                  disabled={updateStatusMutation.isPending}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
