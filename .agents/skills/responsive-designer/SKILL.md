---
name: responsive-layout-manager
description: Refactors dense React/Tailwind screens into a responsive, mobile-first tabbed layout with proper text sizing, overflow management, and progressive enhancement across breakpoints.
---

# Responsive Layout Manager Skill

This skill converts static or awkwardly large data-dense screens into modern, fully responsive layouts using Tailwind CSS and Radix UI Tabs. Use this skill whenever a screen lacks proper `overflow-y-auto`, text elements are clipping or too large on mobile, or large grid layouts need to be consolidated for smaller viewports.

## Workflow Execution Steps

### 1. Identify Target Component
- Find the specific dense UI component `.tsx` file that the user wants to make responsive.
- Read the entire file (`view_file`), maintaining a clear understanding of its data fetching, context, and structural layout.

### 2. Update Layout Containers
- **CRITICAL - Top Level App Wrapper Constraint:** The main `<Canvas>` in `App.tsx` provides a `position: relative` bounding box for all page components, but it **does not** pass down `display: flex`.
- Because of this, using `flex-1` or `max-h` to constrain scrolling height will usually fail.
- You must lock the outermost container of every page component using absolute boundaries so it perfectly maps to the parent shell.
- **Before:** `<div className="flex-1 min-h-0...">`
- **After:** `<div className="absolute inset-0 flex flex-col overflow-y-auto w-full px-4 sm:px-6 lg:px-10">`
- This strictly bounds the container to the parent's coordinates, perfectly enabling the `overflow-y-auto` lock-in!
- Ensure inner grids wrap properly (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3...`).

### 3. Normalize Dense Elements
- Transform excessively large headings (`text-5xl`) and ensure they wrap (`text-3xl sm:text-4xl lg:text-5xl`).
- Add `break-all` or truncate long text strings like transaction hashes, UUIDs, or long order numbers.

### 4. Implement Radix UI Tabs (`@/components/ui/Tabs`)
- For data-heavy pages (like detail views that have sidebars, wide tables, and multiple widgets), wrap the core content in `<Tabs defaultValue="...">`.
- Create a horizontal scrolling tab list for mobile devices:
  ```tsx
  <TabsList className="w-full sm:w-auto overflow-x-auto flex flex-nowrap shrink-0 justify-start">
    <TabsTrigger value="tab1" className="shrink-0">Tab 1</TabsTrigger>
    ...
  </TabsList>
  ```
- Map logical blocks (e.g., "Overview", "Metrics", "History") to distinct `<TabsContent>` blocks rather than stacking everything vertically on an infinite mobile view or squishing into a grid.

### 5. Table Layout Optimizations
- Ensure native tables or grid faux-tables have an `overflow-x-auto` wrapper:
  ```tsx
  <div className="overflow-x-auto w-full">
     <div className="min-w-[500px]"> /* grid columns */ </div>
  </div>
  ```

### 6. Perform Safeties
- Do not lose or delete any existing hooks, buttons, actions, or specific dynamic state variables.
- When parsing `NaN` susceptible blocks or variables, replace with localized fail-safes (e.g., `const total = value ?? 0`).

By running this workflow, the targeted screen will cleanly mount on mobile phones as a smooth, multi-pane tabbed view, whilst retaining a grid-aligned experience natively on desktops.
