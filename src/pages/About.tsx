import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCurrency } from "@/contexts/CurrencyContext";

const About = () => {
  const { t } = useCurrency();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <section className="text-center mb-20">
          <h1 className="font-heading text-5xl md:text-7xl font-bold text-foreground mb-6">
            {t('aboutTitle')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('aboutSubtitle')}
          </p>
        </section>

        {/* Brand Story */}
        <section className="mb-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-heading text-4xl font-bold text-foreground mb-6">
                {t('aboutStoryTitle')}
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>{t('aboutStoryPara1')}</p>
                <p>{t('aboutStoryPara2')}</p>
                <p>{t('aboutStoryPara3')}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img 
                src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=500&fit=crop" 
                alt="Luna Studio Story" 
                className="rounded-lg w-full h-64 object-cover"
              />
              <img 
                src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=500&fit=crop" 
                alt="Hair Extensions" 
                className="rounded-lg w-full h-64 object-cover mt-8"
              />
            </div>
          </div>
        </section>

        {/* Mission Statement */}
        <section className="mb-20 bg-card rounded-2xl p-12 text-center">
          <h2 className="font-heading text-4xl font-bold text-foreground mb-6">
            {t('aboutMissionTitle')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            {t('aboutMissionStatement')}
          </p>
        </section>

        {/* Photo Collage */}
        <section className="mb-20">
          <h2 className="font-heading text-4xl font-bold text-center text-foreground mb-12">
            {t('aboutGalleryTitle')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <img 
              src="https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=400&h=400&fit=crop" 
              alt="Gallery 1" 
              className="rounded-lg w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
            />
            <img 
              src="https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&h=400&fit=crop" 
              alt="Gallery 2" 
              className="rounded-lg w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
            />
            <img 
              src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=400&fit=crop" 
              alt="Gallery 3" 
              className="rounded-lg w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
            />
            <img 
              src="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop" 
              alt="Gallery 4" 
              className="rounded-lg w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
            />
            <img 
              src="https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&h=400&fit=crop" 
              alt="Gallery 5" 
              className="rounded-lg w-full h-48 object-cover hover:scale-105 transition-transform duration-300 md:col-span-2"
            />
            <img 
              src="https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&h=400&fit=crop" 
              alt="Gallery 6" 
              className="rounded-lg w-full h-48 object-cover hover:scale-105 transition-transform duration-300 md:col-span-2"
            />
          </div>
        </section>

        {/* Company Values */}
        <section className="mb-20">
          <h2 className="font-heading text-4xl font-bold text-center text-foreground mb-12">
            {t('aboutValuesTitle')}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card rounded-xl p-8 text-center hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-4">✨</div>
              <h3 className="font-elegant text-2xl font-bold text-foreground mb-4">
                {t('aboutValue1Title')}
              </h3>
              <p className="text-muted-foreground">
                {t('aboutValue1Desc')}
              </p>
            </div>
            <div className="bg-card rounded-xl p-8 text-center hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-4">🤝</div>
              <h3 className="font-elegant text-2xl font-bold text-foreground mb-4">
                {t('aboutValue2Title')}
              </h3>
              <p className="text-muted-foreground">
                {t('aboutValue2Desc')}
              </p>
            </div>
            <div className="bg-card rounded-xl p-8 text-center hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-4">🌿</div>
              <h3 className="font-elegant text-2xl font-bold text-foreground mb-4">
                {t('aboutValue3Title')}
              </h3>
              <p className="text-muted-foreground">
                {t('aboutValue3Desc')}
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
