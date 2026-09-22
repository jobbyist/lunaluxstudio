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
        <main className="pt-[136px] md:pt-[156px] pb-20">
          {(title || subtitle) && (
            <div className="container mx-auto px-4 mb-12">
              <div className="border-b border-border px-6 py-8 md:px-10 md:py-12 text-center">
                {title && (
                  <h1 className="text-5xl md:text-7xl font-serif font-normal mb-4">
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
