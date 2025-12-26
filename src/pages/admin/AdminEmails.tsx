import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Mail, Shield } from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
import { useNavigate } from "react-router-dom";

interface AdminEmail {
  id: string;
  email: string;
  created_at: string;
}

const AdminEmails = () => {
  const [emails, setEmails] = useState<AdminEmail[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate("/admin-login");
    }
  }, [isAdmin, adminLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchEmails();
    }
  }, [isAdmin]);

  const fetchEmails = async () => {
    try {
      const { data, error } = await supabase
        .from("admin_emails")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEmails(data || []);
    } catch (error) {
      console.error("Error fetching admin emails:", error);
      toast.error("Failed to load admin emails");
    } finally {
      setLoading(false);
    }
  };

  const addEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    setAdding(true);
    try {
      const { error } = await supabase
        .from("admin_emails")
        .insert({ email: newEmail.toLowerCase().trim() });

      if (error) {
        if (error.code === "23505") {
          toast.error("This email is already an admin");
        } else {
          throw error;
        }
        return;
      }

      toast.success("Admin email added");
      setNewEmail("");
      fetchEmails();
    } catch (error) {
      console.error("Error adding admin email:", error);
      toast.error("Failed to add admin email");
    } finally {
      setAdding(false);
    }
  };

  const deleteEmail = async (id: string) => {
    setDeleting(id);
    try {
      const { error } = await supabase
        .from("admin_emails")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setEmails(prev => prev.filter(e => e.id !== id));
      toast.success("Admin email removed");
    } catch (error) {
      console.error("Error deleting admin email:", error);
      toast.error("Failed to remove admin email");
    } finally {
      setDeleting(null);
    }
  };

  if (adminLoading || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-serif">Admin Access</h1>
          <p className="text-muted-foreground mt-1">
            Manage which email addresses have admin access
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add Admin Email
            </CardTitle>
            <CardDescription>
              Users who sign up with these email addresses will automatically get admin access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={addEmail} className="flex gap-2">
              <Input
                type="email"
                placeholder="admin@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={adding}>
                {adding ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Authorized Admins
            </CardTitle>
            <CardDescription>
              {emails.length} email{emails.length !== 1 ? "s" : ""} with admin access
            </CardDescription>
          </CardHeader>
          <CardContent>
            {emails.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No admin emails configured yet</p>
                <p className="text-sm mt-1">Add an email above to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                {emails.map((email) => (
                  <div
                    key={email.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{email.email}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteEmail(email.id)}
                      disabled={deleting === email.id}
                    >
                      {deleting === email.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-destructive" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <h4 className="font-medium mb-2">How it works</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Add email addresses that should have admin access</li>
              <li>• When a user signs up with one of these emails, they automatically become an admin</li>
              <li>• Existing users need to sign up again after their email is added</li>
              <li>• Removing an email here does not revoke existing admin access</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminEmails;