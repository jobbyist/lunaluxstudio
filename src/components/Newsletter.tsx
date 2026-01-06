import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCurrency } from "@/contexts/CurrencyContext";
import { motion } from "framer-motion";
import { z } from "zod";
import { useHomepageSections } from "@/hooks/useHomepageSections";

// Email validation schema
const emailSchema = z.string().trim().email("Please enter a valid email address").max(255, "Email is too long");

export const Newsletter = () => {
  const { t } = useCurrency();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { section, loading } = useHomepageSections("newsletter");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation with zod
    const validationResult = emailSchema.safeParse(email);
    if (!validationResult.success) {
      toast.error(validationResult.error.errors[0]?.message || t('enterEmailError'));
      return;
    }

    const validatedEmail = validationResult.data;
    setIsLoading(true);
    
    try {
      // Check for duplicate first
      const { data: existing } = await supabase
        .from("newsletter_subscriptions")
        .select("id")
        .eq("email", validatedEmail)
        .maybeSingle();

      if (existing) {
        toast.error(t('alreadySubscribed'));
        setIsLoading(false);
        return;
      }

      const { error } = await supabase
        .from("newsletter_subscriptions")
        .insert({ email: validatedEmail });

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

  const containerVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: "easeOut" as const,
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const,
      },
    },
  };

  // Use database content or fallback
  const content = section?.content || {};
  const title = content.title || t('joinMailingList');
  const subtitle = content.subtitle || t('newsletterDescription');
  const privacyNote = content.privacyNote || t('privacyNote');

  if (loading || !section?.is_visible) {
    return null;
  }

  return (
    <section className="py-20 bg-gradient-to-b from-card to-background overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div 
          className="max-w-2xl mx-auto text-center space-y-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div className="space-y-4" variants={itemVariants}>
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              whileInView={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
              viewport={{ once: true }}
            >
              <Mail className="h-12 w-12 mx-auto text-primary" />
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-serif tracking-wider">
              {title}
            </h2>
            <p className="text-muted-foreground">
              {subtitle}
            </p>
          </motion.div>

          <motion.form 
            onSubmit={handleSubscribe} 
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            variants={itemVariants}
          >
            <Input
              type="email"
              placeholder={t('enterEmail')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
              disabled={isLoading}
            />
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
              >
                {isLoading ? t('subscribing') : t('subscribe')}
              </Button>
            </motion.div>
          </motion.form>

          <motion.p 
            className="text-xs text-muted-foreground"
            variants={itemVariants}
          >
            {privacyNote}
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};