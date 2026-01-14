import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Clock, ArrowRight, Home, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cartStore";

type PaymentStatus = "success" | "pending" | "cancelled" | "error";

const PaymentComplete = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCartStore();
  const [status, setStatus] = useState<PaymentStatus>("pending");
  
  // Parse Stitch callback parameters
  const paymentStatus = searchParams.get("status");
  const externalReference = searchParams.get("externalReference");
  const id = searchParams.get("id");

  useEffect(() => {
    // Determine payment status from URL params
    if (paymentStatus === "complete" || paymentStatus === "success") {
      setStatus("success");
      clearCart(); // Clear cart on successful payment
    } else if (paymentStatus === "cancelled" || paymentStatus === "cancel") {
      setStatus("cancelled");
    } else if (paymentStatus === "error" || paymentStatus === "failed") {
      setStatus("error");
    } else {
      // Default to success if we have a reference (payment completed)
      if (externalReference || id) {
        setStatus("success");
        clearCart();
      } else {
        setStatus("pending");
      }
    }
  }, [paymentStatus, externalReference, id, clearCart]);

  const statusConfig = {
    success: {
      icon: CheckCircle,
      title: "Payment Successful!",
      subtitle: "Thank you for your order",
      description: "Your payment has been processed and your custom wig order is now being prepared. You will receive a confirmation email shortly.",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    pending: {
      icon: Clock,
      title: "Processing Payment",
      subtitle: "Please wait",
      description: "Your payment is being processed. This may take a few moments. Please do not close this page.",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    cancelled: {
      icon: XCircle,
      title: "Payment Cancelled",
      subtitle: "No charges were made",
      description: "Your payment was cancelled. Your cart items are still saved if you'd like to try again.",
      color: "text-gray-500",
      bgColor: "bg-gray-500/10",
    },
    error: {
      icon: XCircle,
      title: "Payment Failed",
      subtitle: "Something went wrong",
      description: "There was an issue processing your payment. Please try again or contact support if the problem persists.",
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            {/* Status Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${config.bgColor} mb-8`}
            >
              <Icon className={`w-12 h-12 ${config.color}`} />
            </motion.div>

            {/* Title */}
            <h1 className="font-heading text-3xl md:text-4xl text-foreground mb-2">
              {config.title}
            </h1>
            <p className="text-muted-foreground text-lg mb-6">
              {config.subtitle}
            </p>

            {/* Description */}
            <p className="text-foreground/80 mb-8 max-w-md mx-auto">
              {config.description}
            </p>

            {/* Order Reference */}
            {externalReference && status === "success" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-card border border-border rounded-lg p-6 mb-8"
              >
                <p className="text-sm text-muted-foreground mb-1">Order Reference</p>
                <p className="font-mono text-lg font-medium text-foreground">
                  {externalReference}
                </p>
                <p className="text-sm text-muted-foreground mt-3">
                  Please save this reference for your records
                </p>
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                onClick={() => navigate("/")}
                variant="outline"
                className="gap-2"
              >
                <Home className="w-4 h-4" />
                Back to Home
              </Button>
              
              {status === "success" ? (
                <Button
                  onClick={() => navigate("/explore")}
                  className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Continue Shopping
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : status === "cancelled" || status === "error" ? (
                <Button
                  onClick={() => navigate("/customize")}
                  className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Try Again
                </Button>
              ) : null}
            </motion.div>

            {/* Support Contact */}
            {(status === "error" || status === "cancelled") && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-sm text-muted-foreground mt-8"
              >
                Need help? Contact us at{" "}
                <a
                  href="mailto:info@lunaluxhair.com"
                  className="text-primary hover:underline"
                >
                  info@lunaluxhair.com
                </a>
              </motion.p>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentComplete;
