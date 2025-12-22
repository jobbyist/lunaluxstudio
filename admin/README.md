# Admin CMS Documentation

## Overview

The LunaStudio Admin CMS provides a comprehensive content management system for managing articles, products, analytics, and site settings. The admin panel is accessible at `/admin` and uses file-based storage for content persistence.

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
- Inventory management
- Product status: draft, active, archived
- Access at: `/admin/products`

### 4. Analytics
- Analytics dashboard for tracking events
- Event count tracking
- File-based event storage
- Access at: `/admin/analytics`

### 5. Site Settings
- General site configuration
- Contact information
- Social media links
- Access at: `/admin/settings`

## Getting Started

### 1. Authentication

The admin system uses simple file-based authentication with hardcoded credentials:
- **Username**: `admin`
- **Password**: `Luna101$`

### 2. Content Storage

All content is stored in `public/cms/content.json` which contains:
- Articles array
- Products array
- Settings array
- Analytics events array

### 3. Access the Admin Panel

1. Navigate to `/admin/signin`
2. Enter credentials (username: `admin`, password: `Luna101$`)
3. You'll be redirected to `/admin` dashboard
4. Start managing your content!

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
   - **Pricing**: Price, currency
   - **Inventory**: Quantity
   - **Images**: Featured image
   - **Status**: Draft, Active, or Archived
4. Click "Save Product"

### Managing Settings

Update site-wide settings at `/admin/settings`:
- Site name and description
- Contact email
- Social media URLs (Instagram, Facebook, Twitter)

All settings are stored in the content file and accessible throughout your application.

## Development

### Content Persistence

The current implementation stores changes in memory during the session. For production use, you would:

1. Integrate with GitHub API to commit changes to `public/cms/content.json`
2. Implement proper authentication with real user accounts
3. Add conflict resolution for concurrent edits
4. Add backup and restore functionality

### Accessing Content in Components

To use content from the CMS in your components:

```typescript
import { articlesAPI, productsAPI, settingsAPI } from '@/lib/githubStorage';

// Get all articles
const articles = await articlesAPI.getAll();

// Get a specific article
const article = await articlesAPI.getById('article-id');

// Get all products
const products = await productsAPI.getAll();

// Get settings
const settings = await settingsAPI.getAll();
```

## Security

- Admin routes are protected by client-side authentication
- Login state is stored in browser localStorage
- Only authenticated users can access admin features
- For production, implement server-side authentication and authorization

## Troubleshooting

### Cannot access admin panel
- Ensure you're using the correct credentials (admin / Luna101$)
- Check that localStorage is enabled in your browser
- Try clearing browser cache and signing in again

### Changes not persisting
- The current implementation stores changes in memory
- Refreshing the page will load the original content from the JSON file
- For persistence, integrate with GitHub API or backend storage

## Future Enhancements

Potential features for future development:
- GitHub API integration for persisting changes
- File upload support (images, documents)
- Rich text WYSIWYG editor
- Media library management
- Real user management
- Email notification system
- Content scheduling
- Multi-language support
- Advanced analytics with charts
- SEO audit tools

## Support

For questions or issues:
1. Check browser console for client-side errors
2. Verify the content.json file is properly formatted
3. Ensure all required fields are filled in when creating content

