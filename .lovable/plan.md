
# Dynamic Onboarding Slides Management

## Overview

Currently, onboarding slides are hardcoded in the `Onboarding.tsx` component with a fixed array `SLIDE_KEYS = [1, 2, 3, 4, 5, 6]`. Content is fetched from CMS but the slide structure (number of slides, order) is static. This plan adds full admin control to:

- Add/remove slides dynamically
- Reorder slides via drag-and-drop
- Edit all slide content (title, text, icon)
- Toggle slides active/inactive

---

## Architecture Decision

**Option A: Extend CMS with display_order column** (Not recommended)
- Would require parsing slide keys dynamically from CMS entries
- CMS table not designed for ordered collections

**Option B: Create dedicated `onboarding_slides` table** (Recommended)
- Clean separation of concerns
- Proper `display_order` column for reordering
- `is_active` toggle per slide
- Follows existing patterns (academy_items, course_lessons use display_order)

---

## Database Schema

### New Table: `onboarding_slides`

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `icon` | text | Icon name (camera, dumbbell, etc.) |
| `title_pt` | text | Portuguese title |
| `title_en` | text | English title |
| `text_pt` | text | Portuguese description |
| `text_en` | text | English description |
| `display_order` | integer | Slide order (0, 1, 2...) |
| `is_active` | boolean | Show/hide slide |
| `created_at` | timestamptz | Creation timestamp |
| `updated_at` | timestamptz | Last update timestamp |

### RLS Policies

- Anyone can read active slides (public onboarding)
- Admins can read all slides
- Admins can create/update/delete slides

### Seed Data

Insert the 6 default slides from current fallbacks into the new table.

---

## Frontend Changes

### 1. New Hook: `useOnboardingSlides.ts`

```typescript
// Public hook - fetches active slides ordered by display_order
export function useOnboardingSlides() {
  // Fetches from onboarding_slides where is_active = true
  // Ordered by display_order ASC
  // Returns: { slides, isLoading }
}

// Admin hook - full CRUD with reordering
export function useAdminOnboardingSlides() {
  // Fetches ALL slides (active + inactive)
  // CRUD operations: createSlide, updateSlide, deleteSlide
  // Reorder operation: reorderSlides(slideIds: string[])
}
```

### 2. Update `Onboarding.tsx`

Replace hardcoded `SLIDE_KEYS` and `SLIDE_FALLBACKS` with data from `useOnboardingSlides()`:

```typescript
// Before
const SLIDE_KEYS = [1, 2, 3, 4, 5, 6];
const slideContent = getSlideContent(SLIDE_KEYS[currentSlide]);

// After
const { slides, isLoading } = useOnboardingSlides();
const currentSlideData = slides[currentSlide];
```

Keep existing fallbacks as backup if database is empty or loading.

### 3. New Admin Page: `AdminOnboarding.tsx`

A dedicated page for managing onboarding slides:

**Features:**
- List all slides with drag handles for reordering
- Toggle active/inactive per slide
- Add new slide button
- Edit slide modal (icon picker, bilingual title/text)
- Delete slide with confirmation
- Live preview of slide appearance

**UI Components:**
- Drag-and-drop list using HTML5 drag API (same pattern as course lessons)
- Icon picker dropdown with all supported icons
- Character count for title/text fields

### 4. Update Admin Dashboard

Add "Onboarding" link in the admin dashboard navigation grid.

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/hooks/useOnboardingSlides.ts` | Public + Admin hooks for slides data |
| `src/pages/AdminOnboarding.tsx` | Admin page for slide management |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/Onboarding.tsx` | Use database slides instead of hardcoded array |
| `src/pages/AdminDashboard.tsx` | Add Onboarding link to navigation |

---

## Technical Details

### Database Migration SQL

