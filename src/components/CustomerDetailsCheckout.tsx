import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, MapPin, User, Mail, Phone, Truck } from "lucide-react";
import { toast } from "sonner";

interface CustomerDetailsCheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (details: CustomerDetails) => Promise<void>;
  totalAmount: string;
  isCustomWig?: boolean;
}

export interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
}

export const CustomerDetailsCheckout = ({
  isOpen,
  onClose,
  onSubmit,
  totalAmount,
  isCustomWig = false,
}: CustomerDetailsCheckoutProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CustomerDetails>({
    name: "",
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      province: "",
      postalCode: "",
      country: "South Africa",
    },
  });

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast.error("Please enter your full name");
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      toast.error("Please enter a valid email address");
      return false;
    }
    if (!formData.phone.trim()) {
      toast.error("Please enter your phone number");
      return false;
    }
    if (!formData.address.street.trim()) {
      toast.error("Please enter your street address");
      return false;
    }
    if (!formData.address.city.trim()) {
      toast.error("Please enter your city");
      return false;
    }
    if (!formData.address.province.trim()) {
      toast.error("Please enter your province");
      return false;
    }
    if (!formData.address.postalCode.trim()) {
      toast.error("Please enter your postal code");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Checkout failed:", error);
      toast.error("Failed to proceed to payment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    if (field.startsWith("address.")) {
      const addressField = field.replace("address.", "");
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [addressField]: value },
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-serif">
            <Truck className="w-5 h-5 text-primary" />
            Shipping Details
          </DialogTitle>
          <DialogDescription>
            Please provide your details to complete your order.
            {isCustomWig && <> Shipping is <strong className="text-primary">FREE</strong> for all custom wigs.</>}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4" />
              Personal Information
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="Jane Doe"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jane@example.com"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  Phone *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+27 82 123 4567"
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Shipping Address
            </h3>

            <div className="space-y-2">
              <Label htmlFor="street">Street Address *</Label>
              <Textarea
                id="street"
                placeholder="123 Main Street, Apartment 4B"
                value={formData.address.street}
                onChange={(e) => updateField("address.street", e.target.value)}
                rows={2}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="Johannesburg"
                  value={formData.address.city}
                  onChange={(e) => updateField("address.city", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="province">Province *</Label>
                <Input
                  id="province"
                  placeholder="Gauteng"
                  value={formData.address.province}
                  onChange={(e) => updateField("address.province", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code *</Label>
                <Input
                  id="postalCode"
                  placeholder="2000"
                  value={formData.address.postalCode}
                  onChange={(e) => updateField("address.postalCode", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.address.country}
                  onChange={(e) => updateField("address.country", e.target.value)}
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="pt-4 border-t bg-muted/30 rounded-lg p-4 -mx-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-muted-foreground">Order Total</span>
              <span className="text-xl font-bold text-primary">{totalAmount}</span>
            </div>
            {isCustomWig && (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <Truck className="w-4 h-4" />
                <span>Free shipping included</span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full btn-glow"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Proceed to Payment"
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            You'll be redirected to our secure payment provider to complete your order.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};
