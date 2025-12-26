import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ExternalLink, Loader2 } from "lucide-react";

const SHOPIFY_STORE_DOMAIN = "luna-hair-boutique-9dwzm.myshopify.com";

const Auth = () => {
  // Redirect to Shopify customer login
  const handleShopifyLogin = () => {
    window.open(`https://${SHOPIFY_STORE_DOMAIN}/account/login`, "_blank");
  };

  const handleShopifySignup = () => {
    window.open(`https://${SHOPIFY_STORE_DOMAIN}/account/register`, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-md">
          <div className="bg-card rounded-lg p-8 shadow-lg">
            <h1 className="text-3xl font-serif text-center mb-4">
              Customer Account
            </h1>
            <p className="text-muted-foreground text-center mb-8">
              Sign in to your Luna Luxury Hair account to track orders, manage your wishlist, and more.
            </p>

            <div className="space-y-4">
              <Button
                onClick={handleShopifyLogin}
                className="w-full"
                size="lg"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Sign In
              </Button>

              <Button
                onClick={handleShopifySignup}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Create Account
              </Button>
            </div>

            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground text-center">
                Your account is managed securely through our Shopify store.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;