```sql
-- Create onboarding_slides table
CREATE TABLE public.onboarding_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  icon text NOT NULL DEFAULT 'sparkles',
  title_pt text NOT NULL,
  title_en text NOT NULL,
  text_pt text NOT NULL,
  text_en text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.onboarding_slides ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can read active slides"
  ON public.onboarding_slides FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can read all slides"
  ON public.onboarding_slides FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert slides"
  ON public.onboarding_slides FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update slides"
  ON public.onboarding_slides FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete slides"
  ON public.onboarding_slides FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Auto-update timestamp trigger
CREATE TRIGGER update_onboarding_slides_updated_at
  BEFORE UPDATE ON public.onboarding_slides
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed default slides
INSERT INTO public.onboarding_slides (icon, title_pt, title_en, text_pt, text_en, display_order) VALUES
  ('camera', 'Scan Alimentar & Codigo de Barras', 'Food & Barcode Scanner', 'Fotografa a tua refeicao ou produto e obtem informacao nutricional instantanea.', 'Photograph your meal or product and get instant nutritional information.', 0),
  ('graduation-cap', 'Academy Completa', 'Complete Academy', 'Cursos, programas, ebooks e bundles para transformar a tua saude.', 'Courses, programs, ebooks and bundles to transform your health.', 1),
  ('message-circle', 'Fala com Nutricionista', 'Talk to Nutritionist', 'Acompanhamento profissional, consultas e planos personalizados.', 'Professional guidance, consultations and personalized plans.', 2),
  ('dumbbell', 'Programas de Treino', 'Training Programs', 'Treinos guiados e programas de nutricao para atingir os teus objetivos.', 'Guided workouts and nutrition programs to reach your goals.', 3),
  ('utensils', 'Receitas & Refeicoes', 'Recipes & Meals', 'Receitas fit, acompanhamento de refeicoes e sugestoes inteligentes.', 'Fit recipes, meal tracking and smart suggestions.', 4),
  ('heart-handshake', 'Suporte & Contacto', 'Support & Contact', 'Estamos aqui para ajudar. Contacta-nos quando precisares.', 'We are here to help. Contact us whenever you need.', 5);
```

### Reordering Logic

When admin drags a slide to a new position:

1. Capture the new order array (list of slide IDs)
2. Loop through and update `display_order` for each slide
3. Use a transaction or batch update to ensure consistency

```typescript
const reorderSlides = async (orderedIds: string[]) => {
  const updates = orderedIds.map((id, index) => ({
    id,
    display_order: index
  }));
  
  // Update each slide's display_order
  for (const { id, display_order } of updates) {
    await supabase
      .from('onboarding_slides')
      .update({ display_order })
      .eq('id', id);
  }
};
```

### Icon Picker

Reuse the existing `ICON_MAP` from Onboarding.tsx:

```typescript
const AVAILABLE_ICONS = [
  { value: 'camera', label: 'Camera' },
  { value: 'graduation-cap', label: 'Graduation Cap' },
  { value: 'message-circle', label: 'Message Circle' },
  { value: 'dumbbell', label: 'Dumbbell' },
  { value: 'utensils', label: 'Utensils' },
  { value: 'heart-handshake', label: 'Heart Handshake' },
  { value: 'sparkles', label: 'Sparkles' },
  { value: 'book-open', label: 'Book Open' },
  { value: 'play', label: 'Play' },
  { value: 'shopping-bag', label: 'Shopping Bag' },
];
```

---

## Verification Checklist

After implementation:
- [ ] Database table created with RLS policies
- [ ] Default slides seeded in correct order
- [ ] Onboarding displays slides from database
- [ ] Falls back to hardcoded slides if DB empty
- [ ] Admin can view all slides in admin panel
- [ ] Admin can add new slides
- [ ] Admin can edit existing slides
- [ ] Admin can delete slides
- [ ] Admin can reorder slides via drag-and-drop
- [ ] Admin can toggle slides active/inactive
- [ ] Changes reflect immediately in app onboarding
- [ ] Mobile layout works correctly
- [ ] No impact on camera/scan features

---

## Admin Dashboard Navigation

Add to the existing grid in `AdminDashboard.tsx`:

```tsx
{
  label: { pt: "Onboarding", en: "Onboarding" },
  icon: Play,
  path: "/admin/onboarding",
  description: { pt: "Gerir slides de boas-vindas", en: "Manage welcome slides" }
}
```
