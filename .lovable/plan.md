
# Fix Academy Hero Positioning — Training + Nutrition

## Overview

The current Academy Hero focuses only on **nutrition**. This plan updates the hero to position the Academy as a **complete health and performance academy** covering Training, Nutrition, and Education.

---

## Current State Analysis

**Current Hero Content (from CMS fallbacks):**
- Headline: "Transforma a tua relação com a alimentação" (only nutrition)
- Subheadline: "Para quem quer aprender a comer bem..." (only food/eating)
- Badge: "Nutricionista Certificada" (only nutritionist)
- CTAs: "Explorar Cursos" and "Ver Programas" (generic, good)

**Problem:** The messaging is nutrition-centric when the Academy offers Training + Nutrition + Education.

---

## Changes Summary

### 1. Update CMS Fallback Content

Update the default hero text in `useCmsContent.ts` to reflect both Training and Nutrition:

| Key | Current (PT) | New (PT) |
|-----|--------------|----------|
| `academy.hero.headline` | "Transforma a tua relação com a alimentação" | "Transforma o teu corpo e a tua saúde" |
| `academy.hero.subheadline` | "Para quem quer aprender a comer bem..." | "Programas de treino, nutrição guiada e educação contínua. Cursos, ebooks e programas criados por profissional certificada." |
| `academy.hero.badge.label` | "Nutricionista Certificada" | "Personal Trainer & Nutricionista" |

### 2. Add Third CTA Button

Add an optional third CTA to access the full Academy:

- Primary: "Explorar Cursos" → `/learn?type=course`
- Secondary: "Ver Programas" → `/learn?type=program`
- Tertiary (new): "Academia Completa" → `/learn`

### 3. Add Visual Feature Tags

Add animated feature tags below the badge to communicate both pillars:

```
[🏋️ Treino] [🥗 Nutrição] [📚 Educação]
```

These tags will be:
- Admin-editable via CMS
- Animated with subtle stagger effect
- Styled with semi-transparent white backgrounds

### 4. New CMS Keys Required

| Key | Purpose | Default PT | Default EN |
|-----|---------|------------|------------|
| `academy.hero.cta.tertiary.label` | Third CTA text | "Academia Completa" | "Full Academy" |
| `academy.hero.cta.tertiary.link` | Third CTA link | "/learn" | "/learn" |
| `academy.hero.cta.tertiary.enabled` | Toggle third CTA | "true" | "true" |
| `academy.hero.tags.enabled` | Toggle feature tags | "true" | "true" |
| `academy.hero.tag1.icon` | Tag 1 icon | "dumbbell" | "dumbbell" |
| `academy.hero.tag1.label` | Tag 1 text | "Treino" | "Training" |
| `academy.hero.tag2.icon` | Tag 2 icon | "utensils" | "utensils" |
| `academy.hero.tag2.label` | Tag 2 text | "Nutrição" | "Nutrition" |
| `academy.hero.tag3.icon` | Tag 3 icon | "book-open" | "book-open" |
| `academy.hero.tag3.label` | Tag 3 text | "Educação" | "Education" |

---

## Technical Implementation

### File: `src/hooks/useCmsContent.ts`

Update the `FALLBACK_CONTENT` object with new default values:

```typescript
// Updated Hero Content
"academy.hero.headline": { 
  pt: "Transforma o teu corpo e a tua saúde", 
  en: "Transform your body and health" 
},
"academy.hero.subheadline": { 
  pt: "Programas de treino, nutrição guiada e educação contínua. Cursos, ebooks e programas criados por profissional certificada.", 
  en: "Training programs, guided nutrition and continuous education. Courses, ebooks and programs created by a certified professional." 
},
"academy.hero.badge.label": { 
  pt: "Personal Trainer & Nutricionista", 
  en: "Personal Trainer & Nutritionist" 
},

// New CMS keys for third CTA
"academy.hero.cta.tertiary.label": { pt: "Academia Completa", en: "Full Academy" },
"academy.hero.cta.tertiary.link": { pt: "/learn", en: "/learn" },
"academy.hero.cta.tertiary.enabled": { pt: "true", en: "true" },

// Feature tags
"academy.hero.tags.enabled": { pt: "true", en: "true" },
"academy.hero.tag1.icon": { pt: "dumbbell", en: "dumbbell" },
"academy.hero.tag1.label": { pt: "Treino", en: "Training" },
"academy.hero.tag2.icon": { pt: "utensils", en: "utensils" },
"academy.hero.tag2.label": { pt: "Nutrição", en: "Nutrition" },
"academy.hero.tag3.icon": { pt: "book-open", en: "book-open" },
"academy.hero.tag3.label": { pt: "Educação", en: "Education" },
```

