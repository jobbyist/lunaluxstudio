import { useState } from "react";
import { ShoppingCart, User, Globe, Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartDrawer } from "./CartDrawer";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrency, type Currency, type Language } from "@/contexts/CurrencyContext";

export const Header = () => {
  const { currency, language, setCurrency, setLanguage, t } = useCurrency();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currencies: Currency[] = ["ZAR", "USD", "EUR", "GBP"];
  const languages: Language[] = ["EN", "ES", "FR", "DE"];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="py-2 border-b border-border/50 text-center text-sm text-muted-foreground">
          {t('topBanner')}
        </div>

        {/* Main Header */}
        <div className="flex items-center justify-between py-4">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>

          {/* Logo */}
          <Link to="/" className="flex items-center justify-center flex-1 md:flex-none">
            <h1 className="text-2xl md:text-3xl font-serif tracking-wider">
              <span className="text-primary">LUNA</span>
              <span className="text-foreground ml-2">STUDIO</span>
            </h1>
          </Link>

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
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-4">
              <Link
                to="/"
                className="text-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('shopAll')}
              </Link>
              <Link
                to="/about"
                className="text-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('about')}
              </Link>
              <Link
                to="/explore"
                className="text-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('explore')}
              </Link>
              <Link
                to="/contact"
                className="text-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('contact')}
              </Link>
              
              {/* Mobile More Section */}
              <div className="pt-4 border-t border-border/50">
                <span className="text-muted-foreground text-sm font-medium">More</span>
                <div className="flex flex-col space-y-3 mt-3">
                  <Link to="/loyalty" className="text-foreground hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Loyalty Rewards</Link>
                  <Link to="/gift-vouchers" className="text-foreground hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Gift Vouchers</Link>
                  <Link to="/special-offers" className="text-foreground hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Special Offers</Link>
                  <Link to="/referral" className="text-foreground hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Referral Program</Link>
                  <Link to="/reviews" className="text-foreground hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Leave A Review</Link>
                  <Link to="/policies" className="text-foreground hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Store Policies</Link>
                </div>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};
