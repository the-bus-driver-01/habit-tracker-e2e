# Next.js Layout and Navigation App

A Next.js application with a complete layout system featuring consistent header, navigation, and content areas.

## Features

- **Consistent Layout**: Fixed header and sidebar navigation across all pages
- **Active Navigation**: Navigation highlights the current section automatically
- **Responsive Design**: Fully responsive layout that works on all screen sizes
- **Dark Mode Support**: Built-in light/dark mode compatibility
- **TypeScript**: Full TypeScript support for better development experience
- **Tailwind CSS**: Modern styling with Tailwind CSS utility classes

## Project Structure

```
src/
├── app/
│   ├── dashboard/
│   │   └── page.tsx         # Dashboard page
│   ├── products/
│   │   └── page.tsx         # Products page
│   ├── settings/
│   │   └── page.tsx         # Settings page
│   ├── layout.tsx           # Root layout with header and navigation
│   ├── page.tsx             # Homepage
│   └── globals.css          # Global styles and Tailwind CSS
└── components/
    ├── Header.tsx           # Header component
    └── Navigation.tsx       # Navigation sidebar component
```

## Layout Architecture

### Header Component
- Fixed header with branding and action buttons
- Consistent across all pages
- Contains app title and user actions

### Navigation Component
- Sidebar navigation with icons and labels
- Active state highlighting based on current route
- Uses Next.js `usePathname` hook for route detection
- Smooth transitions and hover effects

### Main Layout
- Flex-based layout structure
- Header at the top
- Sidebar navigation on the left
- Main content area on the right
- Full viewport height with proper scrolling

## Pages

1. **Home Page** (`/`)
   - Welcome message and overview cards
   - Getting started information
   - Quick access to other sections

2. **Dashboard** (`/dashboard`)
   - Key metrics and performance indicators
   - Recent activity feed
   - Data visualization cards

3. **Products** (`/products`)
   - Product inventory grid
   - Stock status indicators
   - Product management interface

4. **Settings** (`/settings`)
   - Profile settings
   - Appearance preferences
   - Notification controls
   - Security options

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

4. Navigate between sections to see the active state highlighting in action

## Navigation Behavior

The navigation component automatically highlights the active section based on the current route:

- **Home** (`/`) - Highlights when exactly on the homepage
- **Dashboard** (`/dashboard`) - Highlights for any route starting with `/dashboard`
- **Products** (`/products`) - Highlights for any route starting with `/products`
- **Settings** (`/settings`) - Highlights for any route starting with `/settings`

This allows for nested routes while maintaining proper navigation state.

## Customization

- **Colors**: Modify the color scheme in `tailwind.config.ts`
- **Navigation Items**: Edit the `navigationItems` array in `src/components/Navigation.tsx`
- **Layout Structure**: Adjust the layout in `src/app/layout.tsx`
- **Styling**: Update global styles in `src/app/globals.css`