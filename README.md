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

## How can I deploy this project?

This project is configured to automatically deploy to GitHub Pages with a custom domain.

### GitHub Pages Deployment

The project uses GitHub Actions to automatically build and deploy to GitHub Pages whenever changes are pushed to the `main` branch.

**Custom Domain**: https://lunalux.gravitas.uno

#### Deployment Setup

The deployment is configured through:
- `.github/workflows/deploy.yml` - GitHub Actions workflow for automated deployment
- `public/CNAME` - Custom domain configuration
- `vite.config.ts` - Vite build configuration with proper base path

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
4. Configure your custom domain DNS settings:
   - Add a CNAME record pointing `lunalux.gravitas.uno` to `<username>.github.io`

**Alternative: Lovable Deployment**

You can also deploy using [Lovable](https://lovable.dev/projects/29527315-b618-45f3-b80b-eb898100345f) by clicking Share -> Publish.

To connect a domain via Lovable, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
