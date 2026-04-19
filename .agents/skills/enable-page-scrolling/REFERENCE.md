# Enable Page Scrolling - Reference Implementation

## 📋 Overview

This file provides copy-paste code snippets for enabling scrolling on Shopro POS pages.

## 🎯 Quick Fix (App.tsx)

### File: `shopro-res-web/src/App.tsx` (Line ~448)

```tsx
// ❌ BEFORE
<div style={{ flex: 1, overflowY: "hidden", position: "relative" }}>

// ✅ AFTER
<div style={{ flex: 1, overflowY: "auto", position: "relative" }}>
```

---

## 🎨 Page Template with Scrolling

### Basic Pattern

```tsx
import React from 'react';

export default function YourPage() {
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Header (fixed, doesn't scroll) */}
      <header className="px-4 sm:px-10 py-6">
        <h1 className="text-4xl font-black">Page Title</h1>
      </header>
      
      {/* Scrollable Content Area */}
      <div className="flex-1 min-h-0 overflow-y-auto 
          scrollbar-thin 
          scrollbar-thumb-slate-300 
          dark:scrollbar-thumb-slate-600 
          scrollbar-track-transparent 
          hover:scrollbar-thumb-slate-400 
          dark:hover:scrollbar-thumb-slate-500">
        
        {/* Your content */}
        <div className="p-4 sm:p-10">
          {/* Grid, cards, tables, etc. */}
        </div>
      </div>
    </div>
  );
}
```

---

## 📦 Complete Example: Vendor Card Page

```tsx
import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from '@/lib/utils';

interface VendorGroup {
  supplierId: number;
  supplierName: string;
  items: any[];
  totalShortfall: number;
}

interface YourPageProps {
  vendorGroups: VendorGroup[];
  selectedIds: number[];
}

export default function YourPage({ vendorGroups, selectedIds }: YourPageProps) {
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-950 font-sans overflow-hidden">
      
      {/* Header */}
      <header className="flex-1 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-950 font-sans p-4 sm:p-10 space-y-10">
        <div className="px-2">
          <h1 className="text-4xl font-black text-foreground tracking-tighter">
            Reorder Staging
          </h1>
          <p className="text-lg font-medium text-muted-foreground/40">
            Items grouped by preferred vendor
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-2">
          <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] shadow-sm">
            <p className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em] mb-4">
              Total Shortfall
            </p>
            <h4 className="text-4xl font-black text-foreground tracking-tighter tabular-nums">
              {vendorGroups.length}
            </h4>
          </div>
          {/* More stat cards... */}
        </div>
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 min-h-0 overflow-y-auto 
          scrollbar-thin 
          scrollbar-thumb-slate-300 
          dark:scrollbar-thumb-slate-600 
          scrollbar-track-transparent 
          hover:scrollbar-thumb-slate-400 
          dark:hover:scrollbar-thumb-slate-500">
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-4 px-2">
          {vendorGroups.map((group) => (
            <div 
              key={group.supplierId}
              className="bg-white dark:bg-slate-900 border-2 rounded-[2rem] p-8"
            >
              <h3 className="text-lg font-black">{group.supplierName}</h3>
              <p className="text-2xl font-black text-rose-500">
                −{group.totalShortfall} units
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## 🎯 Scrollbar Class Reference

### Minimal (Just Works)
```tsx
className="flex-1 overflow-y-auto"
```

### Standard (Custom Styling)
```tsx
className="flex-1 min-h-0 overflow-y-auto 
    scrollbar-thin 
    scrollbar-thumb-slate-300 
    dark:scrollbar-thumb-slate-600 
    scrollbar-track-transparent"
```

### Enhanced (With Hover Effects)
```tsx
className="flex-1 min-h-0 overflow-y-auto 
    scrollbar-thin 
    scrollbar-thumb-slate-300 
    dark:scrollbar-thumb-slate-600 
    scrollbar-track-transparent 
    hover:scrollbar-thumb-slate-400 
    dark:hover:scrollbar-thumb-slate-500"
