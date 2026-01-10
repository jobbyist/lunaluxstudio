import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { Calendar, Clock, ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

// Import new article images
import articleClosures from "@/assets/article-closures.jpg";
import articleFrontals from "@/assets/article-frontals.jpg";
import articleBundles from "@/assets/article-bundles.jpg";
import articleClipIns from "@/assets/article-clip-ins.jpg";
import articleTextures from "@/assets/article-textures.jpg";

interface ArticlePreview {
  slug: string;
  title: string;
  description: string;
  topic: string;
  coverImage: string;
  publishDate: string;
  readTime: string;
}

const articles: ArticlePreview[] = [
  {
    slug: "lunaluxhair-rebrand-launch",
    title: "Introducing the New LunaLuxHair: A Fresh Look, Same Luxurious Quality",
    description: "We're thrilled to announce the official launch of our rebranded platform, designed to elevate your hair shopping experience.",
    topic: "Announcement",
    coverImage: "/lunahero.gif",
    publishDate: "January 6, 2025",
    readTime: "3 min read",
  },
  {
    slug: "ultimate-wig-care-guide",
    title: "The Ultimate Guide to Wig Care: Keep Your Investment Looking Flawless",
    description: "Learn professional tips and tricks to maintain your wig's longevity, shine, and natural movement for months to come.",
    topic: "Hair Care",
    coverImage: articleClosures,
    publishDate: "January 4, 2025",
    readTime: "5 min read",
  },
  {
    slug: "choosing-perfect-hair-texture",
    title: "How to Choose the Perfect Hair Texture for Your Lifestyle",
    description: "From sleek straight to bouncy curls, discover which hair texture complements your daily routine and personal style.",
    topic: "Style Guide",
    coverImage: articleTextures,
    publishDate: "December 28, 2024",
    readTime: "4 min read",
  },
  {
    slug: "frontal-vs-closure",
    title: "Frontal vs. Closure: Which One Is Right for You?",
    description: "Understand the key differences between lace frontals and closures to make the best choice for your next install.",
    topic: "Education",
    coverImage: articleFrontals,
    publishDate: "December 20, 2024",
    readTime: "4 min read",
  },
  {
    slug: "protective-styling-benefits",
    title: "The Hidden Benefits of Protective Styling with Extensions",
    description: "Discover how wearing wigs and extensions can actually promote natural hair growth and health.",
    topic: "Hair Health",
    coverImage: articleBundles,
    publishDate: "December 15, 2024",
    readTime: "3 min read",
  },
];

const Articles = () => {
  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4 pt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
              <BookOpen className="h-4 w-4" />
              <span className="text-sm font-medium">Luna Journal</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-6">
              Articles & Guides
            </h1>
            <p className="text-muted-foreground text-lg">
              Expert tips, style guides, and hair care secrets to help you look 
              and feel your best. Discover the knowledge behind luxurious hair.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured Article */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link to={`/article/${articles[0].slug}`} className="group block">
              <div className="relative rounded-2xl overflow-hidden aspect-[21/9] bg-muted">
                <img
                  src={articles[0].coverImage}
                  alt={articles[0].title}
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                  <span className="inline-block px-3 py-1 bg-primary text-primary-foreground text-sm rounded-full mb-4">
                    {articles[0].topic}
                  </span>
                  <h2 className="text-2xl md:text-4xl font-serif text-white mb-4 group-hover:text-primary transition-colors">
                    {articles[0].title}
                  </h2>
                  <p className="text-white/80 max-w-2xl mb-4 hidden md:block">
                    {articles[0].description}
                  </p>
                  <div className="flex items-center gap-4 text-white/60 text-sm">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {articles[0].publishDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {articles[0].readTime}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-12 pb-20">
        <div className="container mx-auto px-4">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
          >
            {articles.slice(1).map((article) => (
              <motion.div
                key={article.slug}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <Link to={`/article/${article.slug}`} className="group block h-full">
                  <div className="bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 h-full flex flex-col">
                    <div className="aspect-[16/10] overflow-hidden">
                      <img
                        src={article.coverImage}
                        alt={article.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs rounded-full mb-3 w-fit">
                        {article.topic}
                      </span>
                      <h3 className="text-lg font-serif mb-3 group-hover:text-primary transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4 flex-grow line-clamp-2">
                        {article.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {article.publishDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {article.readTime}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Articles;
