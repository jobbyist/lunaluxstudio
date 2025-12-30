# GitHub Pages Deployment Setup

## Overview
This repository is configured to automatically deploy to GitHub Pages with a custom domain `lunaluxhair.com` using GitHub Actions.

## Current Configuration

### Build Setup
- **Build Tool**: Vite 5.4.19
- **Framework**: React with TypeScript
- **Output Directory**: `./dist`
- **Base Path**: `/` (configured for custom domain)

### GitHub Actions Workflow
Location: `.github/workflows/deploy.yml`

**Triggers:**
- Push to `main` branch
- Manual workflow dispatch

**Process:**
1. **Build Job**
   - Checks out code
   - Sets up Node.js 20
   - Installs dependencies with `npm ci`
   - Builds project with `npm run build`
   - Uploads `dist` directory as artifact

2. **Deploy Job**
   - Depends on build job completion
   - Deploys artifact to GitHub Pages
   - Sets deployment URL

### Custom Domain Configuration

**CNAME File**: `public/CNAME`
```
lunaluxhair.com
```

This file is automatically copied to the `dist` directory during build and deployed with the site.

## GitHub Repository Settings

To complete the deployment setup, configure the following in your GitHub repository:

### 1. Enable GitHub Pages
1. Go to repository **Settings** → **Pages**
2. Under "Source", select **GitHub Actions**
3. Save the configuration

### 2. Configure Custom Domain
1. In **Settings** → **Pages**
2. Under "Custom domain", enter: `lunaluxhair.com`
3. Click **Save**
4. Wait for DNS check to complete
5. Once DNS is verified, enable **Enforce HTTPS**

### 3. Required Permissions
The workflow already has the necessary permissions configured:
```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

## DNS Configuration

To complete the setup, configure DNS records with your domain provider:

### Option 1: A Records (Required for apex domain)
For the apex domain (lunaluxhair.com), use A records pointing to GitHub Pages IPs:

```
Type: A
Name: @ (or leave blank for apex domain)
Value: 185.199.108.153
TTL: 3600
```

Additional A records (add all four):
- 185.199.109.153
- 185.199.110.153
- 185.199.111.153

### Option 2: CNAME Record (Optional for www subdomain)
To also support www.lunaluxhair.com, add a CNAME record:

```
Type: CNAME
Name: www
Value: jobbyist.github.io
TTL: 3600 (or your provider's default)
```

### AAAA Records (Optional - for IPv6)
```
Type: AAAA
Name: @ (or leave blank)
Value: 2606:50c0:8000::153
```

Additional AAAA records:
- 2606:50c0:8001::153
- 2606:50c0:8002::153
- 2606:50c0:8003::153

## Deployment Process

### Automatic Deployment
Every push to the `main` branch triggers automatic deployment:

1. Code is pushed to `main` branch
2. GitHub Actions workflow starts automatically
3. Build job compiles the React application
4. Deploy job publishes to GitHub Pages
5. Site is available at `https://lunaluxhair.com`

### Manual Deployment
To manually trigger deployment:

1. Go to repository **Actions** tab
2. Select "Deploy to GitHub Pages" workflow
3. Click **Run workflow**
4. Select `main` branch
5. Click **Run workflow** button

## Build Configuration Files

### vite.config.ts
```typescript
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: "/", // Root path for custom domain
}));
```

### package.json Scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

## Monitoring Deployments

### View Deployment Status
1. Go to repository **Actions** tab
2. Click on latest workflow run
3. View build and deploy job status
4. Check deployment URL in deploy job output

### View Deployment History
1. Go to **Settings** → **Pages**
2. View "Deployments" section
3. See history of all deployments

### Troubleshooting

**Build Failures:**
- Check Actions tab for error logs
- Verify `package-lock.json` is committed
- Ensure all dependencies are listed in `package.json`

**DNS Issues:**
- Verify CNAME record is correct
- Wait for DNS propagation (can take up to 24 hours)
- Use DNS checker tool: https://dnschecker.org

**404 Errors:**
- Check that CNAME file exists in `public/` directory
- Verify `base` in `vite.config.ts` is set to `/`
- Ensure GitHub Pages source is set to "GitHub Actions"

**HTTPS Issues:**
- Wait for GitHub to provision SSL certificate
- This can take a few minutes after DNS is verified
- Enable "Enforce HTTPS" only after certificate is ready

## Environment Variables

If your application uses environment variables:

1. **Public Variables**: Add to `.env` file (committed to repo)
   ```
   VITE_API_URL=https://api.example.com
   ```

2. **Secret Variables**: Add to GitHub Secrets
   - Go to **Settings** → **Secrets and variables** → **Actions**
   - Click **New repository secret**
   - Add required secrets
   - Reference in workflow with `${{ secrets.SECRET_NAME }}`

## Performance Optimization

Current build stats:
- Bundle size: ~988 KB (291 KB gzipped)
- Largest asset: product-placeholder.webp (2.2 MB)

**Recommendations:**
1. Optimize images before deployment
2. Use WebP format for images (already implemented)
3. Implement code splitting for large bundles
4. Consider lazy loading for routes

## Testing Deployment Locally

To test the production build locally:

```bash
# Build the project
npm run build

# Preview the build
npm run preview

# Or use a static server
npx serve dist
```

Then visit: http://localhost:4173 (or the port shown)

## Rollback Process

If a deployment causes issues:

1. Go to **Actions** tab
2. Find the last successful deployment
3. Click **Re-run jobs**
4. Or revert the commit and push to main

## Next Steps

1. ✅ CNAME file created with correct domain
2. ✅ GitHub Actions workflow configured
3. ✅ Build process includes CNAME
4. ⏳ Configure DNS records with domain provider
5. ⏳ Enable GitHub Pages in repository settings
6. ⏳ Set custom domain in Pages settings
7. ⏳ Enable HTTPS after DNS verification

## Support

For issues with:
- **GitHub Pages**: https://docs.github.com/pages
- **Custom Domains**: https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site
- **GitHub Actions**: https://docs.github.com/actions

## Security

- All secrets should be stored in GitHub Secrets
- Never commit API keys or sensitive data
- HTTPS is enforced for custom domain
- Regular dependency updates recommended