### File: `src/components/academy/AcademyHero.tsx`

1. **Import additional icons:**
```typescript
import { Dumbbell, Utensils } from "lucide-react";
```

2. **Create icon map for feature tags:**
```typescript
const TAG_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  dumbbell: Dumbbell,
  utensils: Utensils,
  "book-open": BookOpen,
  // ... other icons
};
```

3. **Add feature tags section below badge:**
```tsx
{/* Feature Tags */}
{tagsEnabled && (
  <motion.div variants={itemVariants} className="flex flex-wrap gap-2 mb-4">
    {[1, 2, 3].map((i) => {
      const iconKey = cms.get(`academy.hero.tag${i}.icon`);
      const label = cms.get(`academy.hero.tag${i}.label`);
      const IconComponent = TAG_ICON_MAP[iconKey] || BookOpen;
      return (
        <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs text-white/90">
          <IconComponent className="h-3.5 w-3.5" />
          {label}
        </span>
      );
    })}
  </motion.div>
)}
```

4. **Add tertiary CTA button:**
```tsx
{/* Tertiary CTA */}
{tertiaryCtaEnabled && (
  <button
    onClick={() => navigate(tertiaryCtaLink)}
    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white/80 font-medium text-sm hover:text-white transition-colors"
  >
    {tertiaryCtaLabel}
    <ChevronRight className="h-4 w-4" />
  </button>
)}
```

---

## Visual Result

The updated hero will display:

```text
┌─────────────────────────────────────────────────────┐
│  🏆 Personal Trainer & Nutricionista                │
│                                                      │
│  [🏋️ Treino] [🥗 Nutrição] [📚 Educação]            │
│                                                      │
│  Transforma o teu corpo                             │
│  e a tua saúde                                      │
│                                                      │
│  Programas de treino, nutrição guiada e educação    │
│  contínua. Cursos, ebooks e programas criados       │
│  por profissional certificada.                      │
│                                                      │
│  [Explorar Cursos] [Ver Programas] Academia →       │
│                                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │  🎬 Featured Course/Program Card            │    │
│  └─────────────────────────────────────────────┘    │
│  ────────────────── bronze line ──────────────────  │
└─────────────────────────────────────────────────────┘
```

---

## Admin Control Summary

Admins can edit through the CMS panel (`/admin/cms`):

| Element | CMS Key | Editable |
|---------|---------|----------|
| Badge text | `academy.hero.badge.label` | ✅ |
| Headline | `academy.hero.headline` | ✅ |
| Subheadline | `academy.hero.subheadline` | ✅ |
| Primary CTA text | `academy.hero.cta.primary.label` | ✅ |
| Secondary CTA text | `academy.hero.cta.secondary.label` | ✅ |
| Tertiary CTA text | `academy.hero.cta.tertiary.label` | ✅ |
| Feature tags on/off | `academy.hero.tags.enabled` | ✅ |
| Tag 1/2/3 icons | `academy.hero.tagX.icon` | ✅ |
| Tag 1/2/3 labels | `academy.hero.tagX.label` | ✅ |
| Hero layout | `academy.hero.layout` | ✅ |
| Video/Image URLs | `academy.hero.video.url` / `academy.hero.image.url` | ✅ |
| Animations on/off | `academy.hero.animations.enabled` | ✅ |

---

## Files to Modify

1. **`src/hooks/useCmsContent.ts`**
   - Update existing fallback values for headline, subheadline, badge
   - Add new CMS keys for tertiary CTA and feature tags

2. **`src/components/academy/AcademyHero.tsx`**
   - Import new icons (Dumbbell, Utensils)
   - Add icon map for dynamic tag rendering
   - Add feature tags section with animation
   - Add tertiary CTA button
   - Fetch new CMS values

---

## Verification Checklist

After implementation:
- [ ] Hero clearly shows "Training + Nutrition + Education"
- [ ] Badge reads "Personal Trainer & Nutricionista"
- [ ] Three feature tags visible with icons
- [ ] Three CTAs available (primary, secondary, tertiary)
- [ ] All text editable via Admin CMS
- [ ] Animations remain smooth
- [ ] Mobile layout renders correctly
- [ ] No impact on navigation or scan features
