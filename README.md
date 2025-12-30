# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/29527315-b618-45f3-b80b-eb898100345f

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/29527315-b618-45f3-b80b-eb898100345f) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (Authentication & Database)

## Admin CMS

This project includes a comprehensive Admin Content Management System (CMS) for managing your website content without editing code.

### Features

- 📝 **Articles Management** - Create, edit, and delete blog articles
- 📦 **Products Management** - Manage product catalog with pricing and inventory
- 📊 **Analytics Dashboard** - Track page views, events, and user engagement
- ⚙️ **Site Settings** - Configure site-wide settings and social media links
- 🔐 **Role-Based Access** - Admin, editor, and viewer roles

### Quick Start

1. **Run the setup script:**
   ```bash
   ./admin/setup.sh
   ```

2. **Create an account:**
   - Navigate to `/auth` in your browser
   - Sign up with your email

3. **Grant admin access:**
   - Go to Supabase Dashboard → Table Editor
   - Open `admin_users` table
   - Insert your user_id with role='admin'

4. **Access admin panel:**
   - Navigate to `/admin`
   - Start managing your content!

For detailed documentation, see [admin/README.md](admin/README.md)

### Admin Routes

- `/admin` - Dashboard overview
- `/admin/articles` - Manage articles
- `/admin/products` - Manage products
- `/admin/analytics` - View analytics
- `/admin/settings` - Site settings

## How can I deploy this project?

This project is configured to automatically deploy to GitHub Pages with a custom domain.

### GitHub Pages Deployment

The project uses GitHub Actions to automatically build and deploy to GitHub Pages whenever changes are pushed to the `main` branch.

**Custom Domain**: https://lunaluxhair.com

#### Deployment Setup

The deployment is configured through:
- `.github/workflows/deploy.yml` - GitHub Actions workflow for automated deployment
- `public/CNAME` - Custom domain configuration (`lunaluxhair.com`)
- `vite.config.ts` - Vite build configuration with proper base path

For detailed deployment documentation, see:
- **Full Guide**: [DEPLOYMENT_SETUP.md](DEPLOYMENT_SETUP.md)
- **Quick Start**: [QUICKSTART_DEPLOYMENT.md](QUICKSTART_DEPLOYMENT.md)

#### Automatic Deployment

Every push to `main` branch automatically:
1. Builds the React application
2. Deploys to GitHub Pages
3. Makes the site live at https://lunaluxhair.com

#### Manual Deployment

To manually trigger a deployment:
1. Go to the "Actions" tab in your GitHub repository
2. Select the "Deploy to GitHub Pages" workflow
3. Click "Run workflow"

#### First-Time Setup

To enable GitHub Pages for this repository:
1. Go to your repository Settings
2. Navigate to "Pages" in the left sidebar
3. Under "Build and deployment", select "GitHub Actions" as the source
4. Under "Custom domain", enter: `lunaluxhair.com`
5. Configure your DNS settings (add A records for apex domain):
   - Add 4 A records: `@` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - Optionally add CNAME for www: `www` → `jobbyist.github.io`
6. Wait for DNS verification (5-30 minutes)
7. Enable "Enforce HTTPS" once verified

**Alternative: Lovable Deployment**

You can also deploy using [Lovable](https://lovable.dev/projects/29527315-b618-45f3-b80b-eb898100345f) by clicking Share -> Publish.

To connect a domain via Lovable, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
