
# Fix: Ebook/Bundle Navigation Routes

## Issue
When clicking on an ebook or bundle item in the Academy section, the app navigates to `/learn/course/...` instead of the correct route (`/learn/ebook/...` or `/learn/bundle/...`). This causes a 404 error even though the routes for ebooks and bundles were added.

## Root Cause
In `src/components/academy/AcademyCard.tsx`, the `handleClick` function at lines 65-67 incorrectly routes ebooks and bundles to `/learn/course/`:

```typescript
} else if (item.item_type === "ebook" || item.item_type === "bundle") {
  navigate(`/learn/course/${item.id}`);  // WRONG!
}
```

## Solution
Update the navigation logic to use the correct route path based on the item type:

```typescript
} else if (item.item_type === "ebook") {
  navigate(`/learn/ebook/${item.id}`);
} else if (item.item_type === "bundle") {
  navigate(`/learn/bundle/${item.id}`);
}
```

## Files to Change
1. **src/components/academy/AcademyCard.tsx** (lines 65-67)
   - Fix ebook navigation: `/learn/ebook/${item.id}`
   - Fix bundle navigation: `/learn/bundle/${item.id}`

## After Fix
- Clicking the "Reset your body!" ebook will navigate to `/learn/ebook/581c7b00-...`
- The `CourseDetail` component will correctly receive `ebookId` from `useParams()`
- The Stripe checkout button will work as expected
