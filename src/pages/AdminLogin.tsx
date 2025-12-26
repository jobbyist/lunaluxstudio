import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Loader2, Shield, ArrowLeft } from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";

type AuthMode = 'login' | 'signup' | 'reset' | 'reset-sent';

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [rememberMe, setRememberMe] = useState(true);
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdmin();

  useEffect(() => {
    if (!adminLoading && isAdmin) {
      navigate("/admin");
    }
  }, [isAdmin, adminLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (authMode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/admin-login`,
          },
        });
        
        if (error) throw error;
        toast.success("Account created! You can now sign in.");
        setAuthMode('login');
      } else if (authMode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/admin-login`,
        });
        
        if (error) throw error;
        setAuthMode('reset-sent');
        toast.success("Password reset email sent!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        // Handle session persistence based on remember me
        if (!rememberMe) {
          // Session will be cleared when browser closes
          sessionStorage.setItem('admin_session_temp', 'true');
        }
        
        toast.success("Checking admin access...");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const renderResetSentContent = () => (
    <div className="text-center space-y-4">
      <div className="bg-primary/10 p-4 rounded-lg">
        <p className="text-foreground">
          We've sent a password reset link to <strong>{email}</strong>
        </p>
      </div>
      <p className="text-muted-foreground text-sm">
        Check your email and follow the instructions to reset your password.
      </p>
      <Button
        variant="outline"
        onClick={() => setAuthMode('login')}
        className="w-full"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Login
      </Button>
    </div>
  );

  const getTitle = () => {
    switch (authMode) {
      case 'signup': return "Admin Sign Up";
      case 'reset': return "Reset Password";
      case 'reset-sent': return "Check Your Email";
      default: return "Admin Login";
    }
  };

  const getSubtitle = () => {
    switch (authMode) {
      case 'signup': return "Create your admin account";
      case 'reset': return "Enter your email to receive a reset link";
      case 'reset-sent': return "Password reset instructions sent";
      default: return "Access restricted to authorized administrators only";
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg p-8 shadow-lg border border-border">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-primary/10 p-3 rounded-full">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          
          <h1 className="text-2xl font-serif text-center mb-2">
            {getTitle()}
          </h1>
          <p className="text-muted-foreground text-center mb-8 text-sm">
            {getSubtitle()}
          </p>

          {authMode === 'reset-sent' ? (
            renderResetSentContent()
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1"
                  placeholder="admin@example.com"
                />
              </div>

              {authMode !== 'reset' && (
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="mt-1"
                    placeholder="••••••••"
                    minLength={6}
                  />
                </div>
              )}

              {authMode === 'login' && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked === true)}
                    />
                    <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                      Remember me
                    </Label>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAuthMode('reset')}
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {authMode === 'signup' ? "Creating account..." : 
                     authMode === 'reset' ? "Sending reset link..." : "Signing in..."}
                  </>
                ) : (
                  authMode === 'signup' ? "Create Account" : 
                  authMode === 'reset' ? "Send Reset Link" : "Sign In"
                )}
              </Button>
            </form>
          )}

          {authMode !== 'reset-sent' && (
            <div className="mt-6 text-center space-y-3">
              {authMode === 'reset' ? (
                <button
                  onClick={() => setAuthMode('login')}
                  className="text-sm text-primary hover:underline"
                >
                  <ArrowLeft className="inline mr-1 h-3 w-3" />
                  Back to login
                </button>
              ) : (
                <button
                  onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                  className="text-sm text-primary hover:underline"
                >
                  {authMode === 'signup' 
                    ? "Already have an account? Sign in" 
                    : "Need an account? Sign up"}
                </button>
              )}
              <div>
                <a
                  href="/"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Back to store
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;