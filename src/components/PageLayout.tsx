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
              <div className="rounded-3xl border border-border/60 bg-card/70 px-6 py-8 md:px-10 md:py-12 text-center shadow-sm">
                {title && (
                  <h1 className="text-4xl md:text-5xl font-serif mb-4 tracking-tight">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-center text-muted-foreground max-w-2xl mx-auto">
                    {subtitle}
                  </p>
                )}
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
