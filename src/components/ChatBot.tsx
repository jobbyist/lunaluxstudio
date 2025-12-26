import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, X, Send, Ticket } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_QUERIES = [
  "What hair types do you offer?",
  "How do I care for my extensions?",
  "What's your return policy?",
  "How long does shipping take?",
  "Do you offer custom wigs?",
];

export const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm Luna AI, your hair styling assistant. How can I help you today? Select a question below or type your own!"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (messageText?: string) => {
    const userMessage = messageText || input.trim();
    if (!userMessage || loading) return;

    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("chat", {
        body: { message: userMessage }
      });

      if (error) throw error;

      const aiResponse = data.response + "\n\n---\n\n📩 **Need more help?** A support ticket has been created and sent to our team. We'll respond within 1-2 working days. You can also [contact us directly](/contact) via phone or WhatsApp.";

      setMessages(prev => [...prev, { role: "assistant", content: aiResponse }]);
    } catch (error: any) {
      console.error("Chat error:", error);
      toast.error("Failed to send message. Please try again.");
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Sorry, I'm having trouble connecting. Please try again later or [contact our support team](/contact) directly." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestedQuery = (query: string) => {
    sendMessage(query);
  };

  const renderMessageContent = (content: string) => {
    // Simple markdown-like rendering for links
    const parts = content.split(/(\[.*?\]\(.*?\))/g);
    return parts.map((part, index) => {
      const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
      if (linkMatch) {
        const [, text, url] = linkMatch;
        if (url.startsWith('/')) {
          return (
            <Link 
              key={index} 
              to={url} 
              className="text-primary underline hover:text-primary/80"
              onClick={() => setIsOpen(false)}
            >
              {text}
            </Link>
          );
        }
        return (
          <a 
            key={index} 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary underline hover:text-primary/80"
          >
            {text}
          </a>
        );
      }
      // Handle bold text
      return part.split(/(\*\*.*?\*\*)/g).map((segment, i) => {
        if (segment.startsWith('**') && segment.endsWith('**')) {
          return <strong key={`${index}-${i}`}>{segment.slice(2, -2)}</strong>;
        }
        return segment;
      });
    });
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-50 h-12 w-12 md:h-14 md:w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
          size="icon"
        >
          <MessageCircle className="h-5 w-5 md:h-6 md:w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed inset-4 md:inset-auto md:bottom-4 md:right-4 z-50 md:w-96 md:max-w-[calc(100vw-2rem)]">
          <div className="bg-card rounded-lg shadow-2xl border border-border overflow-hidden h-full md:h-auto flex flex-col max-h-[calc(100vh-2rem)] md:max-h-[600px]">
            {/* Header */}
            <div className="bg-primary p-3 md:p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-semibold text-primary-foreground text-sm md:text-base">Luna AI Assistant</span>
              </div>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="icon"
                className="hover:bg-primary/90 h-8 w-8"
              >
                <X className="h-4 w-4 md:h-5 md:w-5 text-primary-foreground" />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-3 md:p-4 min-h-0">
              <div className="space-y-3 md:space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg p-2.5 md:p-3 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      <p className="text-xs md:text-sm whitespace-pre-line">{renderMessageContent(message.content)}</p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-2.5 md:p-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Suggested Queries */}
            {messages.length <= 2 && !loading && (
              <div className="px-3 md:px-4 pb-2 shrink-0">
                <p className="text-xs text-muted-foreground mb-2">Suggested questions:</p>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_QUERIES.map((query, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestedQuery(query)}
                      className="text-xs bg-muted hover:bg-muted/80 text-foreground px-2.5 py-1.5 rounded-full transition-colors"
                    >
                      {query}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Support Ticket Notice */}
            <div className="px-3 md:px-4 py-2 bg-muted/50 border-t border-border shrink-0">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Ticket className="h-3 w-3" />
                <span>Queries are logged and our team responds within 1-2 days</span>
              </div>
            </div>

            {/* Input */}
            <div className="p-3 md:p-4 border-t border-border shrink-0">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Ask about our products..."
                  disabled={loading}
                  className="text-sm"
                />
                <Button
                  onClick={() => sendMessage()}
                  disabled={loading || !input.trim()}
                  className="bg-primary hover:bg-primary/90 shrink-0"
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
