# Layout Spacing Guide - Financial Planner Pro

## Overview
This document outlines the standardized layout spacing configuration used across all pages in the Financial Planner Pro application.

## Page Container Configuration

### Standard Page Layout
All main pages use the following container configuration:
```tsx
return (
  <div className="space-y-6 p-6 -mt-12">
    {/* Page content */}
  </div>
);
```

### Configuration Details
- **`space-y-6`**: Provides consistent vertical spacing between page elements (24px gaps)
- **`p-6`**: Adds padding around the entire page content (24px on all sides)
- **`-mt-12`**: Applies negative top margin to bring content closer to the header bar (48px upward shift)

## Applied Pages

The following pages have been updated with this standardized spacing:

### Core Management Pages
- ✅ **Cabinets** (`client/src/pages/Cabinets.tsx`)
- ✅ **Providers** (`client/src/pages/Providers.tsx`)
- ✅ **Slots** (`client/src/pages/Slots.tsx`)
- ✅ **Invoices** (`client/src/pages/Invoices.tsx`)
- ✅ **Companies** (`client/src/pages/Companies.tsx`)
- ✅ **Locations** (`client/src/pages/Locations.tsx`)
- ✅ **GameMixes** (`client/src/pages/GameMixes.tsx`)

### User Management & System Pages
- ✅ **Users** (`client/src/pages/Users.tsx`)
- ✅ **Settings** (`client/src/pages/Settings.tsx`)
- ✅ **Dashboard** (`client/src/pages/Dashboard.tsx`)

## Header Integration

### Page Titles in Header
Page titles have been moved to the header bar to save vertical space:
- Titles are now displayed in the header component
- Subtitles provide additional context
- Eliminates redundant title sections on pages

### Header Configuration
The header component receives title and subtitle props:
```tsx
<Header 
  title="Cabinets" 
  subtitle="Gaming cabinet and equipment management" 
/>
```

## Benefits

### Space Optimization
- **Increased content visibility**: More table rows visible without scrolling
- **Reduced vertical spacing**: Content starts closer to header
- **Consistent layout**: Uniform spacing across all pages

### User Experience
- **Better data density**: More information visible at once
- **Improved navigation**: Less scrolling required
- **Professional appearance**: Clean, compact layout

## Implementation Notes

### Before (Old Configuration)
```tsx
return (
  <div className="space-y-6 p-6 pt-4">
    {/* Title section */}
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold heading-gradient">Page Title</h2>
      <div className="text-sm text-slate-400">Total count</div>
    </div>
    {/* Content */}
  </div>
);
```

### After (New Configuration)
```tsx
return (
  <div className="space-y-6 p-6 -mt-12">
    {/* Content only - title moved to header */}
  </div>
);
```

## Maintenance

### Adding New Pages
When creating new pages, use the standard container configuration:
```tsx
export default function NewPage() {
  return (
    <div className="space-y-6 p-6 -mt-12">
      {/* Page content */}
    </div>
  );
}
```

### Updating Existing Pages
To update existing pages, replace the container div with:
```tsx
// Replace this:
<div className="space-y-6">

// With this:
<div className="space-y-6 p-6 -mt-12">
```

## Troubleshooting

### Common Issues
1. **Content too close to header**: Reduce negative margin (e.g., `-mt-8` instead of `-mt-12`)
2. **Content overlapping header**: Increase negative margin or add top padding
3. **Inconsistent spacing**: Ensure all pages use the same configuration

### Adjustments
- For pages with special requirements, adjust the negative margin value
- Monitor on different screen sizes to ensure proper spacing
- Test with different content lengths to verify layout stability

## Version History

- **2024-07-08**: Initial implementation of standardized spacing
- Applied to all core management pages
- Moved page titles to header component
- Established documentation for future maintenance 