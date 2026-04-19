# Enable Page Scrolling

**🎯 Purpose:** Enable proper scrolling functionality for Shopro POS web application pages.

**⚡ Quick Fix:** Change `App.tsx` line 448 from `overflowY: "hidden"` to `overflowY: "auto"`

---

## 📁 Files in This Skill

| File | Purpose |
|------|---------|
| **SKILL.md** | Complete skill documentation with examples |
| **REFERENCE.md** | Copy-paste code snippets and templates |
| **README.md** | This file - quick overview |

---

## 🚀 When to Use

Trigger this skill when:
- "Enable scrolling on [page name]"
- "Page doesn't scroll"
- "Add scrollbar to [component]"
- "Content is cut off at the bottom"

---

## 🔧 Quick Start

### 1. Fix App Container (Required)
```bash
# File: shopro-res-web/src/App.tsx (line ~448)
# Change: overflowY: "hidden" → overflowY: "auto"
```

### 2. Add Scrollbar to Page (Optional)
```tsx
<div className="flex-1 min-h-0 overflow-y-auto 
    scrollbar-thin 
    scrollbar-thumb-slate-300 
    dark:scrollbar-thumb-slate-600">
  {/* Your content */}
</div>
```

### 3. Test
Navigate to the page and verify scrolling works!

---

## 📋 Implementation Checklist

- [ ] App.tsx `overflowY` changed to `"auto"`
- [ ] Page container has `overflow-hidden` (prevent double scrollbars)
- [ ] Scrollable area has `overflow-y-auto`
- [ ] Scrollbar styling classes added
- [ ] Tested in light mode
- [ ] Tested in dark mode
- [ ] Mouse wheel scrolling works
- [ ] No layout shift when scrollbar appears

---

## 🎨 Scrollbar Classes

```tsx
// Minimal
className="flex-1 overflow-y-auto"

// Standard
className="flex-1 min-h-0 overflow-y-auto 
    scrollbar-thin 
    scrollbar-thumb-slate-300 
    dark:scrollbar-thumb-slate-600 
    scrollbar-track-transparent"

// Enhanced (with hover)
className="flex-1 min-h-0 overflow-y-auto 
    scrollbar-thin 
    scrollbar-thumb-slate-300 
    dark:scrollbar-thumb-slate-600 
    scrollbar-track-transparent 
    hover:scrollbar-thumb-slate-400 
    dark:hover:scrollbar-thumb-slate-500"
```

---

## ⚠️ Common Issues

| Issue | Solution |
|-------|----------|
| No scrollbar | Check App.tsx has `overflowY: "auto"` |
| Double scrollbars | Add `overflow-hidden` to parent |
| Dark mode not working | Verify `dark:` prefix |
| Content cut off | Ensure `min-h-0` is set |

---

## 📖 Documentation

- **Full Guide:** [SKILL.md](./SKILL.md)
- **Code Snippets:** [REFERENCE.md](./REFERENCE.md)

---

**Version:** 1.0  
**Created:** 2026-04-18  
**Status:** ✅ Production Ready
