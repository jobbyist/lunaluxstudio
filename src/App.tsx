import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { ChatBot } from "@/components/ChatBot";
import { ScrollToTop } from "@/components/ScrollToTop";
import Index from "./pages/Index";
import ProductDetail from "./pages/ProductDetail";
import CustomizeProduct from "./pages/CustomizeProduct";
import Auth from "./pages/Auth";
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
import Loyalty from "./pages/Loyalty";
import GiftVouchers from "./pages/GiftVouchers";
import SpecialOffers from "./pages/SpecialOffers";
import Referral from "./pages/Referral";
import Reviews from "./pages/Reviews";
import Policies from "./pages/Policies";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminHomepageEditor from "./pages/admin/HomepageEditor";
import AdminEmails from "./pages/admin/AdminEmails";
import AdminSettings from "./pages/admin/Settings";
import ContentPublisher from "./pages/admin/ContentPublisher";
import ActivityLogs from "./pages/admin/ActivityLogs";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CurrencyProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/product/:handle" element={<ProductDetail />} />
            <Route path="/customize" element={<CustomizeProduct />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/about" element={<About />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/shop" element={<Index />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/collection/main-character" element={<MainCharacterCollectionPage />} />
            <Route path="/collection/face-card-collection" element={<FaceCardCollection />} />
            <Route path="/collection/pop-out-collection" element={<PopOutCollection />} />
            <Route path="/collection/:collection/:category" element={<CollectionCategory />} />
            <Route path="/loyalty" element={<Loyalty />} />
            <Route path="/gift-vouchers" element={<GiftVouchers />} />
            <Route path="/special-offers" element={<SpecialOffers />} />
            <Route path="/referral" element={<Referral />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/policies" element={<Policies />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/publish" element={<ContentPublisher />} />
            <Route path="/admin/homepage" element={<AdminHomepageEditor />} />
            <Route path="/admin/activity" element={<ActivityLogs />} />
            <Route path="/admin/admins" element={<AdminEmails />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ChatBot />
        </BrowserRouter>
      </TooltipProvider>
    </CurrencyProvider>
  </QueryClientProvider>
);

export default App;