import { Link } from "react-router-dom";
import { Mail, Phone, MessageCircle, CreditCard, Instagram, Twitter, Facebook } from "lucide-react";
import { LegalDialog, TermsContent, PrivacyContent, RefundsContent, ShippingContent } from "./LegalDialog";
import { FaTiktok } from "react-icons/fa";
import footerLogo from "@/assets/luna-logo-footer.png";
import { useNavigation } from "@/hooks/useNavigation";

const socialIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  twitter: Twitter,
  facebook: Facebook,
};

export const Footer = () => {
  const { getFooterNav, getSocialLinks, loading } = useNavigation();

  // Get navigation from database
  const browseLinks = getFooterNav('browse');
  const discoverLinks = getFooterNav('discover');
  const socialLinks = getSocialLinks();

  // Fallback navigation if database is empty
  const defaultBrowseLinks = [
    { label: "Catalog", path: "/shop" },
    { label: "Customize", path: "/customize" },
    { label: "Collections", path: "/explore" },
    { label: "Support", path: "/contact" },
  ];

  const defaultDiscoverLinks = [
    { label: "About", path: "/about" },
    { label: "Explore", path: "/explore" },
    { label: "Shop", path: "/shop" },
    { label: "Contact", path: "/contact" },
  ];

  const defaultSocialLinks = [
    { platform: "instagram", url: "https://instagram.com/lunaluxhair", label: "Instagram" },
    { platform: "twitter", url: "https://twitter.com", label: "Twitter" },
    { platform: "facebook", url: "https://facebook.com", label: "Facebook" },
    { platform: "tiktok", url: "https://tiktok.com/@cindykhan_", label: "TikTok" },
  ];

  const displayBrowseLinks = browseLinks.length > 0 ? browseLinks : defaultBrowseLinks;
  const displayDiscoverLinks = discoverLinks.length > 0 ? discoverLinks : defaultDiscoverLinks;
  const displaySocialLinks = socialLinks.length > 0 ? socialLinks : defaultSocialLinks;

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
              {displayBrowseLinks.map((link, index) => (
                <li key={index}>
                  <Link to={link.path} className="text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold mb-4 text-primary">Discover</h4>
            <ul className="space-y-2 text-sm">
              {displayDiscoverLinks.map((link, index) => (
                <li key={index}>
                  <Link to={link.path} className="text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
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
                <svg viewBox="0 0 780 500" className="h-6" xmlns="http://www.w3.org/2000/svg">
                  <path d="M293.2 348.73l33.359-195.76h53.358l-33.384 195.76H293.2zm246.11-191.54c-10.57-3.966-27.135-8.222-47.822-8.222-52.725 0-89.863 26.55-90.181 64.603-.297 28.13 26.514 43.822 46.752 53.186 20.771 9.595 27.752 15.714 27.654 24.283-.131 13.121-16.586 19.116-31.922 19.116-21.357 0-32.703-2.967-50.225-10.274l-6.877-3.112-7.488 43.823c12.463 5.464 35.51 10.199 59.438 10.445 56.09 0 92.502-26.248 92.916-66.884.199-22.27-14.016-39.216-44.801-53.188-18.65-9.056-30.072-15.099-29.951-24.269 0-8.137 9.668-16.838 30.56-16.838 17.446-.271 30.088 3.534 39.936 7.5l4.781 2.259 7.23-42.428m137.31-4.223h-41.23c-12.773 0-22.332 3.487-27.941 16.234l-79.245 179.4h56.031s9.16-24.121 11.232-29.418c6.123 0 60.555.084 68.336.084 1.596 6.854 6.492 29.334 6.492 29.334h49.512l-43.187-195.64zm-65.417 126.41c4.414-11.279 21.26-54.724 21.26-54.724-.314.521 4.381-11.334 7.074-18.684l3.607 16.878s10.217 46.729 12.352 56.527h-44.293v.003zM232.9 152.97l-52.24 133.79-5.565-27.129c-9.726-31.274-40.025-65.157-73.898-82.12l47.767 171.2 56.455-.063 84.004-195.67-56.523-.001" fill="#0E4595"/>
                  <path d="M131.92 152.97H46.634l-.682 4.073c66.939 16.204 111.23 55.363 129.62 102.42l-18.709-89.96c-3.23-12.396-12.597-16.096-24.949-16.528" fill="#F2AE14"/>
                </svg>
              </div>
              {/* Mastercard */}
              <div className="bg-white px-3 py-2 rounded flex items-center justify-center w-[60px] h-[36px]">
                <svg viewBox="0 0 780 500" className="h-6" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="250" cy="250" r="150" fill="#EB001B"/>
                  <circle cx="530" cy="250" r="150" fill="#F79E1B"/>
                  <path d="M390 113.5c-46.5 36.9-76.5 93.8-76.5 157.5s30 120.6 76.5 157.5c46.5-36.9 76.5-93.8 76.5-157.5s-30-120.6-76.5-157.5z" fill="#FF5F00"/>
                </svg>
              </div>
              {/* American Express */}
              <div className="bg-[#006FCF] px-3 py-2 rounded flex items-center justify-center w-[60px] h-[36px]">
                <span className="text-white text-xs font-bold">AMEX</span>
              </div>
              {/* Apple Pay */}
              <div className="bg-black px-3 py-2 rounded flex items-center justify-center w-[60px] h-[36px]">
                <span className="text-white text-xs font-bold">Pay</span>
              </div>
              {/* SnapScan */}
              <div className="bg-[#00AEEF] px-3 py-2 rounded flex items-center justify-center w-[60px] h-[36px]">
                <span className="text-white text-xs font-bold">SnapScan</span>
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
            {displaySocialLinks.map((social, index) => {
              const IconComponent = social.platform === 'tiktok' 
                ? () => <FaTiktok className="h-5 w-5" />
                : socialIconMap[social.platform] || Instagram;
              
              return (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-background border border-border rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
                  aria-label={social.label}
                >
                  <IconComponent className="h-5 w-5" />
                </a>
              );
            })}
          </div>

          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Luna Luxury Hair. All rights reserved.
          </p>
          <p className="text-center text-xs text-muted-foreground mt-2">
            Developed and maintained by{" "}
            <a 
              href="https://gravitas.uno" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Gravitas Industries
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};
