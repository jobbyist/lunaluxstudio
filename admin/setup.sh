#!/bin/bash

# Admin CMS Setup Script
# This script helps you set up the admin CMS for LunaStudio

echo "======================================"
echo "LunaStudio Admin CMS Setup"
echo "======================================"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "Please create a .env file with your Supabase credentials:"
    echo ""
    echo "VITE_SUPABASE_URL=your_supabase_url"
    echo "VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key"
    echo ""
    exit 1
fi

echo "✅ Environment file found"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "ℹ️  Supabase CLI not found. You can install it with:"
    echo "   npm install -g supabase"
    echo ""
    echo "Or apply the migration manually in Supabase Studio:"
    echo "   1. Go to your Supabase dashboard"
    echo "   2. Navigate to SQL Editor"
    echo "   3. Copy the contents of supabase/migrations/20251222000000_admin_cms_schema.sql"
    echo "   4. Execute the SQL"
    echo ""
else
    echo "✅ Supabase CLI found"
    echo ""
    
    # Ask if user wants to push migrations
    read -p "Do you want to push database migrations now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Pushing migrations..."
        supabase db push
        if [ $? -eq 0 ]; then
            echo "✅ Migrations applied successfully"
        else
            echo "❌ Failed to apply migrations"
            echo "Please apply them manually in Supabase Studio"
        fi
    fi
fi

echo ""
echo "======================================"
echo "Next Steps:"
echo "======================================"
echo ""
echo "1. Create a user account:"
echo "   - Run: npm run dev"
echo "   - Navigate to: http://localhost:5173/auth"
echo "   - Create an account with your email"
echo ""
echo "2. Grant admin access:"
echo "   - Go to Supabase Dashboard > Table Editor"
echo "   - Open the 'admin_users' table"
echo "   - Insert a new row with:"
echo "     • user_id: (your user ID from auth.users table)"
echo "     • role: 'admin'"
echo ""
echo "3. Access the admin panel:"
echo "   - Navigate to: http://localhost:5173/admin"
echo ""
echo "For detailed documentation, see: admin/README.md"
echo ""
echo "======================================"
echo "Setup Complete! 🎉"
echo "======================================"
