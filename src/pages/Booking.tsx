import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Calendar } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

const Booking = () => {
  const { t } = useCurrency();
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-36 md:pt-40 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-serif mb-4">
              {t('bookingTitle')} <span className="text-primary">{t('bookingTitleHighlight')}</span>
            </h1>
            <p className="text-muted-foreground">
              {t('bookingDescription')}
            </p>
          </div>

          <div className="bg-card rounded-lg p-8 shadow-lg">
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <Calendar className="h-16 w-16 text-primary mx-auto" />
                <h3 className="text-xl font-semibold">{t('comingSoon')}</h3>
                <p className="text-muted-foreground max-w-md">
                  {t('bookingComingSoonText')}
                </p>
                <div className="pt-6 space-y-2">
                  <p className="text-sm">
                    <span className="font-semibold">{t('phone')}</span> +27 12 880 6560
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">{t('whatsapp')}</span> +27 66 286 9181
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">{t('email')}</span> hi@lunaluxhair.com
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Booking;
