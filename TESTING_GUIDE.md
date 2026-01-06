# Testing Guide for Homepage Editor & Navigation Menu

## Overview
This document provides instructions for testing the homepage editor and navigation menu functionality.

## Pre-requisites
1. Ensure Supabase migrations have been applied
2. Have admin access to the dashboard (via `/manage-login`)
3. Clear browser cache before testing

## Test Scenarios

### 1. Homepage Editor Tests

#### Test 1.1: View All Homepage Sections
1. Navigate to `/manage/homepage`
2. **Expected**: All homepage sections should be visible:
   - Hero Section
   - Collections
   - Categories (may be hidden)
   - Main Character Collection
   - Featured Products
   - Featured Stories
   - Newsletter

#### Test 1.2: Edit Hero Section Content
1. In the Hero Section card, modify the title field
2. Click "Save Changes"
3. Navigate to the homepage (`/`)
4. **Expected**: The hero title should reflect your changes

#### Test 1.3: Toggle Section Visibility
1. In HomepageEditor, toggle the visibility switch for "Newsletter" section
2. Navigate to the homepage
3. **Expected**: Newsletter section should disappear
4. Return to editor and toggle visibility back on
5. **Expected**: Newsletter section should reappear

#### Test 1.4: AI Content Edit (if configured)
1. In any section, enter a prompt like "Make the title more engaging"
2. Click the AI button
3. **Expected**: Content should update with AI-generated text
4. Click "Save Changes"
5. Verify changes on the homepage

### 2. Navigation Menu Tests

#### Test 2.1: View Navigation Menu Items
1. Navigate to `/manage/navigation`
2. **Expected**: All navigation items should be listed:
   - Shop All
   - About
   - Explore
   - Contact
   - Loyalty Rewards
   - Leave A Review
   - Store Policies
   - Admin Dashboard

#### Test 2.2: Edit Menu Item
1. Modify the label of "Shop All" to "Shop Now"
2. Click "Save Changes"
3. Check the header navigation on the homepage
4. **Expected**: "Shop All" should now show as "Shop Now"
5. Revert the change back to "Shop All"

#### Test 2.3: Toggle Menu Item Visibility
1. Toggle visibility off for "Loyalty Rewards"
2. Check the navigation menu on the homepage
3. **Expected**: "Loyalty Rewards" should not appear in the menu
4. Toggle visibility back on
5. **Expected**: "Loyalty Rewards" should reappear

#### Test 2.4: Change Display Order
1. Change the display_order of "Contact" from 4 to 1
2. Save changes
3. Refresh the homepage
4. **Expected**: "Contact" should now appear first in the navigation
5. Reset display_order back to 4

#### Test 2.5: Mobile-Only/Desktop-Only
1. Set an item to "Mobile Only"
2. **Expected**: Item should only appear in mobile menu (resize browser to test)
3. Set an item to "Desktop Only"
4. **Expected**: Item should only appear in desktop navigation

### 3. Component Visibility Tests

#### Test 3.1: Hero Section Visibility
1. Set Hero section `is_visible` to `false` in database or editor
2. Refresh homepage
3. **Expected**: Hero section should not render
4. Set back to `true`

#### Test 3.2: Collections Section Visibility
1. Set Collections section `is_visible` to `false`
2. Refresh homepage
3. **Expected**: Collections section should not render

#### Test 3.3: All Sections Visibility
Repeat the above test for:
- Main Character Collection
- Featured Stories
- Newsletter
- Product Grid
- Categories (already hidden by default)

### 4. Database Integration Tests

#### Test 4.1: Real-time Updates (Navigation Menu)
1. Open homepage in one browser tab
2. Open `/manage/navigation` in another tab
3. Change a menu item label in the admin
4. **Expected**: Navigation should update automatically on homepage (within 1-2 seconds)

#### Test 4.2: Content Persistence
1. Edit multiple sections in homepage editor
2. Save changes
3. Close browser and reopen
4. Navigate to homepage
5. **Expected**: All changes should persist

### 5. Error Handling Tests

#### Test 5.1: Invalid Content
1. Try to set an empty label for a navigation item
2. Try to set an invalid path
3. **Expected**: Appropriate error messages should appear

#### Test 5.2: Network Error Simulation
1. Disconnect internet
2. Try to save changes
3. **Expected**: Error toast should appear
4. Reconnect internet
5. Try saving again
6. **Expected**: Changes should save successfully

## Component Coverage

### Components Updated with Database Integration:
✅ Hero.tsx
✅ Collections.tsx  
✅ MainCharacterCollection.tsx
✅ Newsletter.tsx
✅ FeaturedStories.tsx
✅ ProductGrid.tsx
✅ Categories.tsx

### Hooks Created:
✅ useHomepageSections.ts
✅ useNavigationMenu.ts

### Admin Pages Created:
✅ NavigationEditor.tsx

## Database Tables

### homepage_sections
- Contains: 7 sections (hero, collections, categories, main_character, product_grid, featured_stories, newsletter)
- RLS: Anyone can read visible sections, only admins can modify

### navigation_menu
- Contains: 8+ menu items
- RLS: Anyone can read visible items, only admins can modify
- Supports: parent_id for hierarchical menus (future use)

## Known Limitations

1. Drag-and-drop reordering is commented out (requires @dnd-kit installation)
2. Navigation menu icons must be valid Lucide icon names
3. Categories section is hidden by default and not currently editable
4. Real-time updates for homepage sections not yet implemented (only for navigation)

## Troubleshooting

### Changes not appearing on homepage?
1. Check that `is_visible` is set to `true` in database
2. Clear browser cache
3. Check browser console for errors
4. Verify Supabase connection is working

### Navigation menu not updating?
1. Check RLS policies in Supabase
2. Verify user has admin role
3. Check browser console for errors
4. Try refreshing the page

### Admin editor not loading?
1. Verify you're logged in as admin
2. Check that admin_emails table includes your email
3. Check that user_roles table has your user with 'admin' role
4. Check browser console for authentication errors

## Success Criteria

All tests should pass with:
- ✅ Content updates reflect on live homepage
- ✅ Navigation menu changes reflect immediately (or with page refresh)
- ✅ Visibility toggles work correctly
- ✅ No TypeScript or console errors
- ✅ Changes persist across browser sessions
- ✅ Mobile and desktop views work correctly
