import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { ReactNode } from "react";

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export const PageLayout = ({ children, title, subtitle }: PageLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PageTransition>
        <main className="pt-36 md:pt-40 pb-20">
          {(title || subtitle) && (
            <div className="container mx-auto px-4 mb-12">
              <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/70 px-6 py-10 md:px-10 md:py-12 shadow-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
                <div className="relative text-center space-y-4 animate-in fade-in-0 slide-in-from-bottom-4">
                  {title && (
                    <h1 className="text-4xl md:text-5xl font-serif tracking-wide text-foreground">
                      {title}
                    </h1>
                  )}
                  {subtitle && (
                    <p className="text-center text-muted-foreground max-w-2xl mx-auto text-base md:text-lg">
                      {subtitle}
                    </p>
                  )}
                  <div className="mx-auto h-1 w-16 rounded-full bg-gradient-to-r from-primary via-accent to-primary/60" />
                </div>
              </div>
            </div>
          )}
          <div className="container mx-auto px-4">
            {children}
          </div>
        </main>
      </PageTransition>
      <Footer />
    </div>
  );
};
