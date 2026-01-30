import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, BookOpen, PlayCircle, Calendar, Package, Search } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAcademyItems, AcademyItemType } from "@/hooks/useAcademyItems";
import { AcademyCard } from "@/components/academy/AcademyCard";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const TYPE_FILTERS: Array<{
  type: AcademyItemType | "all";
  icon: typeof BookOpen;
  label: { pt: string; en: string };
}> = [
  { type: "all", icon: BookOpen, label: { pt: "Todos", en: "All" } },
  { type: "ebook", icon: BookOpen, label: { pt: "Ebooks", en: "Ebooks" } },
  { type: "course", icon: PlayCircle, label: { pt: "Cursos", en: "Courses" } },
  { type: "program", icon: Calendar, label: { pt: "Programas", en: "Programs" } },
  { type: "bundle", icon: Package, label: { pt: "Bundles", en: "Bundles" } },
];

export default function Learn() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");

  const activeType = (searchParams.get("type") as AcademyItemType | "all") || "all";
  const { data: items, isLoading, error } = useAcademyItems(
    activeType === "all" ? undefined : activeType
  );

  const filteredItems = useMemo(() => {
    if (!items) return [];
    if (!searchQuery.trim()) return items;

    const query = searchQuery.toLowerCase();
    return items.filter((item) => {
      const title = language === "pt" ? item.title_pt : item.title_en;
      const subtitle = language === "pt" ? item.subtitle_pt : item.subtitle_en;
      const description = language === "pt" ? item.description_pt : item.description_en;

      return (
        title.toLowerCase().includes(query) ||
        subtitle?.toLowerCase().includes(query) ||
        description?.toLowerCase().includes(query)
      );
    });
  }, [items, searchQuery, language]);

  const handleTypeChange = (type: AcademyItemType | "all") => {
    if (type === "all") {
      setSearchParams({});
    } else {
      setSearchParams({ type });
    }
  };

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
            {t({ pt: "Academia", en: "Academy" })}
          </h1>
          <p className="text-xs text-white/60">
            {t({ pt: "Cursos, ebooks e programas", en: "Courses, ebooks and programs" })}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
        <input
          type="text"
          placeholder={t({ pt: "Pesquisar conteúdo...", en: "Search content..." })}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
        />
      </div>

      {/* Type Filters */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-2 -mx-4 px-4">
        {TYPE_FILTERS.map((filter) => (
          <button
            key={filter.type}
            onClick={() => handleTypeChange(filter.type)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
              activeType === filter.type
                ? "bg-white text-primary-foreground"
                : "bg-white/10 text-white/80 hover:bg-white/20"
            )}
          >
            <filter.icon className="h-4 w-4" />
            {t(filter.label)}
          </button>
        ))}
      </div>

      {/* Content List */}
      <div className="space-y-3">
        {isLoading ? (
          <>
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-white/60">
              {t({ pt: "Erro ao carregar conteúdo", en: "Error loading content" })}
            </p>
          </div>
        ) : filteredItems.length > 0 ? (
          filteredItems.map((item) => <AcademyCard key={item.id} item={item} />)
        ) : (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/60">
              {searchQuery
                ? t({ pt: "Nenhum resultado encontrado", en: "No results found" })
                : t({ pt: "Brevemente novos conteúdos", en: "New content coming soon" })}
            </p>
          </div>
        )}
      </div>

      {/* Info Banner */}
      <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
        <p className="text-xs text-white/60 text-center">
          {t({
            pt: "Todos os conteúdos são criados por profissionais certificados. Compras processadas externamente com segurança.",
            en: "All content is created by certified professionals. Purchases processed securely externally.",
          })}
        </p>
      </div>
    </div>
  );
}
