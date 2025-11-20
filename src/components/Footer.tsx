import { Link } from "react-router-dom";
import { Mail, Phone, MessageCircle, CreditCard, Instagram, Twitter, Facebook } from "lucide-react";
import { LegalDialog, TermsContent, PrivacyContent, RefundsContent, ShippingContent, ContactContent } from "./LegalDialog";
import { FaTiktok } from "react-icons/fa";

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-serif tracking-wider">
              <span className="text-primary">LUNA</span> STUDIO
            </h3>
            <p className="text-sm text-muted-foreground">
              Premium hair extensions and wigs for the modern woman. Experience luxury that lasts.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-primary">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/shop" className="text-muted-foreground hover:text-foreground transition-colors">All Products</Link></li>
              <li><Link to="/bundles" className="text-muted-foreground hover:text-foreground transition-colors">Hair Bundles</Link></li>
              <li><Link to="/wigs" className="text-muted-foreground hover:text-foreground transition-colors">Wigs</Link></li>
              <li><Link to="/frontals" className="text-muted-foreground hover:text-foreground transition-colors">Frontals & Closures</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold mb-4 text-primary">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/booking" className="text-muted-foreground hover:text-foreground transition-colors">Book Appointment</Link></li>
              <li><Link to="/faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQs</Link></li>
              <li><Link to="/shipping" className="text-muted-foreground hover:text-foreground transition-colors">Shipping Info</Link></li>
              <li><Link to="/returns" className="text-muted-foreground hover:text-foreground transition-colors">Returns</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-primary">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                hi@lunaluxhair.com
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                +27 12 880 6560
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <MessageCircle className="h-4 w-4 text-primary" />
                +27 66 286 9181
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8">
          {/* Payment Methods */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CreditCard className="h-5 w-5" />
              <span className="text-xs">We Accept:</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="bg-background border border-border px-3 py-1.5 rounded text-xs font-medium">VISA</div>
              <div className="bg-background border border-border px-3 py-1.5 rounded text-xs font-medium">Mastercard</div>
              <div className="bg-background border border-border px-3 py-1.5 rounded text-xs font-medium">AMEX</div>
              <div className="bg-background border border-border px-3 py-1.5 rounded text-xs font-medium">PayJustNow</div>
              <div className="bg-background border border-border px-3 py-1.5 rounded text-xs font-medium">HappyPay</div>
              <div className="bg-background border border-border px-3 py-1.5 rounded text-xs font-medium">PayPal</div>
            </div>
          </div>

          {/* Legal Links */}
          <div className="flex flex-wrap justify-center gap-4 mb-4 text-sm">
            <LegalDialog title="Terms of Service" content={<TermsContent />}>
              Terms
            </LegalDialog>
            <span className="text-muted-foreground">•</span>
            <LegalDialog title="Privacy Policy" content={<PrivacyContent />}>
              Privacy
            </LegalDialog>
            <span className="text-muted-foreground">•</span>
            <LegalDialog title="Refund Policy" content={<RefundsContent />}>
              Refunds
            </LegalDialog>
            <span className="text-muted-foreground">•</span>
            <LegalDialog title="Shipping Information" content={<ShippingContent />}>
              Shipping
            </LegalDialog>
            <span className="text-muted-foreground">•</span>
            <LegalDialog title="Contact Us" content={<ContactContent />}>
              Contact
            </LegalDialog>
          </div>

          {/* Social Media Links */}
          <div className="flex justify-center gap-4 mb-6">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-background border border-border rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-background border border-border rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-background border border-border rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-background border border-border rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
              aria-label="TikTok"
            >
              <FaTiktok className="h-5 w-5" />
            </a>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Luna Studio. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
