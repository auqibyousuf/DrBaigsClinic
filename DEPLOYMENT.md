# Deployment Guide - Dr Baig's Clinic

This guide will help you deploy your website to Vercel and set up a Git repository.

## Prerequisites

- A GitHub account (or GitLab, Bitbucket, etc.)
- A Vercel account (free tier available)
- Git installed on your machine

## Step 1: Push to Git Repository

### Option A: Create a New GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `DrBaigsClinic` (or any name you prefer)
3. **Do NOT** initialize with README, .gitignore, or license
4. Copy the repository URL (e.g., `https://github.com/yourusername/DrBaigsClinic.git`)

### Option B: Use Existing Repository

If you already have a repository, use its URL.

### Push Your Code

Run these commands in your project directory:

```bash
cd /Users/auqib/code/personal/DrBaigsClinic

# Add remote repository (replace with your actual repository URL)
git remote add origin https://github.com/yourusername/DrBaigsClinic.git

# Push to GitHub
git branch -M main
git push -u origin main

# Push the version tag
git push origin v1.0.0
```

## Step 2: Deploy to Vercel

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Sign up/Login to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with your GitHub account (recommended)

2. **Import Your Project**
   - Click "Add New..." → "Project"
   - Import your GitHub repository (`DrBaigsClinic`)
   - Vercel will auto-detect Next.js settings

3. **Configure Environment Variables**
   - In the project settings, go to "Environment Variables"
   - Add the following:
     ```
     CMS_PASSWORD=your-secure-password-here
     CMS_AUTH_TOKEN=your-secure-token-here
     ```
   - **Important**: Use strong, unique values for production!
   - Click "Save"

4. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete (usually 2-3 minutes)
   - Your site will be live at `https://your-project-name.vercel.app`

### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd /Users/auqib/code/personal/DrBaigsClinic
   vercel
   ```
   - Follow the prompts
   - When asked about environment variables, add:
     - `CMS_PASSWORD`
     - `CMS_AUTH_TOKEN`

4. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Step 3: Configure Custom Domain (Optional)

1. In Vercel dashboard, go to your project → Settings → Domains
2. Add your custom domain (e.g., `drbaigsclinic.com`)
3. Follow Vercel's instructions to configure DNS records

## Step 4: Post-Deployment Checklist

- [ ] Test the website at your Vercel URL
- [ ] Test the admin panel at `https://your-site.vercel.app/admin`
- [ ] Verify environment variables are set correctly
- [ ] Upload your logo image to `/public/logo.png` (or update the logo URL in CMS)
- [ ] Test image uploads in the admin panel
- [ ] Update any hardcoded URLs in the codebase

## Environment Variables for Production

**Never commit these to Git!** Set them in Vercel:

```env
CMS_PASSWORD=YourStrongPassword123!
CMS_AUTH_TOKEN=GenerateWith: openssl rand -hex 32
```

## Troubleshooting

### Build Fails
- Check Vercel build logs for errors
- Ensure all dependencies are in `package.json`
- Verify Node.js version (Vercel uses Node 18+ by default)

### Admin Panel Not Working
- Verify environment variables are set in Vercel
- Check that cookies are enabled in your browser
- Ensure the API routes are accessible

### Images Not Loading
- Check that image URLs are correct
- Verify `/public/uploads/` directory exists
- For external images, ensure they're accessible

## Updating Your Site

After making changes:

```bash
# Make your changes
git add .
git commit -m "Description of changes"
git push origin main
```

Vercel will automatically redeploy your site when you push to the main branch.

## Version Tags

To create a new version:

```bash
git tag -a v1.1.0 -m "Version 1.1.0 - Description"
git push origin v1.1.0
```

## Support

For Vercel-specific issues, check:
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)

For Next.js issues:
- [Next.js Documentation](https://nextjs.org/docs)

