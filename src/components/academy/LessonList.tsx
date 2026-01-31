import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Lock, Check, ChevronDown, Clock } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { CourseLesson, formatDuration } from "@/hooks/useCourseLessons";
import { cn } from "@/lib/utils";

interface LessonListProps {
  lessons: CourseLesson[];
  currentLessonId?: string;
  onLessonSelect: (lesson: CourseLesson) => void;
  isPurchased?: boolean;
  completedLessons?: string[];
}

export function LessonList({
  lessons,
  currentLessonId,
  onLessonSelect,
  isPurchased = false,
  completedLessons = [],
}: LessonListProps) {
  const { language, t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(true);

  const totalDuration = lessons.reduce((acc, lesson) => acc + (lesson.duration_seconds || 0), 0);
  const completedCount = completedLessons.length;

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white/10">
            <Play className="h-4 w-4 text-white/80" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-white text-sm">
              {t({ pt: "Conteúdo do curso", en: "Course content" })}
            </h3>
            <p className="text-xs text-white/50">
              {lessons.length} {t({ pt: "aulas", en: "lessons" })} • {formatDuration(totalDuration)}
              {isPurchased && completedCount > 0 && (
                <span className="text-[hsl(155_40%_55%)] ml-2">
                  • {completedCount}/{lessons.length} {t({ pt: "concluídas", en: "completed" })}
                </span>
              )}
            </p>
          </div>
        </div>
        
        <ChevronDown
          className={cn(
            "h-5 w-5 text-white/50 transition-transform",
            isExpanded && "rotate-180"
          )}
        />
      </button>

      {/* Lessons */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/10">
              {lessons.map((lesson, index) => {
                const title = language === "pt" ? lesson.title_pt : lesson.title_en;
                const isLocked = !isPurchased && !lesson.is_preview;
                const isCompleted = completedLessons.includes(lesson.id);
                const isCurrent = lesson.id === currentLessonId;

                return (
                  <button
                    key={lesson.id}
                    onClick={() => !isLocked && onLessonSelect(lesson)}
                    disabled={isLocked}
                    className={cn(
                      "w-full flex items-center gap-3 p-4 text-left transition-colors",
                      isLocked
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-white/5",
                      isCurrent && "bg-white/10",
                      index !== lessons.length - 1 && "border-b border-white/5"
                    )}
                  >
                    {/* Number / Status */}
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium",
                        isCompleted
                          ? "bg-[hsl(155_40%_45%)] text-white"
                          : isCurrent
                          ? "bg-white text-[hsl(340_45%_45%)]"
                          : "bg-white/10 text-white/60"
                      )}
                    >
                      {isCompleted ? (
                        <Check className="h-4 w-4" />
                      ) : isLocked ? (
                        <Lock className="h-3.5 w-3.5" />
                      ) : (
                        index + 1
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "text-sm font-medium truncate",
                            isCurrent ? "text-white" : "text-white/80"
                          )}
                        >
                          {title}
                        </span>
                        {lesson.is_preview && !isPurchased && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[hsl(30_50%_65%)]/20 text-[hsl(30_60%_75%)] font-medium">
                            {t({ pt: "Prévia", en: "Preview" })}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1 text-[10px] text-white/40 mt-0.5">
                        <Clock className="h-3 w-3" />
                        <span>{formatDuration(lesson.duration_seconds)}</span>
                      </div>
                    </div>

                    {/* Play indicator */}
                    {!isLocked && (
                      <Play
                        className={cn(
                          "h-4 w-4 flex-shrink-0",
                          isCurrent ? "text-white" : "text-white/40"
                        )}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
