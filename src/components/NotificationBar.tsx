import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const notifications = [
  {
    text: "Please note that shipping fees have increased slightly and we now offer international shipping. Click here to read our updated shipping policy",
    link: "/policies#shipping"
  },
  {
    text: "Get 10% OFF your first order using the discount code \"LUNANEW10\" during checkout",
    link: null
  },
  {
    text: "Join The Lux Club to earn loyalty rewards and unlock exclusive members-only perks.",
    link: "/loyalty"
  }
];

export const NotificationBar = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % notifications.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const currentNotification = notifications[currentIndex];

  return (
    <div className="py-2 border-b border-border/50 text-center text-sm text-muted-foreground min-h-[40px] flex items-center justify-center px-4">
      {currentNotification.link ? (
        <Link 
          to={currentNotification.link} 
          className="hover:text-primary transition-colors"
        >
          {currentNotification.text}
        </Link>
      ) : (
        <span>{currentNotification.text}</span>
      )}
    </div>
  );
};
