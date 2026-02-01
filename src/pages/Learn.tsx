import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, PlayCircle, Calendar, Package, Search, Sparkles } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useCmsContent } from "@/hooks/useCmsContent";
import { useAcademyItems, AcademyItemType, AcademyItem } from "@/hooks/useAcademyItems";
import { AcademyHero } from "@/components/academy/AcademyHero";
import { CourseCard } from "@/components/academy/CourseCard";
import { CourseCategoryFilter } from "@/components/academy/CourseCategoryFilter";
import { AcademyCard } from "@/components/academy/AcademyCard";
import { TestimonialsSection } from "@/components/testimonials/TestimonialsSection";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type ExtendedAcademyItem = AcademyItem & {
  instructor_name?: string;
  total_duration_minutes?: number;
  total_lessons?: number;
  difficulty_level?: string;
};

export default function Learn() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const cms = useCmsContent();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const activeType = (searchParams.get("type") as AcademyItemType | "all") || "all";
  const { data: items, isLoading, error } = useAcademyItems(
    activeType === "all" ? undefined : activeType
  );

  // Type filters with CMS labels
  const TYPE_FILTERS = useMemo(() => [
    { type: "all" as const, icon: Sparkles, labelKey: "academy.filter.all" },
    { type: "course" as const, icon: PlayCircle, labelKey: "academy.filter.courses" },
    { type: "ebook" as const, icon: BookOpen, labelKey: "academy.filter.ebooks" },
    { type: "program" as const, icon: Calendar, labelKey: "academy.filter.programs" },
    { type: "bundle" as const, icon: Package, labelKey: "academy.filter.bundles" },
  ], []);

  // Filter items
  const filteredItems = useMemo(() => {
    if (!items) return [];
    
    let filtered = items as ExtendedAcademyItem[];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((item) => {
        const title = language === "pt" ? item.title_pt : item.title_en;
        const subtitle = language === "pt" ? item.subtitle_pt : item.subtitle_en;
        const description = language === "pt" ? item.description_pt : item.description_en;

        return (
          title.toLowerCase().includes(query) ||
          subtitle?.toLowerCase().includes(query) ||
          description?.toLowerCase().includes(query)
        );
      });
    }

    // Category filter (for courses)
    if (categoryFilter !== "all" && activeType === "course") {
      filtered = filtered.filter((item) => {
        if (categoryFilter === "beginner") {
          return item.difficulty_level === "beginner";
        }
        if (categoryFilter === "advanced") {
          return item.difficulty_level === "advanced" || item.difficulty_level === "intermediate";
        }
        return item.category === categoryFilter;
      });
    }

    return filtered;
  }, [items, searchQuery, language, categoryFilter, activeType]);

  // Separate featured items (courses or programs)
  const featuredItems = useMemo(() => {
    if (activeType !== "all" && activeType !== "course" && activeType !== "program") return [];
    return filteredItems.filter((item) => 
      item.is_featured && (item.item_type === "course" || item.item_type === "program")
    ).slice(0, 1);
  }, [filteredItems, activeType]);

  const regularItems = useMemo(() => {
    const featuredIds = new Set(featuredItems.map((c) => c.id));
    return filteredItems.filter((item) => !featuredIds.has(item.id));
  }, [filteredItems, featuredItems]);

  const handleTypeChange = (type: AcademyItemType | "all") => {
    if (type === "all") {
      setSearchParams({});
    } else {
      setSearchParams({ type });
    }
    setCategoryFilter("all");
  };

  const showCourseUI = activeType === "all" || activeType === "course" || activeType === "program";

  return (
    <div className="min-h-screen bg-background px-4 pt-5 pb-24 safe-top">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate("/")}
          className="p-2 -ml-2 rounded-xl hover:bg-white/10 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            {cms.get("academy.hero.title")}
          </h1>
          <p className="text-xs text-white/60">
            {cms.get("academy.hero.subtitle")}
          </p>
        </div>
      </div>

      {/* Hero Section (only on main view) */}
      {activeType === "all" && !searchQuery && (
        <>
          <AcademyHero />
          {/* Testimonials Section - below hero */}
          <TestimonialsSection location="academy" className="mb-4" />
        </>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
        <input
          type="text"
          placeholder={cms.get("academy.search.placeholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 text-sm"
        />
      </div>

      {/* Type Filters */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {TYPE_FILTERS.map((filter) => (
          <button
            key={filter.type}
            onClick={() => handleTypeChange(filter.type)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
              activeType === filter.type
                ? "bg-white text-[hsl(340_45%_45%)] shadow-md"
                : "bg-white/10 text-white/80 hover:bg-white/15 border border-white/5"
            )}
          >
            <filter.icon className={cn(
              "h-4 w-4",
              activeType === filter.type ? "text-[hsl(340_45%_50%)]" : "text-white/60"
            )} />
            {cms.get(filter.labelKey)}
          </button>
        ))}
      </div>

      {/* Category Filter (for courses) */}
      {showCourseUI && !searchQuery && (
        <CourseCategoryFilter
          activeCategory={categoryFilter}
          onCategoryChange={setCategoryFilter}
        />
      )}

      {/* Content List */}
      <div className="space-y-4">
        {isLoading ? (
          <>
            <Skeleton className="h-64 rounded-3xl" />
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-white/60">
              {cms.get("academy.empty.title")}
            </p>
          </div>
        ) : (
          <>
            {/* Featured Item */}
            {featuredItems.length > 0 && !searchQuery && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-6"
              >
                <h2 className="text-sm font-medium text-white/70 mb-3 px-1">
                  {cms.get("academy.featured.title")}
                </h2>
                <CourseCard course={featuredItems[0]} featured index={0} />
              </motion.div>
            )}

            {/* Regular Items */}
            {regularItems.length > 0 ? (
              <div className="space-y-3">
                {!searchQuery && featuredItems.length > 0 && (
                  <h2 className="text-sm font-medium text-white/70 mb-3 px-1">
                    {activeType === "course"
                      ? cms.get("academy.allCourses.title")
                      : activeType === "program"
                        ? cms.get("academy.allPrograms.title")
                        : cms.get("academy.moreContent.title")}
                  </h2>
                )}
                
                {regularItems.map((item, index) =>
                  item.item_type === "course" || item.item_type === "program" ? (
                    <CourseCard key={item.id} course={item} index={index} />
                  ) : (
                    <AcademyCard key={item.id} item={item} />
                  )
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/60">
                  {searchQuery
                    ? cms.get("academy.empty.noResults")
                    : cms.get("academy.empty.title")}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Info Banner */}
      <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
        <p className="text-sm text-white text-center">
          {cms.get("academy.footer.disclaimer")}
        </p>
      </div>
    </div>
  );
}
