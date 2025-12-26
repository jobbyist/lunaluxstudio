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
                <svg viewBox="0 0 780 500" className="h-5" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 0h780v500H0z" fill="#006FCF"/>
                  <path d="M327.89 221.37l-8.93-21.59-8.93 21.59h17.86zm186.11 0l-8.93-21.59-8.93 21.59h17.86zM40 200.62h37.68l8.43 18.91 8.7-18.91h175.38l-.01-.01c.24 0 .48.01.72.01 6.47 0 11.72-4.82 11.72-10.76V200h70.05v-.14c.01 0 .03.01.04.01 6.47 0 11.72-4.82 11.72-10.76 0-5.87-5.17-10.64-11.55-10.76h-140.76l-17.8 38.84-18.39-38.84H97.02l-17.8 38.84-18.39-38.84H40v10.91l.01 9.95H40z" fill="#FFF"/>
                  <path d="M629.28 178.35H740v21.84h-81.46v18.38h79.45v20.62h-79.45v18.86H740v21.84H629.28v-101.54zm-40.88 0h31.74l37.17 101.54h-33.04l-5.91-17.14h-40.66l-5.91 17.14h-32.03l48.64-101.54zm-109.98 0h31.26v79.7h69.17v21.84h-100.43V178.35zm-159.81 0h31.74l37.17 101.54h-33.04l-5.91-17.14h-40.66l-5.91 17.14H270.4l48.21-101.54zM40 279.89v-79.27h37.68l8.43 18.91 8.7-18.91h38.37v68.39l.01-.01-8.43-18.92h-17.86l-8.94 21.59-17.47 7.8H40z" fill="#FFF"/>
                </svg>
              </div>
              {/* Discover */}
              <div className="bg-white px-3 py-2 rounded flex items-center justify-center w-[60px] h-[36px]">
                <svg viewBox="0 0 780 500" className="h-6" xmlns="http://www.w3.org/2000/svg">
                  <path d="M54.99 0h670.02C756.57 0 780 23.43 780 54.99v390.02c0 31.56-23.43 54.99-54.99 54.99H54.99C23.43 500 0 476.57 0 445.01V54.99C0 23.43 23.43 0 54.99 0z" fill="#4D4D4D"/>
                  <path d="M499.78 252.23c0 73.29-59.42 132.71-132.71 132.71H0V117.28h367.07c73.29 0 132.71 59.42 132.71 132.95z" fill="#FFF"/>
                  <ellipse cx="388.68" cy="250" rx="114.32" ry="112.28" fill="#F47216"/>
                  <path d="M780 117.28v267.66H499.78c0-73.29-59.42-132.71-132.71-132.71h413.15c-.22.03-.22-134.95-.22-134.95z" fill="#F47216"/>
                </svg>
              </div>
              {/* Apple Pay */}
              <div className="bg-black px-3 py-2 rounded flex items-center justify-center w-[60px] h-[36px]">
                <svg viewBox="0 0 165.52 105.97" className="h-5" xmlns="http://www.w3.org/2000/svg">
                  <path d="M150.7 0H14.82A14.82 14.82 0 0 0 0 14.82v76.33a14.82 14.82 0 0 0 14.82 14.82H150.7a14.82 14.82 0 0 0 14.82-14.82V14.82A14.82 14.82 0 0 0 150.7 0z" fill="#000"/>
                  <path d="M37.06 35.04a6.27 6.27 0 0 0-1.43-2.18 6.08 6.08 0 0 0-2.11-1.41 6.69 6.69 0 0 0-2.61-.5 7.07 7.07 0 0 0-3.64.95 6.58 6.58 0 0 0-2.52 2.72 9.05 9.05 0 0 0-.9 4.18 8.54 8.54 0 0 0 .92 4.08 6.59 6.59 0 0 0 2.55 2.67 7.27 7.27 0 0 0 3.72.93 6.37 6.37 0 0 0 4.8-1.86 7.55 7.55 0 0 0 1.88-4.81l-6.54-.02v-2.98h9.87v3.4a11.43 11.43 0 0 1-1.58 4.7 10.1 10.1 0 0 1-3.52 3.38 10.03 10.03 0 0 1-5.05 1.25 11.15 11.15 0 0 1-5.75-1.46 10.08 10.08 0 0 1-3.86-4.12 13.2 13.2 0 0 1-1.37-6.16 12.73 12.73 0 0 1 1.39-6.08 9.98 9.98 0 0 1 3.87-4.04 11.2 11.2 0 0 1 5.71-1.44 10.55 10.55 0 0 1 6.73 2.06 8.57 8.57 0 0 1 3.1 5.74h-3.67z" fill="#FFF"/>
                  <path d="M60.26 38.8a9.47 9.47 0 0 1 2.32 6.7 9.64 9.64 0 0 1-2.32 6.77 8.24 8.24 0 0 1-6.36 2.52 7.5 7.5 0 0 1-3.49-.77 5.89 5.89 0 0 1-2.29-2.05h-.18v9.77h-3.5V36.57h3.36v2.62h.18a6.26 6.26 0 0 1 2.35-2.13 7.34 7.34 0 0 1 3.58-.84 8.16 8.16 0 0 1 6.35 2.58zm-2.6 10.78a6.37 6.37 0 0 0 1.46-4.47 6.29 6.29 0 0 0-1.46-4.44 5.2 5.2 0 0 0-4-1.64 5.13 5.13 0 0 0-4 1.66 6.35 6.35 0 0 0-1.47 4.44 6.44 6.44 0 0 0 1.47 4.48 5.06 5.06 0 0 0 3.98 1.66 5.15 5.15 0 0 0 4.02-1.69zM77.64 36.57v3.03h-3.97v9.2q0 1.57.52 2.11a2.35 2.35 0 0 0 1.8.54 7.48 7.48 0 0 0 1.65-.2v2.93a9.49 9.49 0 0 1-2.55.31 5.04 5.04 0 0 1-3.7-1.18 4.93 4.93 0 0 1-1.2-3.67V39.6h-2.87v-3.03h2.87v-4.04h3.48v4.04h3.97zM93.89 49.3h-11.16a5.29 5.29 0 0 0 1.71 3.51 5.49 5.49 0 0 0 3.71 1.25 5.4 5.4 0 0 0 4.37-1.93l1.87 2.26a7.2 7.2 0 0 1-2.8 2.05 9.59 9.59 0 0 1-3.64.66 9.37 9.37 0 0 1-4.56-1.07 7.55 7.55 0 0 1-3.06-3.02 9.04 9.04 0 0 1-1.09-4.5 9.25 9.25 0 0 1 1.05-4.44 7.48 7.48 0 0 1 2.93-3.04 8.37 8.37 0 0 1 4.28-1.1 8.05 8.05 0 0 1 4.17 1.07 7.31 7.31 0 0 1 2.82 3.02 9.5 9.5 0 0 1 1 4.48 12.39 12.39 0 0 1-.06.8zm-9.91-5.4a4.97 4.97 0 0 0-1.37 3.18h7.82a4.81 4.81 0 0 0-1.33-3.15 4.27 4.27 0 0 0-3.08-1.18 4.38 4.38 0 0 0-2.04.48z" fill="#FFF"/>
                  <path d="M101.6 54.18V27.75h10.73a10.12 10.12 0 0 1 4.7 1.02 7.17 7.17 0 0 1 3.04 2.87 8.4 8.4 0 0 1 1.07 4.26 8.25 8.25 0 0 1-1.09 4.27 7.2 7.2 0 0 1-3.07 2.84 10.3 10.3 0 0 1-4.7 1h-6.86v10.17h-3.82zm3.82-13.4h6.56a5.64 5.64 0 0 0 3.96-1.26 4.58 4.58 0 0 0 1.37-3.55 4.45 4.45 0 0 0-1.37-3.49 5.74 5.74 0 0 0-3.96-1.22h-6.56v9.52zM135.31 36.57v3.02h-3.98v9.2a2.66 2.66 0 0 0 .52 2.11 2.36 2.36 0 0 0 1.8.55 7.39 7.39 0 0 0 1.66-.21v2.93a9.44 9.44 0 0 1-2.56.32 5.04 5.04 0 0 1-3.7-1.18 4.96 4.96 0 0 1-1.2-3.68V39.59h-2.86v-3.02h2.86v-4.04h3.49v4.04h3.97z" fill="#FFF"/>
                </svg>
              </div>
              {/* Samsung Pay */}
              <div className="bg-[#1428A0] px-3 py-2 rounded flex items-center justify-center w-[60px] h-[36px]">
                <svg viewBox="0 0 780 500" className="h-5" xmlns="http://www.w3.org/2000/svg">
                  <rect width="780" height="500" fill="#1428A0"/>
                  <path d="M140 290h50v-80h-50v80zm60-100h50v100h50V190h50v-30H200v30zm160 0v100h50V250h60v-30h-60v-30h70v-30H360v30zm80 100h50v-70l30 70h40l30-70v70h50V160h-70l-30 70-30-70h-70v130zm210-100h50v100h50V190h50v-30H610v30z" fill="#FFF"/>
                </svg>
              </div>
              {/* Google Pay */}
              <div className="bg-white px-3 py-2 rounded flex items-center justify-center w-[60px] h-[36px]">
                <svg viewBox="0 0 435.97 173.13" className="h-5" xmlns="http://www.w3.org/2000/svg">
                  <path d="M206.2 84.58v50.75h-16.1V10h42.7a38.61 38.61 0 0 1 27.65 10.85A34.88 34.88 0 0 1 272 47.33a34.56 34.56 0 0 1-11.55 26.33 38.87 38.87 0 0 1-27.65 10.92zm0-59.15v43.72h27a21.28 21.28 0 0 0 16.1-6.65 22.91 22.91 0 0 0 0-30.28 20.89 20.89 0 0 0-16.1-6.79z" fill="#5F6368"/>
                  <path d="M309.1 46.3c11.9 0 21.28 3.15 28.14 9.45s10.29 14.91 10.29 25.9v52.29h-15.4v-11.76h-.7c-6.65 9.66-15.47 14.49-26.46 14.49a36 36 0 0 1-24.85-9.1 29 29 0 0 1-10.15-22.47 27.42 27.42 0 0 1 10.71-22.26q10.71-8.82 28.14-8.82a50.59 50.59 0 0 1 24.08 5.32v-3.71c0-7-2.73-12.81-8.19-17.5a27.42 27.42 0 0 0-18.69-7c-10.85 0-19.39 4.55-25.69 13.65l-14.21-8.89c9.31-13.37 23.1-20.06 41.09-20.06zm-21.63 70.28a17.93 17.93 0 0 0 7.35 14.56 26.56 26.56 0 0 0 17 5.88 29.06 29.06 0 0 0 20.65-8.33 26.67 26.67 0 0 0 8.82-20.16 42 42 0 0 0-21.28-5.74c-9.24 0-16.94 2.31-23.1 6.93a21.23 21.23 0 0 0-9.45 16.86z" fill="#5F6368"/>
                  <path d="M436 49.03l-53.76 123.62H365.5l19.95-43.23-35.35-80.39h17.64l25.34 61.15h.35l24.64-61.15z" fill="#5F6368"/>
                  <path d="M141.14 73.64a85.79 85.79 0 0 0-1.24-14.64H72v27.73h38.89a33.33 33.33 0 0 1-14.42 21.84v18h23.27c13.62-12.56 21.47-31.06 21.47-52.93z" fill="#4285F4"/>
                  <path d="M72 144c19.43 0 35.79-6.38 47.72-17.38l-23.27-18c-6.46 4.38-14.78 6.93-24.38 6.93-18.73 0-34.58-12.63-40.25-29.62H7.67v18.55A72 72 0 0 0 72 144z" fill="#34A853"/>
                  <path d="M31.75 85.93a43.87 43.87 0 0 1 0-27.86V39.52H7.67a72 72 0 0 0 0 64.96z" fill="#FBBC05"/>
                  <path d="M72 28.45a38.85 38.85 0 0 1 27.52 10.78l20.55-20.55A69.06 69.06 0 0 0 72 0 72 72 0 0 0 7.67 39.52l24.08 18.55C37.42 41.08 53.27 28.45 72 28.45z" fill="#EA4335"/>
                </svg>
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
