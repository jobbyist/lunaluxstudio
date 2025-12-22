// This is a simplified implementation that reads from a local JSON file
// In production, this would interface with GitHub API to read/write files

interface CMSContent {
  articles: Article[];
  products: Product[];
  settings: Setting[];
  analytics: AnalyticsEvent[];
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featured_image: string | null;
  status: 'draft' | 'published' | 'archived';
  meta_title: string | null;
  meta_description: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  status: 'draft' | 'active' | 'archived';
  featured_image: string | null;
  inventory_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface Setting {
  key: string;
  value: string | { [key: string]: string };
}

export interface AnalyticsEvent {
  id: string;
  event_name: string;
  event_data: any;
  created_at: string;
}

// In-memory cache
let contentCache: CMSContent | null = null;

// Fetch content from the JSON file
async function fetchContent(): Promise<CMSContent> {
  if (contentCache) {
    return contentCache;
  }

  try {
    const response = await fetch('/cms/content.json');
    if (!response.ok) {
      throw new Error('Failed to fetch content');
    }
    const data = await response.json();
    contentCache = data;
    return data;
  } catch (error) {
    console.error('Error fetching content:', error);
    // Return empty structure if file doesn't exist
    return {
      articles: [],
      products: [],
      settings: [],
      analytics: [],
    };
  }
}

// Save content back (in a real implementation, this would commit to GitHub)
async function saveContent(content: CMSContent): Promise<void> {
  contentCache = content;
  // In a real implementation, this would use GitHub API to commit changes
  // For now, we just update the cache
  console.log('Content saved to cache:', content);
}

// Articles API
export const articlesAPI = {
  async getAll(): Promise<Article[]> {
    const content = await fetchContent();
    return content.articles || [];
  },

  async getById(id: string): Promise<Article | null> {
    const content = await fetchContent();
    return content.articles.find((a) => a.id === id) || null;
  },

  async create(article: Omit<Article, 'id' | 'created_at' | 'updated_at'>): Promise<Article> {
    const content = await fetchContent();
    const newArticle: Article = {
      ...article,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    content.articles.push(newArticle);
    await saveContent(content);
    return newArticle;
  },

  async update(id: string, updates: Partial<Article>): Promise<Article> {
    const content = await fetchContent();
    const index = content.articles.findIndex((a) => a.id === id);
    if (index === -1) {
      throw new Error('Article not found');
    }
    content.articles[index] = {
      ...content.articles[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    await saveContent(content);
    return content.articles[index];
  },

  async delete(id: string): Promise<void> {
    const content = await fetchContent();
    content.articles = content.articles.filter((a) => a.id !== id);
    await saveContent(content);
  },

  async count(): Promise<number> {
    const content = await fetchContent();
    return content.articles.length;
  },
};

// Products API
export const productsAPI = {
  async getAll(): Promise<Product[]> {
    const content = await fetchContent();
    return content.products || [];
  },

  async getById(id: string): Promise<Product | null> {
    const content = await fetchContent();
    return content.products.find((p) => p.id === id) || null;
  },

  async create(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    const content = await fetchContent();
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    content.products.push(newProduct);
    await saveContent(content);
    return newProduct;
  },

  async update(id: string, updates: Partial<Product>): Promise<Product> {
    const content = await fetchContent();
    const index = content.products.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error('Product not found');
    }
    content.products[index] = {
      ...content.products[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    await saveContent(content);
    return content.products[index];
  },

  async delete(id: string): Promise<void> {
    const content = await fetchContent();
    content.products = content.products.filter((p) => p.id !== id);
    await saveContent(content);
  },

  async count(): Promise<number> {
    const content = await fetchContent();
    return content.products.length;
  },
};

// Settings API
export const settingsAPI = {
  async getAll(): Promise<Setting[]> {
    const content = await fetchContent();
    return content.settings || [];
  },

  async upsert(key: string, value: string | { [key: string]: string }): Promise<void> {
    const content = await fetchContent();
    const index = content.settings.findIndex((s) => s.key === key);
    if (index === -1) {
      content.settings.push({ key, value });
    } else {
      content.settings[index].value = value;
    }
    await saveContent(content);
  },
};

// Analytics API
export const analyticsAPI = {
  async count(since?: string): Promise<number> {
    const content = await fetchContent();
    if (!since) {
      return content.analytics.length;
    }
    const sinceDate = new Date(since);
    return content.analytics.filter((e) => new Date(e.created_at) >= sinceDate).length;
  },

  async create(event: Omit<AnalyticsEvent, 'id' | 'created_at'>): Promise<void> {
    const content = await fetchContent();
    const newEvent: AnalyticsEvent = {
      ...event,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    };
    content.analytics.push(newEvent);
    await saveContent(content);
  },
};
