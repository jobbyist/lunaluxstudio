import { useState } from "react";
import { ShoppingCart, User, Globe, Menu, X } from "lucide-react";
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
  const { currency, language, setCurrency, setLanguage } = useCurrency();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currencies: Currency[] = ["ZAR", "USD", "EUR", "GBP"];
  const languages: Language[] = ["EN", "ES", "FR", "DE"];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="py-2 border-b border-border/50 text-center text-sm text-muted-foreground">
          Free Shipping + 10% OFF your first order above $100 with code NEWLUNA25
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
            <Link to="/shop" className="text-foreground hover:text-primary transition-colors">
              Shop All
            </Link>
            <Link to="/bundles" className="text-foreground hover:text-primary transition-colors">
              Hair Bundles
            </Link>
            <Link to="/wigs" className="text-foreground hover:text-primary transition-colors">
              Wigs
            </Link>
            <Link to="/frontals" className="text-foreground hover:text-primary transition-colors">
              Frontals
            </Link>
            <Link to="/booking" className="text-foreground hover:text-primary transition-colors">
              Book Now
            </Link>
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
                to="/shop"
                className="text-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Shop All
              </Link>
              <Link
                to="/bundles"
                className="text-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Hair Bundles
              </Link>
              <Link
                to="/wigs"
                className="text-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Wigs
              </Link>
              <Link
                to="/frontals"
                className="text-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Frontals
              </Link>
              <Link
                to="/booking"
                className="text-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Book Now
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};
