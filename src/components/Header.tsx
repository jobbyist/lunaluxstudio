import { useState } from "react";
import { 
  ShoppingCart, 
  User, 
  Globe, 
  Menu, 
  X, 
  ChevronDown,
  Home,
  Info,
  Compass,
  Mail,
  Gift,
  Tag,
  UserPlus,
  Star,
  FileText,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartDrawer } from "./CartDrawer";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCurrency, type Currency, type Language } from "@/contexts/CurrencyContext";
import { NotificationBar } from "./NotificationBar";
import lunaLogo from "@/assets/luna-logo.png";

export const Header = () => {
  const { currency, language, setCurrency, setLanguage, t } = useCurrency();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currencies: Currency[] = ["ZAR", "USD", "EUR", "GBP"];
  const languages: Language[] = ["EN", "ES", "FR", "DE", "AF"];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="container mx-auto px-4">
        {/* Top Bar - Rotating Notifications */}
        <NotificationBar />

        {/* Main Header */}
        <div className="flex items-center justify-between py-4">
          {/* Mobile Menu Button & Logo Container */}
          <div className="flex items-center gap-2 md:gap-0">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </Button>

            {/* Logo - Significantly Larger */}
            <Link to="/" className="flex items-center">
              <img 
                src={lunaLogo} 
                alt="Luna Luxury Hair" 
                className="h-20 md:h-24 w-auto"
                loading="eager"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 flex-1 justify-center ml-12">
            <Link to="/" className="text-foreground hover:text-primary transition-colors">
              {t('shopAll')}
            </Link>
            <Link to="/about" className="text-foreground hover:text-primary transition-colors">
              {t('about')}
            </Link>
            <Link to="/explore" className="text-foreground hover:text-primary transition-colors">
              {t('explore')}
            </Link>
            <Link to="/contact" className="text-foreground hover:text-primary transition-colors">
              {t('contact')}
            </Link>
            
            {/* More Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-foreground hover:text-primary transition-colors flex items-center gap-1 px-0">
                  More
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background border-border">
                <DropdownMenuItem asChild>
                  <Link to="/loyalty" className="cursor-pointer">Loyalty Rewards</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/gift-vouchers" className="cursor-pointer">Gift Vouchers</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/special-offers" className="cursor-pointer">Special Offers</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/referral" className="cursor-pointer">Referral Program</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/reviews" className="cursor-pointer">Leave A Review</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/policies" className="cursor-pointer">Store Policies</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Currency Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs">
                  <Globe className="h-4 w-4 mr-1" />
                  {currency}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {currencies.map((curr) => (
                  <DropdownMenuItem
                    key={curr}
                    onClick={() => setCurrency(curr)}
                  >
                    {curr}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs hidden md:flex">
                  {language}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang}
                    onClick={() => setLanguage(lang)}
                  >
                    {lang}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Account */}
            <Button variant="ghost" size="icon" asChild>
              <Link to="/auth">
                <User className="h-5 w-5" />
              </Link>
            </Button>

            {/* Cart */}
            <CartDrawer />
          </div>
        </div>

        {/* Mobile Menu */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="p-6 pb-4 border-b border-border">
              <SheetTitle className="text-left">
                <img 
                  src={lunaLogo} 
                  alt="Luna Luxury Hair" 
                  className="h-10 w-auto"
                  loading="eager"
                />
              </SheetTitle>
            </SheetHeader>
            
            <nav className="flex flex-col p-4">
              <Link
                to="/"
                className="flex items-center gap-3 px-3 py-3 text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors group"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home className="h-5 w-5 text-muted-foreground group-hover:text-accent-foreground" />
                <span>{t('shopAll')}</span>
              </Link>
              <Link
                to="/about"
                className="flex items-center gap-3 px-3 py-3 text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors group"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Info className="h-5 w-5 text-muted-foreground group-hover:text-accent-foreground" />
                <span>{t('about')}</span>
              </Link>
              <Link
                to="/explore"
                className="flex items-center gap-3 px-3 py-3 text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors group"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Compass className="h-5 w-5 text-muted-foreground group-hover:text-accent-foreground" />
                <span>{t('explore')}</span>
              </Link>
              <Link
                to="/contact"
                className="flex items-center gap-3 px-3 py-3 text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors group"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Mail className="h-5 w-5 text-muted-foreground group-hover:text-accent-foreground" />
                <span>{t('contact')}</span>
              </Link>
              
              {/* Mobile More Section */}
              <div className="mt-4 pt-4 border-t border-border">
                <div className="px-3 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  More
                </div>
                <Link 
                  to="/loyalty" 
                  className="flex items-center gap-3 px-3 py-3 text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors group" 
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Award className="h-5 w-5 text-muted-foreground group-hover:text-accent-foreground" />
                  <span>Loyalty Rewards</span>
                </Link>
                <Link 
                  to="/gift-vouchers" 
                  className="flex items-center gap-3 px-3 py-3 text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors group" 
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Gift className="h-5 w-5 text-muted-foreground group-hover:text-accent-foreground" />
                  <span>Gift Vouchers</span>
                </Link>
                <Link 
                  to="/special-offers" 
                  className="flex items-center gap-3 px-3 py-3 text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors group" 
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Tag className="h-5 w-5 text-muted-foreground group-hover:text-accent-foreground" />
                  <span>Special Offers</span>
                </Link>
                <Link 
                  to="/referral" 
                  className="flex items-center gap-3 px-3 py-3 text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors group" 
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserPlus className="h-5 w-5 text-muted-foreground group-hover:text-accent-foreground" />
                  <span>Referral Program</span>
                </Link>
                <Link 
                  to="/reviews" 
                  className="flex items-center gap-3 px-3 py-3 text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors group" 
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Star className="h-5 w-5 text-muted-foreground group-hover:text-accent-foreground" />
                  <span>Leave A Review</span>
                </Link>
                <Link 
                  to="/policies" 
                  className="flex items-center gap-3 px-3 py-3 text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors group" 
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FileText className="h-5 w-5 text-muted-foreground group-hover:text-accent-foreground" />
                  <span>Store Policies</span>
                </Link>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};
