# Homepage Editor & Navigation Menu Sync

## Overview
This update synchronizes the admin homepage editor with the live homepage layout and adds a navigation menu editor.

## Changes Made

### 1. Database Schema Updates
- Added new homepage sections to match the actual homepage:
  - `hero` - Updated with all content fields
  - `collections` - Shop by collection section
  - `main_character` - Main Character Collection section
  - `product_grid` - Featured products section
  - `featured_stories` - Featured stories carousel
  - `newsletter` - Newsletter subscription section

- Created `navigation_menu` table for managing site navigation
  - Supports desktop-only, mobile-only, or both display options
  - Allows hierarchical menu structure (parent_id)
  - Icon support for menu items

### 2. Homepage Components
Updated the following components to read from database:
- `Hero.tsx` - Reads title, subtitle, CTA buttons, etc.
- `Collections.tsx` - Reads title and subtitle
- `MainCharacterCollection.tsx` - Reads title, subtitle, and CTA
- `Newsletter.tsx` - Reads title, subtitle, and privacy note
- `FeaturedStories.tsx` - Reads title

### 3. Admin Features
- Created `NavigationEditor.tsx` - Admin interface for managing navigation menu
- Added navigation menu link to admin sidebar
- Homepage editor automatically shows all sections from database

## Usage

### Editing Homepage Content
1. Navigate to `/manage/homepage` in the admin dashboard
2. All homepage sections are listed in order
3. Use the AI edit feature or manually edit content fields
4. Toggle visibility to show/hide sections
5. Save changes to update the live homepage

### Editing Navigation Menu
1. Navigate to `/manage/navigation` in the admin dashboard
2. View all navigation menu items
3. Edit labels, paths, and icons
4. Toggle visibility and device-specific display options
5. Save changes to update the site navigation

## Database Structure

### homepage_sections
- `section_key` - Unique identifier (hero, collections, etc.)
- `section_name` - Display name in admin
- `content` - JSON object with section-specific fields
- `is_visible` - Toggle visibility on homepage
- `display_order` - Order of appearance on homepage

### navigation_menu
- `label` - Display text for menu item
- `path` - Link destination
- `icon` - Lucide icon name (optional)
- `display_order` - Order in menu
- `is_visible` - Toggle visibility
- `is_mobile_only` - Show only on mobile
- `is_desktop_only` - Show only on desktop
- `parent_id` - For hierarchical menus (future use)

## Technical Details

### Hooks Created
- `useHomepageSections(sectionKey?)` - Fetches homepage sections
- `useNavigationMenu()` - Fetches navigation menu items with real-time updates

### Migration File
- `20260106211221_sync_homepage_navigation.sql` - Contains all database changes

## Future Enhancements
- Drag-and-drop reordering for sections
- Preview mode before publishing changes
- Version history for content changes
- A/B testing for different content variations
