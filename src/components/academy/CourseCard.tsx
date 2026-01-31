import { motion } from "framer-motion";
import { Play, Clock, BookOpen, Award, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { AcademyItem } from "@/hooks/useAcademyItems";
import { formatTotalDuration } from "@/hooks/useCourseLessons";
import { cn } from "@/lib/utils";

interface CourseCardProps {
  course: AcademyItem & {
    instructor_name?: string;
    total_duration_minutes?: number;
    total_lessons?: number;
    difficulty_level?: string;
  };
  featured?: boolean;
  index?: number;
}

const DIFFICULTY_LABELS: Record<string, { pt: string; en: string }> = {
  beginner: { pt: "Iniciante", en: "Beginner" },
  intermediate: { pt: "Intermédio", en: "Intermediate" },
  advanced: { pt: "Avançado", en: "Advanced" },
};

export function CourseCard({ course, featured = false, index = 0 }: CourseCardProps) {
  const navigate = useNavigate();
  const { language, t } = useLanguage();

  const title = language === "pt" ? course.title_pt : course.title_en;
  const subtitle = language === "pt" ? course.subtitle_pt : course.subtitle_en;
  const badge = language === "pt" ? course.badge_pt : course.badge_en;
  const difficulty = DIFFICULTY_LABELS[course.difficulty_level || "beginner"];

  const formatPrice = (price: number) => {
    const symbol = course.currency === "EUR" ? "€" : course.currency === "USD" ? "$" : "£";
    return `${symbol}${price.toFixed(2)}`;
  };

  const handleClick = () => {
    navigate(`/learn/course/${course.id}`);
  };

  if (featured) {
    return (
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, duration: 0.4 }}
        onClick={handleClick}
        className="w-full text-left group"
      >
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-white/15 to-white/5 border border-white/10 shadow-xl">
          {/* Cover Image */}
          <div className="relative aspect-video">
            {course.cover_image_url ? (
              <img
                src={course.cover_image_url}
                alt={title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[hsl(340_40%_65%)] to-[hsl(30_40%_70%)] flex items-center justify-center">
                <span className="text-6xl">{course.cover_emoji || "🎓"}</span>
              </div>
            )}
            
            {/* Play overlay */}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Play className="h-7 w-7 text-[hsl(340_45%_45%)] ml-1" fill="currentColor" />
              </div>
            </div>

            {/* Badge */}
            {badge && (
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[hsl(30_50%_65%)] text-white text-xs font-semibold shadow-md">
                {badge}
              </div>
            )}

            {/* Type label */}
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/90 text-[hsl(340_45%_40%)] text-xs font-medium">
              {t({ pt: "Curso em vídeo", en: "Video course" })}
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            <h3 className="text-lg font-bold text-white mb-1 line-clamp-2 group-hover:text-white/90 transition-colors">
              {title}
            </h3>
            
            {subtitle && (
              <p className="text-sm text-white/70 line-clamp-2 mb-4">
                {subtitle}
              </p>
            )}

            {/* Metadata */}
            <div className="flex items-center gap-4 text-xs text-white/60 mb-4">
              {course.total_duration_minutes && course.total_duration_minutes > 0 && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{formatTotalDuration(course.total_duration_minutes)}</span>
                </div>
              )}
              {course.total_lessons && course.total_lessons > 0 && (
                <div className="flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>
                    {course.total_lessons} {t({ pt: "aulas", en: "lessons" })}
                  </span>
                </div>
              )}
              {difficulty && (
                <div className="flex items-center gap-1">
                  <Award className="h-3.5 w-3.5" />
                  <span>{t(difficulty)}</span>
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-white">
                  {formatPrice(course.price)}
                </span>
                {course.original_price && course.original_price > course.price && (
                  <span className="text-sm text-white/50 line-through">
                    {formatPrice(course.original_price)}
                  </span>
                )}
              </div>
              
              <div className="px-4 py-2 rounded-xl bg-white text-[hsl(340_45%_45%)] text-sm font-semibold group-hover:bg-white/90 transition-colors">
                {t({ pt: "Ver curso", en: "View course" })}
              </div>
            </div>
          </div>
        </div>
      </motion.button>
    );
  }

  // Compact card variant
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      onClick={handleClick}
      className="w-full text-left group"
    >
      <div className="flex gap-4 p-4 rounded-2xl bg-white/8 border border-white/10 hover:bg-white/12 transition-all shadow-sm hover:shadow-md">
        {/* Thumbnail */}
        <div className="relative w-28 h-20 rounded-xl overflow-hidden flex-shrink-0">
          {course.cover_image_url ? (
            <img
              src={course.cover_image_url}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[hsl(340_40%_65%)] to-[hsl(30_40%_70%)] flex items-center justify-center">
              <span className="text-2xl">{course.cover_emoji || "🎓"}</span>
            </div>
          )}
          
          {/* Play icon */}
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
              <Play className="h-4 w-4 text-[hsl(340_45%_45%)] ml-0.5" fill="currentColor" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-white text-sm line-clamp-2 group-hover:text-white/90">
              {title}
            </h3>
            {badge && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[hsl(30_50%_65%)]/20 text-[hsl(30_60%_75%)] font-medium flex-shrink-0">
                {badge}
              </span>
            )}
          </div>

          {/* Metadata row */}
          <div className="flex items-center gap-3 text-[10px] text-white/50 mb-2">
            {course.total_duration_minutes && course.total_duration_minutes > 0 && (
              <span>{formatTotalDuration(course.total_duration_minutes)}</span>
            )}
            {course.total_lessons && course.total_lessons > 0 && (
              <span>
                {course.total_lessons} {t({ pt: "aulas", en: "lessons" })}
              </span>
            )}
            {difficulty && <span>{t(difficulty)}</span>}
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">{formatPrice(course.price)}</span>
            {course.original_price && course.original_price > course.price && (
              <span className="text-[10px] text-white/40 line-through">
                {formatPrice(course.original_price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.button>
  );
}
