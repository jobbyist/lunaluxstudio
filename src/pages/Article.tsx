import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/PageLayout";

interface ArticleData {
  slug: string;
  title: string;
  description: string;
  topic: string;
  coverImage: string;
  content: React.ReactNode;
  publishDate: string;
  readTime: string;
  externalLink?: string;
}

const articles: Record<string, ArticleData> = {
  "lunaluxhair-rebrand-launch": {
    slug: "lunaluxhair-rebrand-launch",
    title: "Introducing the New LunaLuxHair: A Fresh Look, Same Luxurious Quality",
    description: "We're thrilled to announce the official launch of our rebranded platform, designed to elevate your hair shopping experience.",
    topic: "Announcement",
    coverImage: "/lunahero.gif",
    publishDate: "January 6, 2025",
    readTime: "3 min read",
    externalLink: "https://www.tiktok.com/@cindykhan_/video/7568901914721570068",
    content: (
      <>
        <p className="text-lg text-muted-foreground mb-6">
          After months of dedication and creativity, we are beyond excited to unveil the new LunaLuxHair platform. This rebrand represents not just a visual transformation, but a renewed commitment to providing you with the finest quality hair extensions, wigs, and hair care products.
        </p>
        <h2 className="text-2xl font-serif mb-4">What's New?</h2>
        <p className="text-muted-foreground mb-6">
          Our new website features a sleek, modern design that makes finding your perfect hair match easier than ever. With improved navigation, detailed product descriptions, and an enhanced shopping experience, we've put your needs at the forefront of everything we do.
        </p>
        <h2 className="text-2xl font-serif mb-4">Same Quality, Elevated Experience</h2>
        <p className="text-muted-foreground mb-6">
          While our look has changed, our commitment to 100% virgin human hair and premium quality remains unwavering. Every bundle, closure, and wig in our collection meets our rigorous standards for softness, durability, and natural appearance.
        </p>
        <h2 className="text-2xl font-serif mb-4">Watch Our Launch Announcement</h2>
        <p className="text-muted-foreground mb-6">
          Check out our official launch video on TikTok to see the new LunaLuxHair in action and hear directly from our founder about this exciting new chapter.
        </p>
      </>
    ),
  },
  "ultimate-wig-care-guide": {
    slug: "ultimate-wig-care-guide",
    title: "The Ultimate Guide to Wig Care: Keep Your Investment Looking Flawless",
    description: "Learn professional tips and tricks to maintain your wig's longevity, shine, and natural movement for months to come.",
    topic: "Hair Care",
    coverImage: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800",
    publishDate: "January 4, 2025",
    readTime: "5 min read",
    content: (
      <>
        <p className="text-lg text-muted-foreground mb-6">
          Investing in a quality wig is just the beginning. With proper care, your wig can maintain its beautiful appearance for 12-18 months or even longer. Here's your comprehensive guide to wig maintenance.
        </p>
        <h2 className="text-2xl font-serif mb-4">Washing Your Wig</h2>
        <p className="text-muted-foreground mb-6">
          Use lukewarm water and sulfate-free shampoo designed for human hair. Gently work the shampoo through the hair in a downward motion, never scrubbing or twisting. Rinse thoroughly and follow with a moisturizing conditioner, avoiding the lace area.
        </p>
        <h2 className="text-2xl font-serif mb-4">Detangling Tips</h2>
        <p className="text-muted-foreground mb-6">
          Always detangle your wig before and after washing. Start from the ends and work your way up using a wide-tooth comb or a specialized wig brush. Never brush a wet wig as this can cause breakage and frizz.
        </p>
        <h2 className="text-2xl font-serif mb-4">Storage Matters</h2>
        <p className="text-muted-foreground mb-6">
          When not wearing your wig, store it on a wig stand or mannequin head to maintain its shape. Keep it away from direct sunlight and dust. If storing for extended periods, place it in a silk or satin bag.
        </p>
        <h2 className="text-2xl font-serif mb-4">Heat Styling</h2>
        <p className="text-muted-foreground mb-6">
          While our human hair wigs can handle heat styling, always use a heat protectant spray first. Keep temperatures below 350°F (175°C) and avoid excessive heat application to extend your wig's lifespan.
        </p>
      </>
    ),
  },
  "choosing-perfect-hair-texture": {
    slug: "choosing-perfect-hair-texture",
    title: "How to Choose the Perfect Hair Texture for Your Lifestyle",
    description: "From sleek straight to bouncy curls, discover which hair texture complements your daily routine and personal style.",
    topic: "Style Guide",
    coverImage: "https://images.unsplash.com/photo-1595959183082-7b570b7e08e2?w=800",
    publishDate: "December 28, 2024",
    readTime: "4 min read",
    content: (
      <>
        <p className="text-lg text-muted-foreground mb-6">
          Choosing the right hair texture is essential for achieving a look that feels natural and suits your lifestyle. Whether you're a busy professional or a style chameleon, there's a perfect texture waiting for you.
        </p>
        <h2 className="text-2xl font-serif mb-4">Straight Hair</h2>
        <p className="text-muted-foreground mb-6">
          Ideal for those who love sleek, polished looks. Straight hair is low-maintenance, versatile, and perfect for professional settings. It can also be easily curled for special occasions.
        </p>
        <h2 className="text-2xl font-serif mb-4">Body Wave</h2>
        <p className="text-muted-foreground mb-6">
          The perfect middle ground between straight and curly. Body wave adds volume and movement without requiring much styling effort. It's our most popular texture for a reason—it suits almost everyone!
        </p>
        <h2 className="text-2xl font-serif mb-4">Deep Wave & Curly</h2>
        <p className="text-muted-foreground mb-6">
          For those who love dramatic, voluminous looks. These textures make a statement and blend beautifully with natural curly hair. They require a bit more maintenance but deliver stunning results.
        </p>
        <h2 className="text-2xl font-serif mb-4">Consider Your Natural Hair</h2>
        <p className="text-muted-foreground mb-6">
          For the most seamless blend, choose a texture similar to your natural hair when straightened or styled. This ensures your extensions move naturally with your own hair.
        </p>
      </>
    ),
  },
  "frontal-vs-closure": {
    slug: "frontal-vs-closure",
    title: "Frontal vs. Closure: Which One Is Right for You?",
    description: "Understand the key differences between lace frontals and closures to make the best choice for your next install.",
    topic: "Education",
    coverImage: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800",
    publishDate: "December 20, 2024",
    readTime: "4 min read",
    content: (
      <>
        <p className="text-lg text-muted-foreground mb-6">
          One of the most common questions we receive is about the difference between frontals and closures. Both serve to protect your natural hair and create a seamless look, but they have distinct advantages.
        </p>
        <h2 className="text-2xl font-serif mb-4">Lace Closures</h2>
        <p className="text-muted-foreground mb-6">
          Closures typically measure 4x4, 5x5, or 6x6 inches and are placed at the top of your head. They're perfect for simple, center or side parts. Closures are more affordable, easier to install, and require less maintenance than frontals.
        </p>
        <h2 className="text-2xl font-serif mb-4">Lace Frontals</h2>
        <p className="text-muted-foreground mb-6">
          Frontals span from ear to ear (typically 13x4 or 13x6 inches) and cover your entire hairline. They offer maximum versatility—you can part your hair anywhere, pull it back, or style it off your face. Perfect for those who love changing up their look.
        </p>
        <h2 className="text-2xl font-serif mb-4">Making Your Choice</h2>
        <p className="text-muted-foreground mb-6">
          Choose a closure if: you prefer a consistent part, want easier maintenance, or are new to sew-in installations. Choose a frontal if: you love versatility, want to pull your hair back, or desire the most natural-looking hairline possible.
        </p>
      </>
    ),
  },
  "protective-styling-benefits": {
    slug: "protective-styling-benefits",
    title: "The Hidden Benefits of Protective Styling with Extensions",
    description: "Discover how wearing wigs and extensions can actually promote natural hair growth and health.",
    topic: "Hair Health",
    coverImage: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800",
    publishDate: "December 15, 2024",
    readTime: "3 min read",
    content: (
      <>
        <p className="text-lg text-muted-foreground mb-6">
          Many people think of wigs and extensions purely as styling tools, but they offer incredible benefits for your natural hair's health and growth. Here's why protective styling should be part of your hair care routine.
        </p>
        <h2 className="text-2xl font-serif mb-4">Reduced Manipulation</h2>
        <p className="text-muted-foreground mb-6">
          Constant styling, brushing, and heat application can damage your natural hair over time. When wearing a wig or protective style, your natural hair stays safely tucked away, minimizing daily manipulation and breakage.
        </p>
        <h2 className="text-2xl font-serif mb-4">Moisture Retention</h2>
        <p className="text-muted-foreground mb-6">
          Under your wig, your natural hair can be moisturized and sealed without exposure to environmental stressors. This creates an optimal environment for growth and helps prevent dry, brittle ends.
        </p>
        <h2 className="text-2xl font-serif mb-4">Length Retention</h2>
        <p className="text-muted-foreground mb-6">
          By protecting your ends—the oldest and most fragile part of your hair—from friction and damage, you'll notice significant length retention over time. Many women have grown their hair dramatically while wearing protective styles.
        </p>
        <h2 className="text-2xl font-serif mb-4">Stress-Free Styling</h2>
        <p className="text-muted-foreground mb-6">
          Instead of daily heat styling and manipulation, you can achieve gorgeous looks effortlessly. This gives your natural hair a break while still allowing you to express your personal style.
        </p>
      </>
    ),
  },
};

const Article = () => {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? articles[slug] : null;

  if (!article) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-serif mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-8">The article you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/">Return Home</Link>
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <article className="min-h-screen">
        {/* Hero Section */}
        <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 -mt-32 relative z-10">
          <motion.div
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>

            <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm rounded-full mb-4">
              {article.topic}
            </span>

            <h1 className="text-3xl md:text-5xl font-serif mb-6 leading-tight">
              {article.title}
            </h1>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {article.publishDate}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {article.readTime}
              </span>
            </div>

            <div className="bg-card rounded-2xl p-8 md:p-12 shadow-lg">
              <p className="text-xl text-muted-foreground mb-8 font-medium">
                {article.description}
              </p>

              <div className="prose prose-lg max-w-none">
                {article.content}
              </div>

              {article.externalLink && (
                <div className="mt-8 pt-8 border-t border-border">
                  <Button asChild size="lg" className="gap-2">
                    <a
                      href={article.externalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Watch on TikTok
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              )}
            </div>

            <div className="text-center mt-12 mb-20">
              <Button asChild variant="outline" size="lg">
                <Link to="/articles">Explore More Articles</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </article>
    </PageLayout>
  );
};

export default Article;