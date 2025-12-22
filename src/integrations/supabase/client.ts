// Stub file - Supabase has been replaced with file-based storage
// This file exists only to prevent build errors for non-admin features
// that still reference Supabase (e.g., ChatBot, ProductCard wishlist/ratings)

// Create a mock supabase object that mimics the API but does nothing
export const supabase = {
  auth: {
    getUser: async () => ({ data: { user: null }, error: null }),
    signInWithPassword: async () => ({ data: null, error: new Error('Authentication disabled') }),
    signUp: async () => ({ data: null, error: new Error('Authentication disabled') }),
    signOut: async () => ({ error: null }),
  },
  from: (table: string) => ({
    select: () => ({
      eq: () => ({
        single: async () => ({ data: null, error: null }),
      }),
      order: () => ({
        limit: async () => ({ data: [], error: null }),
      }),
    }),
    insert: async () => ({ data: null, error: null }),
    update: () => ({
      eq: async () => ({ data: null, error: null }),
    }),
    delete: () => ({
      eq: async () => ({ data: null, error: null }),
    }),
  }),
  functions: {
    invoke: async () => ({ data: null, error: new Error('Functions disabled') }),
  },
};
