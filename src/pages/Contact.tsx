import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CurrencyProvider, useCurrency } from "@/contexts/CurrencyContext";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, Send, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";

const faqs = [
  {
    question: "What is your shipping policy?",
    answer: "We offer free shipping on all orders over $100. Standard shipping takes 5-7 business days, while express shipping takes 2-3 business days. International shipping is available to select countries."
  },
  {
    question: "How do I care for my hair extensions?",
    answer: "We recommend washing your extensions with sulfate-free shampoo and conditioner. Use a wide-tooth comb to detangle, starting from the ends. Avoid sleeping with wet hair and store extensions properly when not in use."
  },
  {
    question: "What is your return policy?",
    answer: "We accept returns within 14 days of purchase for unused, unopened products in their original packaging. Custom orders and wigs that have been cut or styled are not eligible for returns."
  },
  {
    question: "How long do hair extensions last?",
    answer: "With proper care, our premium hair extensions can last 6-12 months or longer. The longevity depends on how frequently they're worn and how well they're maintained."
  },
  {
    question: "Do you offer installation services?",
    answer: "Yes! We offer professional installation services at our studio. You can book an appointment through our booking page or contact us directly to schedule your session."
  },
  {
    question: "Can I color or heat style the hair?",
    answer: "Yes, all our hair extensions are 100% human hair and can be colored, bleached, and heat styled. We recommend consulting with a professional stylist for coloring services."
  },
];

const ContactContent = () => {
  const { t } = useCurrency();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Message Sent!",
      description: "We'll get back to you within 24-48 hours.",
    });
    
    setFormData({ name: "", email: "", subject: "", message: "" });
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-40 md:pt-44 pb-16">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="font-heading text-4xl md:text-5xl mb-4">
              Get in <span className="text-primary">Touch</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Have a question or need assistance? We're here to help. Reach out to us through any of the channels below.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 mb-20">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-card p-8 rounded-2xl border border-border">
                <h2 className="font-heading text-2xl mb-6">Send Us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name</Label>
                      <Input
                        id="name"
                        placeholder="Jane Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="jane@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="How can we help you?"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us more about your inquiry..."
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-8"
            >
              <div>
                <h2 className="font-heading text-2xl mb-6">Contact Information</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Email</h3>
                      <a href="mailto:hi@lunaluxhair.com" className="text-muted-foreground hover:text-primary transition-colors">
                        hi@lunaluxhair.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Phone</h3>
                      <a href="tel:+27128806560" className="text-muted-foreground hover:text-primary transition-colors">
                        +27 12 880 6560
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <MessageCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">WhatsApp</h3>
                      <a 
                        href="https://wa.me/27662869181" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        +27 66 286 9181
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Business Hours</h3>
                      <p className="text-muted-foreground">
                        Monday - Friday: 9:00 AM - 6:00 PM<br />
                        Saturday: 10:00 AM - 4:00 PM<br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Contact Buttons */}
              <div className="p-6 bg-card rounded-2xl border border-border">
                <h3 className="font-medium mb-4">Quick Contact</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button asChild variant="outline" className="flex-1">
                    <a href="mailto:hi@lunaluxhair.com">
                      <Mail className="mr-2 h-4 w-4" />
                      Email Us
                    </a>
                  </Button>
                  <Button asChild className="flex-1">
                    <a href="https://wa.me/27662869181" target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      WhatsApp
                    </a>
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="font-heading text-3xl text-center mb-8">
              Frequently Asked <span className="text-primary">Questions</span>
            </h2>
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-card border border-border rounded-lg px-6"
                >
                  <AccordionTrigger className="text-left hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

const Contact = () => {
  return (
    <CurrencyProvider>
      <ContactContent />
    </CurrencyProvider>
  );
};

export default Contact;
