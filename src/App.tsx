import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { AnimatePresence } from "framer-motion";
import { ChatBot } from "@/components/ChatBot";
import { ScrollToTop } from "@/components/ScrollToTop";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { VisitorTracker } from "@/components/VisitorTracker";
import { ValentinesPopup } from "@/components/ValentinesPopup";
import Index from "./pages/Index";
import ProductDetail from "./pages/ProductDetail";
import CustomizeProduct from "./pages/CustomizeProduct";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import AdminLogin from "./pages/AdminLogin";
import Booking from "./pages/Booking";
import About from "./pages/About";
import Explore from "./pages/Explore";
import Contact from "./pages/Contact";
import CollectionCategory from "./pages/CollectionCategory";
import Collections from "./pages/Collections";
import MainCharacterCollectionPage from "./pages/MainCharacterCollection";
import FaceCardCollection from "./pages/FaceCardCollection";
import PopOutCollection from "./pages/PopOutCollection";
import CafeDeLunaCollection from "./pages/CafeDeLunaCollection";
import Loyalty from "./pages/Loyalty";
import GiftVouchers from "./pages/GiftVouchers";
import SpecialOffers from "./pages/SpecialOffers";
import Referral from "./pages/Referral";
import Reviews from "./pages/Reviews";
import Policies from "./pages/Policies";
import Article from "./pages/Article";
import ArticlesPage from "./pages/Articles";
import Bestsellers from "./pages/Bestsellers";
import Promotions from "./pages/Promotions";
import Wishlist from "./pages/Wishlist";
import BrazilianVirginCollection from "./pages/BrazilianVirginCollection";
import VietnameseVirginCollection from "./pages/VietnameseVirginCollection";
import RawVietnameseCollection from "./pages/RawVietnameseCollection";
import PremiumAccessoriesCollection from "./pages/PremiumAccessoriesCollection";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminHomepageEditor from "./pages/admin/HomepageEditor";
import AdminEmails from "./pages/admin/AdminEmails";
import AdminSettings from "./pages/admin/Settings";
import ContentPublisher from "./pages/admin/ContentPublisher";
import ActivityLogs from "./pages/admin/ActivityLogs";
import Articles from "./pages/admin/Articles";
import AITools from "./pages/admin/AITools";
import AdminProducts from "./pages/admin/Products";
import AdminProductEditor from "./pages/admin/ProductEditor";
import AISiteManager from "./pages/admin/AISiteManager";
import AdminAnalytics from "./pages/admin/Analytics";
import NavigationEditor from "./pages/admin/NavigationEditor";
import AdminUsers from "./pages/admin/Users";
import AdminReferrals from "./pages/admin/Referrals";
import CustomWigOrders from "./pages/admin/CustomWigOrders";
import PaymentComplete from "./pages/PaymentComplete";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CurrencyProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <GoogleAnalytics />
          <VisitorTracker />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/product/:handle" element={<ProductDetail />} />
            <Route path="/customize" element={<CustomizeProduct />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/manage-login" element={<AdminLogin />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/about" element={<About />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/shop" element={<Index />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/collections/brazilian-virgin" element={<BrazilianVirginCollection />} />
            <Route path="/collections/vietnamese-virgin" element={<VietnameseVirginCollection />} />
            <Route path="/collections/raw-vietnamese" element={<RawVietnameseCollection />} />
            <Route path="/collections/premium-accessories" element={<PremiumAccessoriesCollection />} />
            <Route path="/collection/main-character" element={<MainCharacterCollectionPage />} />
            <Route path="/collection/face-card-collection" element={<FaceCardCollection />} />
            <Route path="/collection/pop-out-collection" element={<PopOutCollection />} />
            <Route path="/collection/cafe-de-luna" element={<CafeDeLunaCollection />} />
            <Route path="/collection/:collection/:category" element={<CollectionCategory />} />
            <Route path="/collection/:collection/:category" element={<CollectionCategory />} />
            <Route path="/loyalty" element={<Loyalty />} />
            <Route path="/gift-vouchers" element={<GiftVouchers />} />
            <Route path="/special-offers" element={<SpecialOffers />} />
            <Route path="/referral" element={<Referral />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/policies" element={<Policies />} />
            <Route path="/article/:slug" element={<Article />} />
            <Route path="/articles" element={<ArticlesPage />} />
            <Route path="/bestsellers" element={<Bestsellers />} />
            <Route path="/promotions" element={<Promotions />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/payment-complete" element={<PaymentComplete />} />
            
            {/* Admin Routes - /manage */}
            <Route path="/manage" element={<AdminDashboard />} />
            <Route path="/manage/navigation" element={<NavigationEditor />} />
            <Route path="/manage/articles" element={<Articles />} />
            <Route path="/manage/publish" element={<ContentPublisher />} />
            <Route path="/manage/publish/:id" element={<ContentPublisher />} />
            <Route path="/manage/homepage" element={<AdminHomepageEditor />} />
            <Route path="/manage/activity" element={<ActivityLogs />} />
            <Route path="/manage/admins" element={<AdminEmails />} />
            <Route path="/manage/settings" element={<AdminSettings />} />
            <Route path="/manage/ai-tools" element={<AITools />} />
            <Route path="/manage/products" element={<AdminProducts />} />
            <Route path="/manage/products/:id" element={<AdminProductEditor />} />
            <Route path="/manage/ai-site" element={<AISiteManager />} />
            <Route path="/manage/analytics" element={<AdminAnalytics />} />
            <Route path="/manage/users" element={<AdminUsers />} />
            <Route path="/manage/referrals" element={<AdminReferrals />} />
            <Route path="/manage/custom-wigs" element={<CustomWigOrders />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ChatBot />
          <ValentinesPopup />
        </BrowserRouter>
      </TooltipProvider>
    </CurrencyProvider>
  </QueryClientProvider>
);

export default App;
