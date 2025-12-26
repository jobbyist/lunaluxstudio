import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCurrency } from "@/contexts/CurrencyContext";

export const Newsletter = () => {
  const { t } = useCurrency();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error(t('enterEmailError'));
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("newsletter_subscriptions")
        .insert({ email });

      if (error) {
        if (error.code === "23505") {
          toast.error(t('alreadySubscribed'));
        } else {
          throw error;
        }
      } else {
        toast.success(t('subscribeSuccess'));
        setEmail("");
      }
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      toast.error(t('subscribeError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-20 bg-gradient-to-b from-card to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <Mail className="h-12 w-12 mx-auto text-primary" />
            <h2 className="text-3xl md:text-4xl font-serif tracking-wider">
              {t('joinMailingList')}
            </h2>
            <p className="text-muted-foreground">
              {t('newsletterDescription')}
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder={t('enterEmail')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90"
            >
              {isLoading ? t('subscribing') : t('subscribe')}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground">
            {t('privacyNote')}
          </p>
        </div>
      </div>
    </section>
  );
};
