# Glow Clinic - Premium Skin & Hair Care Website

A modern, feature-rich static website built with Next.js 14, TypeScript, and Tailwind CSS for a comprehensive skin and hair clinic offering various treatments and services. The website features auto dark/light theme support, custom form components, smooth animations, and a fully responsive design.

## ✨ Features

### Core Features
- **Modern UI/UX**: Eye-catching, professional design with smooth animations and transitions
- **Fully Responsive**: Optimized for all devices (mobile, tablet, desktop)
- **Dark/Light Theme**: Automatic theme detection based on system preferences with manual toggle option
- **Accessible**: Built following WCAG accessibility best practices
- **SEO Optimized**: Comprehensive metadata, sitemap, and robots.txt configuration
- **Component-Based Architecture**: Clean, reusable, and maintainable component structure
- **TypeScript**: Fully typed for better development experience and type safety
- **Static Site Generation**: Pre-rendered static pages for optimal performance
- **Smooth Animations**: Scroll reveal animations and interactive transitions throughout

### Interactive Features
- **Custom Form Components**: Modern form inputs with placeholders and theme-aware styling
- **Custom Dropdown**: Custom-styled select dropdown matching the design theme
- **Form Validation**: Client-side validation with error messages and alerts
- **Service Slider**: Mobile-friendly horizontal scrolling service cards
- **Scroll Animations**: Elements animate into view as user scrolls
- **Theme Toggle Button**: Easy theme switching (Light → Dark → Auto)

### UI/UX Features
- **Floating Navigation**: Header that adapts on scroll with backdrop blur
- **Smooth Scrolling**: Anchor links with smooth scroll behavior
- **Hover Effects**: Interactive hover states on all clickable elements
- **Loading States**: Visual feedback during form submissions
- **Error Handling**: User-friendly error messages and validation feedback

## 🎨 Services Offered

### Hair Services
- Hair Restoration
- Hair Transplantation (FUE & FUT techniques)
- Hair Treatments
- PRP (Platelet-Rich Plasma) Therapy
- Scalp Treatment
- Hair Thickening

### Skin Services
- Professional Skin Care
- Acne Treatment
- Anti-Aging Treatments
- Pigmentation Treatment
- Laser Therapy
- Facial Treatments

### Other Services
- Hijama Therapy (Traditional Cupping)
- Comprehensive Beauty Services

## 🛠️ Tech Stack

### Frontend
- **Next.js 14.0.4**: React framework with App Router
- **React 18.2.0**: UI library
- **TypeScript 5.3.3**: Type-safe development
- **Tailwind CSS 3.4.0**: Utility-first CSS framework
- **Framer Motion 10.16.16**: Animation library (available for future use)

### Development Tools
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixing
- **ESLint**: Code linting (Next.js default)

## 📁 Project Structure

```
clinic/
├── app/                          # Next.js App Router directory
│   ├── layout.tsx               # Root layout with metadata & SEO
│   ├── page.tsx                 # Home page
│   ├── globals.css              # Global styles & animations
│   ├── icon.svg                 # App icon
│   ├── robots.ts                # Robots.txt configuration
│   ├── sitemap.ts               # Sitemap generation
│   ├── not-found.tsx            # 404 error page
│   └── services/                # Service pages
│       ├── [id]/                # Dynamic service detail page
│       │   ├── page.tsx
│       │   └── metadata.ts
│       ├── hair/                # Hair services page
│       ├── skin/                # Skin services page
│       ├── transplantation/     # Hair transplantation page
│       └── hijama/              # Hijama therapy page
│
├── components/                   # Reusable React components
│   ├── Alert/                   # Alert/notification component
│   ├── Button/                  # Button component with variants
│   ├── Card/                    # Card wrapper component
│   ├── CustomSelect/            # Custom dropdown component
│   ├── FloatingLabelInput/      # Form input component
│   ├── Footer/                  # Site footer with links
│   ├── Header/                  # Navigation header
│   ├── Hero/                    # Hero section component
│   ├── ScrollReveal/            # Scroll animation wrapper
│   ├── Section/                 # Section wrapper component
│   ├── ServiceCard/             # Service card component
│   ├── ThemeProvider/           # Theme context provider
│   └── ThemeToggle/             # Theme toggle button
│
├── types/                       # TypeScript type definitions
│   ├── index.ts                 # Main type exports
│   └── component.types.ts       # Component prop types
│
├── public/                       # Static assets
│   ├── icon.svg                 # Website icon
│   ├── favicon.ico              # Favicon
│   └── site.webmanifest         # Web app manifest
│
├── next.config.js               # Next.js configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
├── postcss.config.js            # PostCSS configuration
└── package.json                 # Dependencies & scripts
```

## 🚀 Getting Started

### Prerequisites

- **Node.js**: Version 18 or higher
- **Package Manager**: npm, yarn, or pnpm

### Installation

1. **Clone the repository** (if applicable) or navigate to the project directory

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser** and navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
# Build the production bundle
npm run build

# Start the production server
npm start

