# Divyam Shree - Cold Coffee Instant Mix Landing Page

A premium, mobile-first landing page for Divyam Shree Cold Coffee Instant Mix built with Angular and Tailwind CSS.

## Features

- **Premium Design**: Dark background with gold accents following brand guidelines
- **Mobile-First**: Responsive design optimized for all screen sizes
- **Accessibility**: WCAG compliant with proper ARIA labels and semantic HTML
- **Performance**: Optimized animations using CSS transforms and opacity
- **Modern Stack**: Angular 19 with Tailwind CSS v3

## Brand Colors

- Primary: `#4B2A17` (Dark Brown)
- Secondary: `#8B4513` (Saddle Brown)  
- Accent: `#FFD700` (Gold)
- Background: `#2B1B0F` (Very Dark Brown)
- Text: `#FFFFFF` (White)

## Development

### Prerequisites

- Node.js 18+ (use `nvm use 18`)
- npm

### Setup

```bash
# Install dependencies
npm install

# Start development server
ng serve

# Open http://localhost:4200
```

### Build

```bash
# Development build
ng build --configuration development

# Production build
ng build --configuration production
```

### Testing

```bash
# Run unit tests
ng test

# Run linting
ng lint
```

## Project Structure

```
src/
  app/
    components/
      hero/           # Main hero section
      logo/           # Coffee-themed logo component
      instagram-button/ # Instagram CTA button
  styles/
    tailwind.css     # Tailwind CSS imports
    variables.scss   # Brand color variables
```

## Components

- **HeroComponent**: Main landing page with brand name, coming soon message, and Instagram CTA
- **LogoComponent**: Animated coffee cup SVG with steam effects
- **InstagramButtonComponent**: Accessible Instagram follow button

## Performance Features

- CSS-only animations (no JavaScript)
- GPU-accelerated transforms
- Optimized bundle size
- Lighthouse-friendly structure
- `prefers-reduced-motion` support

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Responsive design from 320px to 1920px+

## License

Private project for Divyam Shree brand.