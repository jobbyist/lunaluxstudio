import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { Preloader } from "@/components/Preloader";
import Index from "./pages/Index";
import ProductDetail from "./pages/ProductDetail";
import CustomizeProduct from "./pages/CustomizeProduct";
import Auth from "./pages/Auth";
import Booking from "./pages/Booking";
import About from "./pages/About";
import Community from "./pages/Community";
import Shop from "./pages/Shop";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <CurrencyProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Preloader />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/product/:handle" element={<ProductDetail />} />
              <Route path="/customize" element={<CustomizeProduct />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/booking" element={<Booking />} />
              <Route path="/about" element={<About />} />
              <Route path="/community" element={<Community />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CurrencyProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
