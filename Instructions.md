# Plan to Move Tables to Left Sidebar Alignment

## Current Table Implementation Analysis

### Current Structure
- **Main Layout**: Uses flexbox with sidebar (fixed 64 width, 256px) and main content area
- **Content Wrapper**: Currently uses `calc(100vw - 280px)` width with grid layout
- **Table Container**: Glass cards with full width styling but constrained by padding
- **Sidebar**: Fixed at 256px width (w-64 class) positioned on the left

### Current CSS Issues
- Tables are pushed right due to main content area starting after sidebar
- Glass cards have padding that creates gaps from left edge
- Content wrapper has margins that prevent left alignment
- Main layout uses `lg:ml-64` which pushes content right of sidebar

## Implementation Plan

### Phase 1: Layout Structure Changes
1. **Remove sidebar offset from main content**
   - Remove `lg:ml-64` class from main content div in MainLayout.tsx
   - This allows content to start at left edge behind sidebar

2. **Adjust main content positioning**
   - Add left margin equal to sidebar width only for content area
   - Keep header spanning full width but content starting after sidebar

### Phase 2: Table Container Modifications
1. **Modify glass-card positioning**
   - Remove all margins from glass cards
   - Set glass cards to start at absolute left position
   - Use negative margins to pull tables to sidebar edge

2. **Update content wrapper CSS**
   - Remove grid layout constraints
   - Set width to full viewport
   - Position tables to start at sidebar boundary

### Phase 3: CSS Implementation
```css
/* New CSS for left-aligned tables */
.content-wrapper {
  width: 100vw;
  margin-left: 0;
  padding-left: 256px; /* Sidebar width */
}

.glass-card {
  margin-left: -256px; /* Pull back to sidebar edge */
  padding-left: 256px; /* Add padding to clear sidebar */
  width: 100vw;
  max-width: 100vw;
}

.glass-card .overflow-x-auto {
  margin-left: 0;
  padding-left: 0.5rem; /* Small gap from sidebar */
}
```

### Phase 4: Table Width Optimization
1. **Set table minimum width**
   - Tables should span from sidebar edge to screen edge
   - Use `min-width: calc(100vw - 16px)` for full screen minus scroll

2. **Remove width constraints**
   - Remove all fixed column widths (w-16, w-24, etc.)
   - Allow columns to auto-size based on content

### Phase 5: Responsive Considerations
1. **Mobile behavior**
   - On mobile, tables should span full width when sidebar is collapsed
   - Adjust margins based on sidebar state

2. **Sidebar state handling**
   - When sidebar is closed, tables should start from left edge
   - When sidebar is open, tables should start after sidebar

## Files to Modify

### 1. client/src/components/layout/MainLayout.tsx
- Remove `lg:ml-64` class from main content wrapper
- Adjust main content positioning for left alignment

### 2. client/src/index.css
- Replace current table CSS with new left-aligned positioning
- Add responsive breakpoints for sidebar states

### 3. client/src/components/ui/table.tsx (if needed)
- Remove any inline styles that constrain table width
- Ensure tables can expand to full available width

## Expected Outcome
- Tables will start immediately after the sidebar (no gap)
- Tables will extend to full screen width on the right
- Content will be left-aligned as shown in user's screenshot
- All modules (Providers, Cabinets, Slots, etc.) will have consistent alignment

## Implementation Order
1. MainLayout.tsx changes (remove sidebar offset)
2. CSS updates (new positioning rules)
3. Test on one module (Providers)
4. Apply to all table modules
5. Responsive testing and adjustments