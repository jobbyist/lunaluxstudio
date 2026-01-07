import { useState, useEffect } from "react";
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
  Star,
  FileText,
  Award,
  Settings
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
import { motion } from "framer-motion";
import { useNavigation } from "@/hooks/useNavigation";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  home: Home,
  info: Info,
  compass: Compass,
  mail: Mail,
  star: Star,
  filetext: FileText,
  award: Award,
  settings: Settings,
};

export const Header = () => {
  const { currency, language, setCurrency, setLanguage, t } = useCurrency();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { getHeaderNav, loading } = useNavigation();

  const currencies: Currency[] = ["ZAR", "USD", "EUR", "GBP"];
  const languages: Language[] = ["EN", "ES", "FR", "DE", "AF"];

  // Get navigation from database
  const mainNav = getHeaderNav('main');
  const moreNav = getHeaderNav('more');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fallback navigation if database is empty
  const defaultMainNav = [
    { label: "Shop All", path: "/", translationKey: "shopAll" },
    { label: "About", path: "/about", translationKey: "about" },
    { label: "Explore", path: "/explore", translationKey: "explore" },
    { label: "Contact", path: "/contact", translationKey: "contact" },
  ];

  const defaultMoreNav = [
    { label: "Loyalty Rewards", path: "/loyalty" },
    { label: "Leave A Review", path: "/reviews" },
    { label: "Store Policies", path: "/policies" },
    { label: "Admin Dashboard", path: "/manage" },
  ];

  const displayMainNav = mainNav.length > 0 ? mainNav : defaultMainNav;
  const displayMoreNav = moreNav.length > 0 ? moreNav : defaultMoreNav;

  // Icons for mobile menu
  const mobileIcons = ['home', 'info', 'compass', 'mail'];

  return (
    <motion.header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? "bg-background/70 backdrop-blur-xl shadow-lg border-b border-border/50" 
          : "bg-background/95 backdrop-blur border-b border-border"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
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

            {/* Logo - Shrinks on scroll */}
            <Link to="/" className="flex items-center">
              <motion.img 
                src={lunaLogo} 
                alt="Luna Luxury Hair" 
                className="w-auto"
                animate={{
                  height: scrolled ? "3.5rem" : "5rem",
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                loading="eager"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 flex-1 justify-center ml-12">
            {displayMainNav.map((item, index) => (
              <Link 
                key={index}
                to={item.path} 
                className="text-foreground hover:text-primary transition-colors"
              >
                {item.translationKey ? t(item.translationKey as 'shopAll' | 'about' | 'explore' | 'contact') : item.label}
              </Link>
            ))}
            
            {/* More Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-foreground hover:text-primary transition-colors flex items-center gap-1 px-0">
                  More
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background border-border">
                {displayMoreNav.map((item, index) => (
                  <DropdownMenuItem key={index} asChild>
                    {(item as { external?: boolean }).external ? (
                      <a href={item.path} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                        {item.label}
                      </a>
                    ) : (
                      <Link to={item.path} className="cursor-pointer">
                        {item.label}
                      </Link>
                    )}
                  </DropdownMenuItem>
                ))}
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
              {displayMainNav.map((item, index) => {
                const IconComponent = iconMap[mobileIcons[index] || 'home'] || Home;
                return (
                  <Link
                    key={index}
                    to={item.path}
                    className="flex items-center gap-3 px-3 py-3 text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors group"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <IconComponent className="h-5 w-5 text-muted-foreground group-hover:text-accent-foreground" />
                    <span>{item.translationKey ? t(item.translationKey as 'shopAll' | 'about' | 'explore' | 'contact') : item.label}</span>
                  </Link>
                );
              })}
              
              {/* Mobile More Section */}
              <div className="mt-4 pt-4 border-t border-border">
                <div className="px-3 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  More
                </div>
                {displayMoreNav.map((item, index) => {
                  const moreIcons = [Award, Star, FileText, Settings];
                  const IconComponent = moreIcons[index] || Award;
                  return (
                    <Link 
                      key={index}
                      to={item.path} 
                      className="flex items-center gap-3 px-3 py-3 text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors group" 
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <IconComponent className="h-5 w-5 text-muted-foreground group-hover:text-accent-foreground" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </motion.header>
  );
};
