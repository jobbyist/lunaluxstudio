import { Link } from "react-router-dom";
import { Mail, Phone, MessageCircle, CreditCard, Instagram, Twitter, Facebook } from "lucide-react";
import { LegalDialog, TermsContent, PrivacyContent, RefundsContent, ShippingContent } from "./LegalDialog";
import { FaTiktok } from "react-icons/fa";
import footerLogo from "@/assets/luna-logo-footer.png";

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand - Logo Image */}
          <div className="space-y-4">
            <Link to="/">
              <img 
                src={footerLogo} 
                alt="Luna Luxury Hair" 
                className="h-16 md:h-20 w-auto"
              />
            </Link>
            <p className="text-sm text-muted-foreground">
              Your trusted luxury hair and beauty store featuring only the finest, best-in-class products. Experience premium quality that lasts.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-primary">Browse</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/shop" className="text-muted-foreground hover:text-foreground transition-colors">Catalog</Link></li>
              <li><Link to="/customize" className="text-muted-foreground hover:text-foreground transition-colors">Customize</Link></li>
              <li><Link to="/explore" className="text-muted-foreground hover:text-foreground transition-colors">Collections</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Support</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold mb-4 text-primary">Discover</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">About</Link></li>
              <li><Link to="/explore" className="text-muted-foreground hover:text-foreground transition-colors">Explore</Link></li>
              <li><Link to="/shop" className="text-muted-foreground hover:text-foreground transition-colors">Shop</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-primary">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                info@lunaluxhair.com
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
            <div className="flex flex-wrap gap-3 items-center">
              {/* Visa */}
              <div className="bg-white px-3 py-2 rounded flex items-center justify-center w-[60px] h-[36px]">
                <svg viewBox="0 0 48 32" className="h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.2 23.8L22.5 8.2H26.3L24 23.8H20.2Z" fill="#00579F"/>
                  <path d="M35.9 8.5C35.1 8.2 33.8 7.9 32.2 7.9C28.4 7.9 25.7 9.8 25.7 12.5C25.7 14.5 27.6 15.6 29.1 16.3C30.6 17 31.1 17.5 31.1 18.2C31.1 19.3 29.8 19.8 28.6 19.8C26.9 19.8 26 19.6 24.6 19L24 18.7L23.4 22.4C24.3 22.8 26 23.2 27.8 23.2C31.8 23.2 34.5 21.3 34.5 18.5C34.5 17 33.6 15.9 31.6 15C30.3 14.4 29.5 13.9 29.5 13.2C29.5 12.6 30.2 11.9 31.7 11.9C33 11.9 33.9 12.1 34.7 12.5L35.1 12.7L35.9 8.5Z" fill="#00579F"/>
                  <path d="M41.4 8.2H38.5C37.5 8.2 36.7 8.5 36.3 9.5L30.5 23.8H34.5L35.3 21.5H40.1L40.6 23.8H44.1L41.4 8.2ZM36.5 18.3L38.5 12.7L39.6 18.3H36.5Z" fill="#00579F"/>
                  <path d="M16.8 8.2L13.1 18.7L12.7 16.6C12 14.3 9.9 11.8 7.6 10.6L10.9 23.8H15L21.1 8.2H16.8Z" fill="#00579F"/>
                  <path d="M9.8 8.2H4L3.9 8.5C8.6 9.6 11.7 12.4 13 15.6L11.5 9.5C11.3 8.6 10.6 8.2 9.8 8.2Z" fill="#FAA61A"/>
                </svg>
              </div>
              {/* Mastercard */}
              <div className="bg-white px-3 py-2 rounded flex items-center justify-center w-[60px] h-[36px]">
                <svg viewBox="0 0 48 32" className="h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="18" cy="16" r="10" fill="#EB001B"/>
                  <circle cx="30" cy="16" r="10" fill="#F79E1B"/>
                  <path d="M24 9.6C25.8 11.1 27 13.4 27 16C27 18.6 25.8 20.9 24 22.4C22.2 20.9 21 18.6 21 16C21 13.4 22.2 11.1 24 9.6Z" fill="#FF5F00"/>
                </svg>
              </div>
              {/* American Express */}
              <div className="bg-white px-3 py-2 rounded flex items-center justify-center w-[60px] h-[36px]">
                <svg viewBox="0 0 48 32" className="h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="48" height="32" rx="4" fill="#006FCF"/>
                  <path d="M12 18.5L13.5 15H15.5L14 18.5H17L18.5 15H20.5L19 18.5H21L22.5 15H24.5L21.5 21H19.5L21 18.5H18L16.5 21H14.5L17.5 15H15.5L12 21V18.5Z" fill="white"/>
                </svg>
              </div>
              {/* Apple Pay */}
              <div className="bg-black px-3 py-2 rounded flex items-center justify-center w-[60px] h-[36px]">
                <svg viewBox="0 0 48 32" className="h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.5 10.8C10.1 11.3 9.4 11.7 8.8 11.7C8.7 11 9 10.3 9.4 9.8C9.8 9.3 10.6 8.9 11.1 8.9C11.2 9.6 10.9 10.3 10.5 10.8ZM11.1 12C10.2 11.9 9.5 12.5 9 12.5C8.5 12.5 7.9 12 7.1 12C6.1 12 5.2 12.6 4.7 13.5C3.6 15.3 4.4 18 5.5 19.5C6 20.2 6.6 21 7.4 21C8.2 21 8.5 20.5 9.4 20.5C10.3 20.5 10.5 21 11.4 21C12.3 21 12.8 20.3 13.3 19.5C13.9 18.7 14.1 17.9 14.1 17.9C14.1 17.9 12.6 17.3 12.6 15.6C12.6 14.1 13.8 13.4 13.8 13.4C13.1 12.3 12 12.1 11.7 12.1L11.1 12Z" fill="white"/>
                  <path d="M20 15.5V21H21.5V18.8H23.2C24.9 18.8 26.1 17.6 26.1 16C26.1 14.4 24.9 13.2 23.3 13.2H20V15.5ZM21.5 14.5H22.9C24 14.5 24.6 15.1 24.6 16C24.6 16.9 24 17.5 22.9 17.5H21.5V14.5Z" fill="white"/>
                  <path d="M27 19C27 20.1 27.9 20.8 29.4 20.8C30.9 20.8 31.8 20.1 31.8 19V17.2C31.8 16.5 31.3 16.1 30.3 16L29 15.9C28.4 15.8 28.1 15.6 28.1 15.2C28.1 14.8 28.5 14.5 29.1 14.5C29.7 14.5 30.1 14.8 30.2 15.2H31.7C31.6 14.2 30.8 13.5 29.2 13.5C27.7 13.5 26.7 14.2 26.7 15.3C26.7 16 27.2 16.5 28.2 16.6L29.5 16.7C30.1 16.8 30.4 17 30.4 17.4C30.4 17.8 30 18.1 29.4 18.1C28.7 18.1 28.3 17.8 28.2 17.4H26.7C26.8 18.4 27.6 19 29 19Z" fill="white"/>
                  <path d="M33 21H34.5V18.3C34.5 17.5 35 17 35.8 17C36.2 17 36.5 17.1 36.7 17.2V15.7C36.5 15.6 36.2 15.6 35.9 15.6C35.2 15.6 34.6 16 34.5 16.5V15.7H33V21Z" fill="white"/>
                  <path d="M37.5 18.3C37.5 19.8 38.5 20.8 40 20.8C41.5 20.8 42.5 19.8 42.5 18.3C42.5 16.8 41.5 15.8 40 15.8C38.5 15.8 37.5 16.8 37.5 18.3ZM41 18.3C41 19.1 40.6 19.6 40 19.6C39.4 19.6 39 19.1 39 18.3C39 17.5 39.4 17 40 17C40.6 17 41 17.5 41 18.3Z" fill="white"/>
                </svg>
              </div>
              {/* SnapScan */}
              <div className="bg-background border border-border px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
                  <circle cx="12" cy="13" r="3"/>
                </svg>
                SnapScan
              </div>
              {/* PayPal */}
              <div className="bg-white px-3 py-2 rounded flex items-center justify-center w-[60px] h-[36px]">
                <svg viewBox="0 0 48 32" className="h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.5 8H13.5C13.2 8 12.9 8.2 12.8 8.5L10.5 22.5C10.5 22.8 10.7 23 11 23H13.5C13.8 23 14.1 22.8 14.2 22.5L14.8 18.8C14.9 18.5 15.2 18.3 15.5 18.3H17.3C20.3 18.3 22.1 16.9 22.6 14.1C22.8 12.9 22.6 11.9 22 11.2C21.3 10.4 20.1 10 18.5 10V8Z" fill="#003087"/>
                  <path d="M27.5 8H22.5C22.2 8 21.9 8.2 21.8 8.5L19.5 22.5C19.5 22.8 19.7 23 20 23H22.3C22.5 23 22.7 22.9 22.7 22.7L23.3 19.2C23.4 18.9 23.7 18.7 24 18.7H25.8C28.8 18.7 30.6 17.3 31.1 14.5C31.3 13.3 31.1 12.3 30.5 11.6C29.8 10.8 28.6 10.4 27 10.4L27.5 8Z" fill="#0070E0"/>
                  <path d="M18 14.1C18 14.4 17.8 14.6 17.5 14.6H16.2L16.8 10.7C16.8 10.6 16.9 10.5 17 10.5H17.6C18.5 10.5 19.2 10.7 19.5 11.1C19.7 11.4 19.8 11.8 19.7 12.3C19.5 13.3 18.9 14.1 18 14.1Z" fill="#003087"/>
                  <path d="M27 14.5C27 14.8 26.8 15 26.5 15H25.2L25.8 11.1C25.8 11 25.9 10.9 26 10.9H26.6C27.5 10.9 28.2 11.1 28.5 11.5C28.7 11.8 28.8 12.2 28.7 12.7C28.5 13.7 27.9 14.5 27 14.5Z" fill="#0070E0"/>
                </svg>
              </div>
              {/* Ozow */}
              <div className="bg-background border border-border px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z"/>
                </svg>
                Ozow
              </div>
              {/* Google Pay */}
              <div className="bg-white px-3 py-2 rounded flex items-center justify-center w-[60px] h-[36px]">
                <svg viewBox="0 0 48 32" className="h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23.5 15.5V20H22V10H26.3C27.3 10 28.2 10.4 28.9 11.1C29.6 11.8 30 12.7 30 13.7C30 14.7 29.6 15.6 28.9 16.3C28.2 17 27.3 17.4 26.3 17.4L23.5 15.5ZM23.5 11.5V14H26.3C26.8 14 27.2 13.8 27.5 13.5C27.8 13.2 28 12.8 28 12.3C28 11.8 27.8 11.4 27.5 11.1C27.2 10.8 26.8 10.6 26.3 10.6L23.5 11.5Z" fill="#5F6368"/>
                  <path d="M33 10V11.5C32.6 11.5 32.2 11.6 31.9 11.9C31.6 12.2 31.4 12.6 31.4 13V20H29.9V11.5H31.4V12.5C31.7 12.1 32 11.8 32.4 11.6C32.8 11.4 33.2 11.3 33.6 11.3L33 10Z" fill="#5F6368"/>
                  <path d="M38.5 14.5C39.3 14.5 40 14.8 40.5 15.3C41 15.8 41.3 16.5 41.3 17.3V20H39.8V17.5C39.8 17 39.6 16.6 39.3 16.3C39 16 38.6 15.8 38.1 15.8C37.6 15.8 37.2 16 36.9 16.3C36.6 16.6 36.4 17 36.4 17.5V20H34.9V14.7H36.4V15.5C36.7 15.2 37 15 37.4 14.8C37.8 14.6 38.1 14.5 38.5 14.5Z" fill="#5F6368"/>
                  <path d="M15 10C17.2 10 19 11.8 19 14C19 16.2 17.2 18 15 18C12.8 18 11 16.2 11 14C11 11.8 12.8 10 15 10Z" fill="#EA4335"/>
                  <path d="M15 11.5C13.6 11.5 12.5 12.6 12.5 14C12.5 15.4 13.6 16.5 15 16.5C16.4 16.5 17.5 15.4 17.5 14C17.5 12.6 16.4 11.5 15 11.5Z" fill="white"/>
                </svg>
              </div>
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
            &copy; {new Date().getFullYear()} Luna Luxury Hair. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
