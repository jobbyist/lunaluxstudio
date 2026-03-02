import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const notifications = [
  {
    text: "🌸 International Women's Month: Get a FREE 10\" 2x6 inch bob with Café De Luna or Raw Vietnamese purchases!",
    link: "/womens-month"
  },
  {
    text: "🌍 Now shipping internationally via FedEx for $35 — Luna Luxury Hair worldwide!",
    link: "/policies#shipping"
  },
  {
    text: "NEW: Café De Luna Collection — Warm-toned highlights inspired by your favourite café flavours.",
    link: "/collection/cafe-de-luna"
  },
  {
    text: "Get 10% OFF your first order using the discount code \"LUNANEW10\" during checkout.",
    link: null
  },
  {
    text: "Join The Lux Club to earn loyalty rewards and unlock exclusive members-only perks.",
    link: "/loyalty"
  },
  {
    text: "Buy now, pay later with Happy Pay — interest-free, no upfront payment needed.",
    action: "happyPay"
  }
];

export const NotificationBar = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [happyPayOpen, setHappyPayOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % notifications.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const currentNotification = notifications[currentIndex];

  return (
    <>
      <div className="py-2 border-b border-border/50 text-center text-sm text-muted-foreground min-h-[40px] flex items-center justify-center px-4">
        {currentNotification.link ? (
          <Link 
            to={currentNotification.link} 
            className="hover:text-primary transition-colors"
          >
            {currentNotification.text}
          </Link>
        ) : currentNotification.action === "happyPay" ? (
          <button
            type="button"
            className="hover:text-primary transition-colors"
            onClick={() => setHappyPayOpen(true)}
          >
            {currentNotification.text}
          </button>
        ) : (
          <span>{currentNotification.text}</span>
        )}
      </div>
      <Dialog open={happyPayOpen} onOpenChange={setHappyPayOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif">Happy Pay at Checkout</DialogTitle>
            <DialogDescription>
              Split your purchase into two paychecks with Happy Pay. It is interest-free, requires no upfront payment,
              and lets you buy now while paying later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              To use Happy Pay, select <span className="font-semibold text-foreground">Stitch Express</span> as your
              payment method at checkout and follow the prompts.
            </p>
            <p>
              Learn more at{" "}
              <a
                className="text-primary underline-offset-4 hover:underline"
                href="https://happypay.co.za"
                target="_blank"
                rel="noopener noreferrer"
              >
                happypay.co.za
              </a>
              .
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
