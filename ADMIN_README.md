# CMS Admin Panel

This website now includes a Content Management System (CMS) that allows you to update all website content without touching code.

## Accessing the Admin Panel

1. Navigate to `/admin` in your browser
2. Enter the admin password (default: `admin123`)
3. You'll be redirected to the dashboard

## Setting Up Authentication

1. Create a `.env.local` file in the root directory
2. Add the following environment variables:

```env
CMS_PASSWORD=your-secure-password-here
CMS_AUTH_TOKEN=your-secure-token-here
```

### What is CMS_AUTH_TOKEN?

**CMS_AUTH_TOKEN** is a security token used for authentication in your CMS admin panel. Here's how it works:

1. **Purpose**: Since this is a static website without a database, the CMS uses a simple token-based authentication system to protect the admin panel.

2. **How it works**:
   - When you log in with the correct password, the system sets a cookie containing the `CMS_AUTH_TOKEN`
   - This cookie is then checked on every API request to verify you're authenticated
   - The token acts as a "session key" that proves you've logged in

3. **Why it's needed**:
   - Prevents unauthorized access to your admin panel
   - Ensures only you can edit website content
   - Works without a database (perfect for static sites)

4. **Security**:
   - **Never commit** `.env.local` to git (it's already in `.gitignore`)
   - Use a strong, random token in production (e.g., generate with: `openssl rand -hex 32`)
   - Change the default token (`dev-token`) before deploying to production

5. **Example**:
   ```env
   CMS_PASSWORD=MySecurePassword123!
   CMS_AUTH_TOKEN=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
   ```

**Important:** Change these values in production! The default values are for development only.

## Available Sections

The admin panel is organized into the following sections:

### 1. Header
- Brand name
- Logo URL
- Navigation items (add, edit, remove)
- CTA button text and link

### 2. Hero Section
- Hero title
- Hero subtitle
- CTA button text and link
- Background image URL

### 3. Services
- Section title and subtitle
- Service items (add, edit, remove)
  - Service title
  - Description
  - Image URL
  - Duration
  - Price

### 4. About Section
- Section title and subtitle
- Feature cards (add, edit, remove)
  - Feature title
  - Description
  - Icon type

### 5. Footer
- Brand name
- Description
- Contact information (address, phone, email)
- Social media links (Facebook, Instagram, Twitter)
- Copyright text
- Legal links

### 6. Contact
- Contact section title
- Contact section subtitle
- Email address for appointment bookings

## How to Use

1. **Login**: Go to `/admin` and enter your password
2. **Select Section**: Click on any section in the sidebar
3. **Edit Content**: Modify the fields as needed
4. **Save**: Click "Save Changes" at the bottom of the form
5. **View Changes**: Visit your website to see the updates

## Data Storage

All CMS data is stored in `/data/cms-data.json`. This file is automatically updated when you save changes in the admin panel.

## Security Notes

- **Development**: The default password is `admin123` (change this!)
- **Production**:
  - Use strong, unique passwords
  - Set secure `CMS_AUTH_TOKEN` values
  - Consider implementing additional security measures (rate limiting, IP whitelisting, etc.)
  - Use environment variables for sensitive data

## Troubleshooting

- **Can't login**: Check that your `.env.local` file has the correct `CMS_PASSWORD`
- **Changes not saving**: Check browser console for errors and ensure the API routes are working
- **Data not loading**: Verify that `/data/cms-data.json` exists and is readable

## Future Enhancements

Consider adding:
- Image upload functionality
- Rich text editor for descriptions
- Preview mode before publishing
- Version history
- User roles and permissions
- Database integration (currently uses JSON file)