# Or use Next.js static export if needed
npm run build && npm run export
```

## 🎨 Theme System

The website supports automatic theme detection and manual theme switching:

### Theme Modes
- **Light**: Always light mode
- **Dark**: Always dark mode
- **Auto**: Follows system preference (default)

### Theme Toggle
- Click the theme toggle button in the header
- Cycles through: Light → Dark → Auto
- Theme preference is saved in localStorage
- Automatically updates when system preference changes (in Auto mode)

### Theme Colors
- **Primary**: Blue tones (`primary-50` to `primary-900`)
- **Accent**: Purple/Pink tones (`accent-50` to `accent-900`)
- Customizable in `tailwind.config.js`

## 📝 Component Details

### Form Components

#### FloatingLabelInput
Modern input component with:
- Placeholder-only design (no floating labels)
- Theme-aware styling (light/dark mode support)
- Icon support
- Error handling and validation
- Supports: text, email, tel, textarea, and custom select

#### CustomSelect
Custom dropdown component:
- Matches theme design perfectly
- Keyboard navigation (Arrow keys, Enter, Escape)
- Mouse and touch support
- Accessible (ARIA labels, keyboard support)
- Theme-aware styling

### Layout Components

#### Header
- Fixed navigation with scroll effects
- Responsive mobile menu
- Theme toggle button
- Smooth transitions and backdrop blur
- Dark mode support

#### Footer
- Multi-column layout
- Social media links
- Service links
- Contact information
- Dark mode support

#### Hero
- Full-screen hero section with background image
- Responsive text sizing
- Call-to-action buttons
- Scroll indicator

### UI Components

#### Button
- Multiple variants: primary, secondary, outline
- Size options: sm, md, lg
- Hover and active states
- Can be used as Link or button
- Theme-aware colors

#### ServiceCard
- Image with hover effects
- Responsive sizing
- Scroll reveal animation
- Link to service details

#### ScrollReveal
- Animates elements into view on scroll
- Multiple directions: up, down, left, right, fade
- Customizable delay
- Uses IntersectionObserver API

#### Alert
- Success, error, and info variants
- Slide-in animation
- Auto-dismissible
- Accessible

## 🎯 Form Features

### Contact Form
- **Fields**: Name, Email, Phone, Service, Message
- **Validation**: Client-side validation with real-time error feedback
- **Submission**: Simulated API call with loading states
- **Success/Error Alerts**: User feedback on submission
- **Accessibility**: Proper labels, ARIA attributes, keyboard navigation

### Form Validation
- Required field validation
- Email format validation
- Phone number validation
- Minimum character length checks
- Real-time error clearing

## 📱 Responsive Design

### Breakpoints
- **xs**: 475px
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

### Mobile Features
- Horizontal scrolling service slider
- Collapsible mobile navigation
- Touch-optimized interactions
- Responsive typography
- Optimized image loading

## 🔍 SEO & Metadata

### SEO Features
- Comprehensive metadata configuration
- Open Graph tags for social sharing
- Twitter Card support
- Structured data ready
- Sitemap generation
- Robots.txt configuration
- Semantic HTML structure

### Metadata Includes
- Title templates
- Descriptions
- Keywords
- Author information
- Canonical URLs
- Social media previews

## ♿ Accessibility

### Features
- **Semantic HTML**: Proper use of HTML5 semantic elements
- **ARIA Labels**: Descriptive labels for screen readers
- **Keyboard Navigation**: Full keyboard support
- **Focus Indicators**: Visible focus states
- **Color Contrast**: WCAG AA compliant color combinations
- **Alt Text**: Descriptive alt text for images
- **Form Labels**: Proper form label associations

## ⚡ Performance Optimizations

- **Static Site Generation**: Pre-rendered pages at build time
- **Image Optimization**: Next.js Image component with lazy loading
- **Code Splitting**: Automatic code splitting by Next.js
- **CSS Optimization**: Tailwind CSS purging unused styles
- **Font Optimization**: Google Fonts with subset loading
- **Minimal JavaScript**: Only essential JavaScript for interactivity

## 🎨 Customization Guide

### Changing Colors

Edit `tailwind.config.js` to customize the color palette:

```javascript
colors: {
  primary: {
    50: '#f0f9ff',
    // ... adjust primary colors
  },
  accent: {
    50: '#fdf4ff',
    // ... adjust accent colors
  },
}
```

### Adding New Services

1. Add service data to the `services` array in `app/page.tsx`
2. Create a dedicated page in `app/services/[service-name]/page.tsx` if needed
3. Update the services grid to display the new service

### Modifying Animations

Edit animation configurations in:
- `app/globals.css` for CSS animations
- `components/ScrollReveal/ScrollReveal.tsx` for scroll animations
- Component files for hover and transition effects

## 📦 Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
```

## 🔄 Future Enhancements

This static website can be easily converted to a dynamic application:

### Potential Additions
- **CMS Integration**: Connect to a headless CMS (Contentful, Strapi, etc.)
- **Database**: Add database for dynamic content
- **Booking System**: Online appointment booking
- **User Authentication**: Patient portal and accounts
- **Admin Panel**: Content management dashboard
- **Payment Processing**: Online payment integration
- **Email Notifications**: Automated email system
- **Blog**: Content marketing and SEO blog
- **Reviews System**: Patient testimonials and reviews
- **Live Chat**: Real-time customer support

## 📄 License

This project is private and proprietary.

## 👨‍💻 Development Notes

### Component Organization
- Each component has its own folder
- Components include TypeScript files (`.tsx`)
- Each component exports via `index.ts`
- Types defined in `types/component.types.ts`

### Best Practices
- TypeScript for type safety
- Component-based architecture
- Reusable UI components
- Consistent naming conventions
- Accessible markup
- Performance optimizations

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Responsive design tested across devices

## 🐛 Troubleshooting

### Common Issues

**Theme not changing:**
- Clear browser cache
- Check localStorage for theme preference
- Ensure ThemeProvider wraps the app

**Form validation not working:**
- Check that all required fields have proper validation
- Verify form state management

**Images not loading:**
- Check `next.config.js` for image domain configuration
- Ensure images are from allowed domains or local

**Build errors:**
- Run `npm run lint` to check for issues
- Ensure all TypeScript types are correct
- Check that all imports are valid

## 📞 Support

For questions or issues, please contact the development team.

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**
