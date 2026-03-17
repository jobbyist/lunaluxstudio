import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface LegalDialogProps {
  title: string;
  content: React.ReactNode;
  children: React.ReactNode;
}

export const LegalDialog = ({ title, content, children }: LegalDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-muted-foreground hover:text-foreground transition-colors text-sm">
          {children}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">{title}</DialogTitle>
        </DialogHeader>
        <div className="prose prose-sm dark:prose-invert mt-4">
          {content}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const TermsContent = () => (
  <div className="space-y-4 text-foreground">
    <h3 className="font-semibold">Terms of Service</h3>
    <p>By accessing and using Luna Luxury Hair's website and services, you agree to be bound by these Terms of Service.</p>
    
    <h4 className="font-semibold mt-4">Product Information</h4>
    <p>All products are made from premium quality hair. Colors and textures may vary slightly from images shown.</p>
    
    <h4 className="font-semibold mt-4">Orders and Payments</h4>
    <p>All orders are subject to availability. Payment must be received before items are dispatched.</p>
    
    <h4 className="font-semibold mt-4">Intellectual Property</h4>
    <p>All content on this website is the property of Luna Luxury Hair and protected by copyright law.</p>
  </div>
);

export const PrivacyContent = () => (
  <div className="space-y-4 text-foreground">
    <h3 className="font-semibold">Privacy Policy</h3>
    <p>Luna Luxury Hair is committed to protecting your privacy and personal information.</p>
    
    <h4 className="font-semibold mt-4">Information We Collect</h4>
    <p>We collect information you provide when creating an account, placing orders, or contacting us.</p>
    
    <h4 className="font-semibold mt-4">How We Use Your Information</h4>
    <p>Your information is used to process orders, improve our services, and communicate with you about your purchases.</p>
    
    <h4 className="font-semibold mt-4">Data Security</h4>
    <p>We implement security measures to protect your personal information.</p>
  </div>
);

export const RefundsContent = () => (
  <div className="space-y-4 text-foreground">
    <h3 className="font-semibold">Return & Exchange Policy</h3>
    <p>We want you to be completely satisfied with your purchase. Please review our return and exchange guidelines below.</p>
    
    <h4 className="font-semibold mt-4">Return/Exchange Window</h4>
    <p>You have 7 days after receiving your item to request a return or exchange. Items must be unused, in their original condition, with tags attached and in original packaging.</p>
    
    <h4 className="font-semibold mt-4">Exceptions - Non-Refundable Items</h4>
    <ul className="list-disc list-inside space-y-1">
      <li>Hair extensions are final sale and cannot be returned or exchanged</li>
      <li>Sale or discounted items are non-refundable</li>
    </ul>
    
    <h4 className="font-semibold mt-4">Exchange Shipping</h4>
    <p>The shipping fee for exchanges is the responsibility of the customer and will depend on the shipping method selected during checkout.</p>
    
    <h4 className="font-semibold mt-4">How to Initiate a Return/Exchange</h4>
    <p>To start a return or exchange, please contact us at info@lunaluxhair.com with your order details. Items sent back without prior authorization will not be accepted.</p>
    
    <h4 className="font-semibold mt-4">Damages and Issues</h4>
    <p>Please inspect your order upon reception and contact us immediately if the item is defective, damaged, or if you received the wrong item.</p>
    
    <h4 className="font-semibold mt-4">Refund Processing</h4>
    <p>Once we receive and inspect your return, we'll notify you of the approval status. Approved refunds will be processed to your original payment method within 5-10 business days.</p>
  </div>
);

export const ShippingContent = () => (
  <div className="space-y-4 text-foreground">
    <h3 className="font-semibold">Shipping Information</h3>
    <p>Please note that some items in our catalog are ready to ship immediately whilst some are made to order. Therefore it may take between 7-14 business days to ship your order depending on availability, your location and other factors beyond our control. We will make every effort to ensure that your order arrives within a reasonable timeframe and will keep you updated every step of the way regarding the status of your shipment.</p>
    
    <p>Wigs that are listed as "on sale" or discounted/clearance items are NOT customised unless stated otherwise.</p>
    
    <h4 className="font-semibold mt-4">Customisation</h4>
    <p>To request customisation, please send us an email, message us on WhatsApp or give us a call at 012 880 6563 on weekdays between 10AM - 3PM (South African Time).</p>
    
    <h4 className="font-semibold mt-4">Shipping Costs</h4>
    <p>Countrywide shipping is R150. We use The Courier Guy as our preferred courier service.</p>
    
    <p>Shipping rates will be calculated at checkout based on your location and the estimated weight of your package.</p>
    
    <h4 className="font-semibold mt-4">International Shipping</h4>
    <p>We currently use UPS for international shipping. DHL and FedEx will be added as shipping options soon.</p>
    
    <p>International orders have a turnaround time of 5-12 days. Shipping rates will be calculated at checkout.</p>
    
    <p>Please note that any duties or levies will be paid by the customer at customs after the order is shipped. We do not facilitate or participate in this process.</p>
    
    <h4 className="font-semibold mt-4">Tracking</h4>
    <p>Tracking numbers will be sent to you upon dispatch of your order from our store to the shipping address provided by you during checkout.</p>
    
    <h4 className="font-semibold mt-4">Local Pickups</h4>
    <p>Local order pickups (SA only) will be implemented soon.</p>
  </div>
);

export const ContactContent = () => (
  <div className="space-y-4 text-foreground">
    <h3 className="font-semibold">Contact Us</h3>
    <p>We'd love to hear from you!</p>
    
    <h4 className="font-semibold mt-4">Email</h4>
    <p>hi@lunaluxhair.com</p>
    
    <h4 className="font-semibold mt-4">Phone</h4>
    <p>+27 12 880 6560</p>
    
    <h4 className="font-semibold mt-4">WhatsApp Business</h4>
    <p>+27 66 286 9181</p>
    
    <h4 className="font-semibold mt-4">Business Hours</h4>
    <p>Monday - Friday: 9:00 AM - 6:00 PM (SAST)<br/>Saturday: 10:00 AM - 4:00 PM<br/>Sunday: Closed</p>
  </div>
);
