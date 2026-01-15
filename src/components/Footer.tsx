import { Link } from "react-router-dom";
import { Mail, Phone, MessageCircle, CreditCard, Instagram, Twitter, Facebook } from "lucide-react";
import { LegalDialog, TermsContent, PrivacyContent, RefundsContent, ShippingContent } from "./LegalDialog";
import { FaCcVisa, FaCcMastercard, FaCcAmex, FaApplePay, FaGooglePay, FaPaypal, FaEllipsisH, FaTiktok } from "react-icons/fa";
import footerLogo from "@/assets/luna-logo-footer.svg";
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
    { label: "Catalog", path: "/explore" },
    { label: "Customize", path: "/customize" },
    { label: "Collections", path: "/collections" },
    { label: "Promotions", path: "/promotions" },
  ];

  const defaultDiscoverLinks = [
    { label: "About", path: "/about" },
    { label: "Rewards", path: "/loyalty" },
    { label: "Articles", path: "/articles" },
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
              <span className="text-xs uppercase tracking-[0.3em]">We Accept</span>
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              {[
                { label: "Visa", Icon: FaCcVisa },
                { label: "Mastercard", Icon: FaCcMastercard },
                { label: "AMEX", Icon: FaCcAmex },
                { label: "Apple Pay", Icon: FaApplePay },
                { label: "G Pay", Icon: FaGooglePay },
                { label: "PayPal", Icon: FaPaypal },
                { label: "More", Icon: FaEllipsisH },
              ].map(({ label, Icon }) => (
                <div
                  key={label}
                  className="bg-background/80 border border-border/60 px-3 py-2 rounded-lg flex items-center justify-center w-[72px] h-[40px] shadow-sm"
                  aria-label={label}
                  title={label}
                >
                  <Icon className="h-6 w-6 text-foreground/90" />
                </div>
              ))}
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
