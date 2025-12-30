# Quick Start: GitHub Pages Deployment

## 🚀 What's Already Configured

✅ **CNAME File**: Custom domain `lunaluxhair.com` is set
✅ **GitHub Actions**: Workflow deploys on every push to `main`
✅ **Build Config**: Vite configured with correct base path
✅ **Deployment Artifact**: Uploads `dist` folder to GitHub Pages

## 📋 What You Need to Do

### 1. Enable GitHub Pages (Repository Owner)
```
Repository Settings → Pages → Source → Select "GitHub Actions"
```

### 2. Set Custom Domain (Repository Owner)
```
Repository Settings → Pages → Custom domain → Enter: lunaluxhair.com
```

### 3. Configure DNS (Domain Owner)
Add A records to your DNS provider for the apex domain:

| Type | Name | Value                | TTL  |
|------|------|----------------------|------|
| A    | @    | 185.199.108.153      | 3600 |
| A    | @    | 185.199.109.153      | 3600 |
| A    | @    | 185.199.110.153      | 3600 |
| A    | @    | 185.199.111.153      | 3600 |

**Optional: Add www subdomain**
| Type  | Name | Value              | TTL  |
|-------|------|--------------------|------|
| CNAME | www  | jobbyist.github.io | 3600 |

**Popular DNS Providers:**
- **Cloudflare**: DNS → Add Record
- **Namecheap**: Domain List → Manage → Advanced DNS
- **GoDaddy**: DNS Management → Add Record
- **Google Domains**: DNS → Custom Records

### 4. Wait for DNS Propagation
- Usually takes 5-30 minutes
- Can take up to 24 hours in rare cases
- Check status: https://dnschecker.org

### 5. Enable HTTPS (After DNS Verification)
```
Repository Settings → Pages → Enforce HTTPS (checkbox)
```

## 🔄 How Deployments Work

1. **Push to `main` branch**
   ```bash
   git push origin main
   ```

2. **GitHub Actions automatically:**
   - Installs dependencies
   - Builds the React app
   - Deploys to GitHub Pages

3. **Site is live at:**
   ```
   https://lunaluxhair.com
   ```

## 👀 Monitor Deployments

**View Status:**
- Repository → Actions tab → Latest workflow run

**View Site:**
- https://lunaluxhair.com
- https://jobbyist.github.io/lunastudio (fallback)

## 🛠️ Local Testing

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## 🔍 Troubleshooting

### Deployment Failed
- Check Actions tab for error logs
- Verify all dependencies are in `package.json`
- Ensure `package-lock.json` is committed

### Custom Domain Not Working
- Verify DNS CNAME record is correct
- Wait for DNS propagation
- Check GitHub Pages settings show "DNS check successful"

### Site Shows 404
- Ensure GitHub Pages source is "GitHub Actions"
- Verify workflow completed successfully
- Check CNAME file exists in `public/` directory

### HTTPS Certificate Pending
- Wait a few minutes after DNS verification
- GitHub automatically provisions certificates
- Don't enable "Enforce HTTPS" until ready

## 📞 Need Help?

1. Check full documentation: `DEPLOYMENT_SETUP.md`
2. GitHub Pages docs: https://docs.github.com/pages
3. Repository maintainer: @jobbyist

## 🎯 Quick Commands

```bash
# Check if CNAME exists
cat public/CNAME

# Build and check output
npm run build && ls -la dist/CNAME

# View workflow file
cat .github/workflows/deploy.yml

# Check git status
git status

# Push changes
git add .
git commit -m "Your message"
git push origin main
```

## ⚡ Fast Track Setup (5 minutes)

1. **Enable Pages**: Settings → Pages → GitHub Actions
2. **Set Domain**: Settings → Pages → lunaluxhair.com
3. **Configure DNS**: Add A records → @ → GitHub Pages IPs (see step 3 above)
4. **Wait**: 5-30 minutes for DNS
5. **Enable HTTPS**: Settings → Pages → Enforce HTTPS
6. **Done!** Visit https://lunaluxhair.com

---

**Current Status**: ✅ Repository configured and ready for deployment
**Next Step**: Enable GitHub Pages in repository settings