```

---

## 🛠️ Custom CSS (If Tailwind Plugin Not Available)

### Add to `src/index.css`

```css
/* Custom scrollbar for WebKit browsers (Chrome, Safari, Edge) */
.scrollbar-custom {
  scrollbar-width: thin;
  scrollbar-color: #94a3b8 transparent;
}

.scrollbar-custom::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.scrollbar-custom::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-custom::-webkit-scrollbar-thumb {
  background-color: #94a3b8;
  border-radius: 9999px;
  border: 2px solid transparent;
  background-clip: content-box;
}

.scrollbar-custom::-webkit-scrollbar-thumb:hover {
  background-color: #64748b;
}

/* Dark mode */
.dark .scrollbar-custom {
  scrollbar-color: #475569 transparent;
}

.dark .scrollbar-custom::-webkit-scrollbar-thumb {
  background-color: #475569;
}

.dark .scrollbar-custom::-webkit-scrollbar-thumb:hover {
  background-color: #64748b;
}

/* Firefox */
.scrollbar-custom {
  scrollbar-width: thin;
  scrollbar-color: #94a3b8 transparent;
}

.dark .scrollbar-custom {
  scrollbar-color: #475569 transparent;
}
```

### Usage
```tsx
<div className="flex-1 overflow-y-auto scrollbar-custom">
  {/* Content */}
</div>
```

---

## 🧪 Testing Checklist

```markdown
## Visual Tests
- [ ] Scrollbar appears when content overflows
- [ ] Scrollbar disappears when content fits
- [ ] Scrollbar thumb is visible (not too light)
- [ ] Scrollbar track is transparent/invisible
- [ ] Hover effect makes thumb darker

## Functional Tests
- [ ] Mouse wheel scrolls content
- [ ] Touchpad gesture scrolls content
- [ ] Click-and-drag thumb works
- [ ] Page Up/Page Down keys work
- [ ] Home/End keys work

## Responsive Tests
- [ ] Works on desktop (1920px)
- [ ] Works on laptop (1366px)
- [ ] Works on tablet (768px)
- [ ] Works on mobile (375px)

## Theme Tests
- [ ] Light mode: thumb is slate-300
- [ ] Dark mode: thumb is slate-600
- [ ] Light mode hover: thumb is slate-400
- [ ] Dark mode hover: thumb is slate-500

## Edge Cases
- [ ] No double scrollbars
- [ ] No layout shift when scrollbar appears
- [ ] Content not cut off at bottom
- [ ] Header stays fixed (doesn't scroll)
```

---

## 🔧 Troubleshooting

### Problem: No Scrollbar Appears

**Check:**
1. App.tsx has `overflowY: "auto"` (not `"hidden"`)
2. Container has `flex-1` and `min-h-0`
3. Content actually overflows viewport
4. No parent has `overflow: hidden`

**Debug:**
```tsx
// Add temporary border to see container bounds
<div className="flex-1 overflow-y-auto border-2 border-red-500">
```

### Problem: Double Scrollbars

**Fix:**
```tsx
// Parent: overflow-hidden
<div className="flex-1 flex flex-col min-h-0 overflow-hidden">
  {/* Child: overflow-y-auto */}
  <div className="flex-1 overflow-y-auto">
    {/* Content */}
  </div>
</div>
```

### Problem: Scrollbar Overlaps Content

**Fix:**
```tsx
// Add padding-right to compensate
<div className="flex-1 overflow-y-auto pr-2">
  {/* Or use scrollbar-gutter */}
  <div className="flex-1 overflow-y-auto scrollbar-gutter-stable">
```

### Problem: Dark Mode Not Working

**Check:**
1. `dark:` prefix is correct
2. Parent has `dark` class (from theme provider)
3. No inline styles overriding

**Debug:**
```tsx
// Force dark mode for testing
<div className="dark flex-1 overflow-y-auto dark:scrollbar-thumb-slate-600">
```

---

## 📚 Related Files

- **App Container:** `shopro-res-web/src/App.tsx` (line ~448)
- **Example Page:** `shopro-res-web/src/features/purchasing/POStagingPage.tsx`
- **Styles:** `shopro-res-web/src/index.css`
- **Skill Doc:** `.agents/skills/enable-page-scrolling/SKILL.md`

---

**Last Updated:** 2026-04-18  
**Version:** 1.0
