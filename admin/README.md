# Admin CMS Documentation

## Overview

The LunaStudio Admin CMS provides a comprehensive content management system for managing articles, products, analytics, and site settings. The admin panel is accessible at `/admin` and requires admin authentication through `/admin-login`.

## Features

### 1. Dashboard
- Overview of key metrics (articles, products, events, users)
- Recent activity feed
- Quick action cards for creating content
- Access at: `/admin`

### 2. Articles Management
- Create, edit, and delete blog articles
- Rich content editor with markdown support
- SEO metadata management (meta title, meta description)
- Article status: draft, published, archived
- Tags and categorization
- Featured images support
- Access at: `/admin/articles`

### 3. Products Management
- Create, edit, and delete products
- Full product details (title, description, price)
- Multiple pricing options (price, compare at price)
- Inventory management
- Multiple images support
- Product categories and tags
- SEO metadata
- Product status: draft, active, archived
- Access at: `/admin/products`

### 4. Analytics
- Real-time analytics dashboard
- Page view tracking
- Event tracking system
- Unique visitor metrics
- Visual charts and graphs
- Date range filtering (7, 30, 90 days)
- Top pages analysis
- Access at: `/admin/analytics`

### 5. Site Settings
- General site configuration
- Contact information
- Social media links
- SEO settings
- Access at: `/admin/settings`

## Getting Started

### 1. Database Setup

First, apply the database migration to create the necessary tables:

```bash
# If using Supabase CLI locally
supabase db push

# Or apply the migration file directly in Supabase Studio
```

The migration creates the following tables:
- `admin_users` - Admin user permissions
- `articles` - Blog articles/content
- `cms_products` - CMS-managed products
- `analytics_events` - Analytics tracking
- `site_settings` - Site configuration

### 2. Create an Admin User

To grant admin access to a user, you need to add their user_id to the `admin_users` table:

**Option A: Using Supabase Studio**
1. Go to your Supabase project dashboard
2. Navigate to the Table Editor
3. Open the `admin_users` table
4. Click "Insert row"
5. Add the user's `user_id` (from the `auth.users` table)
6. Set role to 'admin', 'editor', or 'viewer'
7. Save

**Option B: Using SQL**
```sql
-- First, create an admin account through the Admin Login page (/admin-login)
-- Then get their user_id and run:
INSERT INTO admin_users (user_id, role)
VALUES ('user-uuid-here', 'admin');
```

### 3. Admin Roles

- **admin**: Full access to all features, can manage other admins
- **editor**: Can create and manage content (articles, products)
- **viewer**: Read-only access to dashboard and analytics

### 4. Access the Admin Panel

1. Create an admin account at `/admin-login`
2. Have your account added to the `admin_users` table with admin role
3. Navigate to `/admin-login` to sign in
4. You will be automatically redirected to `/admin` dashboard after authentication

## Usage Guide

### Creating Articles

1. Navigate to `/admin/articles`
2. Click "New Article"
3. Fill in the article details:
   - **Title**: Main article title
   - **Slug**: URL-friendly version (auto-generated)
   - **Excerpt**: Short summary
   - **Content**: Full article content
   - **Featured Image**: URL to hero image
   - **Tags**: Comma-separated tags
   - **Status**: Draft, Published, or Archived
   - **SEO Settings**: Meta title and description
4. Click "Save Article"

### Creating Products

1. Navigate to `/admin/products`
2. Click "New Product"
3. Fill in the product details:
   - **Basic Info**: Title, slug, description
   - **Pricing**: Price, compare at price, currency
   - **Inventory**: SKU, quantity
   - **Images**: Featured image and additional images
   - **Organization**: Category, tags
   - **Status**: Draft, Active, or Archived
   - **SEO Settings**: Meta title and description
4. Click "Save Product"

### Tracking Analytics

Analytics are automatically tracked when users interact with your site. The system captures:
- Page views
- User sessions
- Event types
- Referrers
- User agents

View analytics at `/admin/analytics` with:
- Date range filters
- Visual charts
- Top pages ranking
- Unique visitor counts

### Managing Settings

Update site-wide settings at `/admin/settings`:
- Site name and description
- Contact email
- Social media URLs (Instagram, Facebook, Twitter)

All settings are stored in the `site_settings` table and can be accessed throughout your application.

## Development

### Adding New Event Tracking

To track custom events in your application:

```typescript
import { supabase } from '@/integrations/supabase/client';

const trackEvent = async (eventType: string, eventData?: any) => {
  await supabase.from('analytics_events').insert({
    event_type: eventType,
    event_data: eventData,
    page_url: window.location.href,
    referrer: document.referrer,
    user_agent: navigator.userAgent,
    session_id: getSessionId(), // Implement your session logic
  });
};

// Usage
await trackEvent('button_click', { button_id: 'checkout' });
await trackEvent('product_view', { product_id: 'prod-123' });
```

### Accessing Site Settings

To use site settings in your components:

```typescript
import { supabase } from '@/integrations/supabase/client';

const { data: settings } = await supabase
  .from('site_settings')
  .select('*');

const settingsObj = settings?.reduce((acc, item) => {
  acc[item.key] = item.value;
  return acc;
}, {});

console.log(settingsObj.site_name);
console.log(settingsObj.social_media.instagram);
```

## Security

- All admin routes are protected by Row Level Security (RLS)
- Only users in the `admin_users` table can access admin features
- Authentication is required for all admin operations
- Role-based permissions control what actions users can perform

## Troubleshooting

### "Not authorized" error
- Ensure your user account is added to the `admin_users` table
- Check that your user_id matches the one in `auth.users`
- Verify RLS policies are enabled

### Cannot see analytics data
- Check that analytics events are being tracked
- Verify the date range selection
- Ensure you have data within the selected period

### Settings not saving
- Verify you have 'admin' role (not just 'editor' or 'viewer')
- Check browser console for error messages
- Ensure Supabase connection is active

## Future Enhancements

Potential features for future development:
- File upload support (images, documents)
- Rich text WYSIWYG editor
- Media library management
- User management interface
- Email notification system
- Content scheduling
- Multi-language support
- Advanced analytics with funnels
- A/B testing capabilities
- SEO audit tools

## Support

For questions or issues:
1. Check the Supabase dashboard for errors
2. Review browser console for client-side errors
3. Verify database migrations were applied correctly
4. Check RLS policies in Supabase
