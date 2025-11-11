# Hosting Compatibility Guide

This CMS system is designed to work on **any hosting platform**, with automatic detection and appropriate fallbacks.

## How It Works

### ✅ Traditional Hosting (VPS, Shared Hosting, Dedicated Servers)
- **File System**: Writable
- **CMS Data**: Stored in `/data/cms-data.json` (automatically saved)
- **Images**: Stored as base64 data URLs in the JSON file
- **Status**: ✅ **Fully Functional** - No additional setup required

### ⚠️ Serverless Hosting (Vercel, Netlify, AWS Lambda, etc.)
- **File System**: Read-only (cannot write files)
- **CMS Data**: Requires a database or cloud storage
- **Images**: Stored as base64 data URLs (works everywhere)
- **Status**: ⚠️ **Requires Database Setup** - See below

## Automatic Detection

The system automatically detects the hosting environment:

1. **Tries to write to filesystem first** (works on traditional hosting)
2. **If write fails**, detects read-only filesystem
3. **Shows helpful error message** with suggestions for database setup

## Error Messages

If you see an error like:
> "This hosting platform uses a read-only file system..."

This means you're on serverless hosting and need to set up a database.

## Solutions for Serverless Hosting

### Option 1: Supabase (Recommended - Free Tier Available)
1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Create a table for CMS data
4. Update API routes to use Supabase instead of filesystem

### Option 2: Vercel KV (For Vercel Hosting)
1. Add Vercel KV to your Vercel project
2. Update API routes to use Vercel KV
3. Store CMS data in key-value format

### Option 3: MongoDB Atlas (Free Tier Available)
1. Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get connection string
4. Update API routes to use MongoDB

### Option 4: Traditional Hosting
- Deploy to a VPS (DigitalOcean, Linode, etc.)
- Use shared hosting (cPanel, etc.)
- No database setup needed - works out of the box!

## Image Uploads

✅ **Works on ALL hosting platforms** - Images are converted to base64 and stored directly in the JSON file.

- **Max file size**: 2MB (to keep JSON manageable)
- **Formats**: JPEG, PNG, WEBP, GIF
- **No external storage needed** for images

## Current Status

- ✅ **Toast messages** - All alerts replaced with toast notifications
- ✅ **Image uploads** - Work on any hosting (base64 encoding)
- ✅ **Error handling** - Clear messages for different hosting types
- ✅ **Automatic detection** - Detects hosting environment automatically

## Recommendations

### For Development
- Use traditional hosting or local development
- No database setup needed

### For Production (Serverless)
- Set up Supabase (easiest, free tier)
- Or use Vercel KV if on Vercel
- Or migrate to traditional hosting (VPS)

### For Production (Traditional Hosting)
- ✅ Works immediately - no setup needed!

## Need Help?

If you're on serverless hosting and need help setting up a database, contact your developer or refer to the hosting platform's documentation.
