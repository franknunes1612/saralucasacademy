import { useState, useMemo, useCallback, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, BookOpen, Award, User, ShoppingCart, Check, Share2, CheckCircle2, Loader2, Video, FileText, Package, Users, Download } from "lucide-react";
import { useCmsContent } from "@/hooks/useCmsContent";
import { useLanguage } from "@/hooks/useLanguage";
import { useAcademyItems, AcademyItem } from "@/hooks/useAcademyItems";
import { useCourseLessons, CourseLesson, formatTotalDuration } from "@/hooks/useCourseLessons";
import { useHasPurchased } from "@/hooks/useUserPurchases";
import { useCourseProgress, useMarkLessonComplete } from "@/hooks/useLessonProgress";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { VideoPlayer } from "@/components/academy/VideoPlayer";
import { LessonList } from "@/components/academy/LessonList";
import { TestimonialsSection } from "@/components/testimonials/TestimonialsSection";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

type ExtendedAcademyItem = AcademyItem & {
  instructor_name?: string;
  total_duration_minutes?: number;
  total_lessons?: number;
  difficulty_level?: string;
  what_you_learn_pt?: string[];
  what_you_learn_en?: string[];
  video_preview_url?: string;
  who_is_this_for_pt?: string[];
  who_is_this_for_en?: string[];
  whats_included_pt?: string[];
  whats_included_en?: string[];
};

export default function CourseDetail() {
  const { courseId, programId, ebookId, bundleId } = useParams<{ 
    courseId?: string; 
    programId?: string; 
    ebookId?: string;
    bundleId?: string;
  }>();
  const itemId = courseId || programId || ebookId || bundleId;
  const isProgram = !!programId;
  const isEbook = !!ebookId;
  const isBundle = !!bundleId;
  
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { language } = useLanguage();
  const cms = useCmsContent();
  const { user } = useAuth();
  
  const [currentLesson, setCurrentLesson] = useState<CourseLesson | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);

  // Fetch item details (works for courses, programs, ebooks, bundles)
  const { data: allCourses, isLoading: isLoadingCourses } = useAcademyItems("course");
  const { data: allPrograms, isLoading: isLoadingPrograms } = useAcademyItems("program");
  const { data: allEbooks, isLoading: isLoadingEbooks } = useAcademyItems("ebook");
  const { data: allBundles, isLoading: isLoadingBundles } = useAcademyItems("bundle");
  
  const course = useMemo(() => {
    // Search in all item types
    const allItems = [
      ...(allCourses || []),
      ...(allPrograms || []),
      ...(allEbooks || []),
      ...(allBundles || []),
    ];
    return allItems.find((item) => item.id === itemId) as ExtendedAcademyItem | undefined;
  }, [allCourses, allPrograms, allEbooks, allBundles, itemId]);
  
  const isLoadingCourse = isLoadingCourses || isLoadingPrograms || isLoadingEbooks || isLoadingBundles;

  // Fetch lessons
  const { data: lessons, isLoading: isLoadingLessons } = useCourseLessons(itemId);

  // Check purchase status
  const { hasPurchased, isLoading: isLoadingPurchase } = useHasPurchased(itemId || "");

  // Get progress
  const { completedLessonIds, completedCount, progressPercentage } = useCourseProgress(
    itemId || "",
    lessons?.length || 0
  );

  // Lesson completion
  const { markComplete, isPending: isMarkingComplete } = useMarkLessonComplete();

  const handleMarkComplete = useCallback(async () => {
    if (!currentLesson || !itemId || isMarkingComplete) return;
    await markComplete(currentLesson.id, itemId);
  }, [currentLesson, itemId, markComplete, isMarkingComplete]);

  // Handle payment verification when returning from Stripe
  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");
    
    if (paymentStatus === "success" && sessionId && !isVerifyingPayment) {
      setIsVerifyingPayment(true);
      
      supabase.functions.invoke("verify-course-payment", {
        body: { sessionId },
      }).then(({ data, error }) => {
        if (error) {
          console.error("Payment verification error:", error);
          toast.error("Payment verification failed. Please contact support.");
        } else if (data?.success) {
          toast.success("Course unlocked! Welcome to your new course.");
          // Clear the URL params
          setSearchParams({});
          // Refresh the page to show unlocked state
          window.location.reload();
        }
      }).finally(() => {
        setIsVerifyingPayment(false);
      });
    } else if (paymentStatus === "canceled") {
      toast.info("Payment was canceled.");
      setSearchParams({});
    }
  }, [searchParams, setSearchParams, isVerifyingPayment]);

  if (isLoadingCourse || isLoadingLessons) {
    return (
      <div className="min-h-screen bg-background px-4 pt-5 pb-24 safe-top">
        <Skeleton className="h-8 w-32 mb-4" />
        <Skeleton className="h-48 rounded-2xl mb-4" />
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-6" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background px-4 pt-5 pb-24 safe-top flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60 mb-4">
            {cms.get("academy.detail.notFound")}
          </p>
          <button
            onClick={() => navigate("/learn")}
            className="px-4 py-2 rounded-xl bg-white text-[hsl(340_45%_45%)] font-medium"
          >
            {cms.get("academy.detail.backToAcademy")}
          </button>
        </div>
      </div>
    );
  }

  const title = language === "pt" ? course.title_pt : course.title_en;
  const subtitle = language === "pt" ? course.subtitle_pt : course.subtitle_en;
  const description = language === "pt" ? course.description_pt : course.description_en;
  const whatYouLearn = language === "pt" ? course.what_you_learn_pt : course.what_you_learn_en;
  const difficultyLabel = cms.get(`academy.difficulty.${course.difficulty_level || "beginner"}`);

  const formatPrice = (price: number) => {
    const symbol = course.currency === "EUR" ? "€" : course.currency === "USD" ? "$" : "£";
    return `${symbol}${price.toFixed(2)}`;
  };

  const handleLessonSelect = (lesson: CourseLesson) => {
    setCurrentLesson(lesson);
  };

  const handlePurchase = async (asGuest = false) => {
    if (!user && !asGuest) {
      // Show option to login or continue as guest
      toast.info(
        language === "pt" 
          ? "Inicia sessão ou continua como convidado." 
          : "Log in or continue as guest."
      );
      return;
    }

    if (isCheckingOut) return;
    setIsCheckingOut(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-course-checkout", {
        body: { courseId: itemId, guestCheckout: asGuest },
      });

      if (error) throw error;
      if (data?.url) {
        // Use location.href instead of window.open to avoid popup blockers
        window.location.href = data.url;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Checkout failed";
      toast.error(message);
      setIsCheckingOut(false);
    }
    // Don't reset isCheckingOut on success - page will redirect
  };

  const handleShare = async () => {
    const shareData = {
      title,
      text: subtitle || description || "",
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
      }
    } catch (error) {
      console.error("Share error:", error);
    }
  };

  // Get video to show (current lesson or preview)
  const videoUrl = currentLesson?.video_url || course.video_preview_url;
  const videoTitle = currentLesson
    ? language === "pt"
      ? currentLesson.title_pt
      : currentLesson.title_en
    : cms.get("academy.detail.preview");

  const isCurrentLessonCompleted = currentLesson ? completedLessonIds.includes(currentLesson.id) : false;

  return (
    <div className="min-h-screen bg-background pb-32 safe-top">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md px-4 py-3 flex items-center gap-3 border-b border-white/10">
        <button
          onClick={() => navigate("/learn")}
          className="p-2 -ml-2 rounded-xl hover:bg-white/10 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>
        
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-white truncate">{title}</h1>
          {hasPurchased && lessons && lessons.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <Progress value={progressPercentage} className="h-1 flex-1 bg-white/10" />
              <span className="text-[10px] text-white/70">{progressPercentage}%</span>
            </div>
          )}
        </div>

        <button
          onClick={handleShare}
          className="p-2 rounded-xl hover:bg-white/10 transition-colors"
          aria-label="Share"
        >
          <Share2 className="h-5 w-5 text-white/70" />
        </button>
      </div>

      {/* Video Player */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="px-4 pt-4"
      >
        {videoUrl ? (
          <div className="relative">
            <VideoPlayer
              src={videoUrl}
              poster={course.cover_image_url || undefined}
              title={videoTitle}
            />
            {/* Mark Complete Button */}
            {hasPurchased && currentLesson && (
              <button
                onClick={handleMarkComplete}
                disabled={isMarkingComplete || isCurrentLessonCompleted}
                className={`absolute bottom-4 right-4 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isCurrentLessonCompleted
                    ? "bg-[hsl(155_40%_45%)] text-white"
                    : "bg-white/90 text-[hsl(340_45%_45%)] hover:bg-white"
                }`}
              >
                <CheckCircle2 className="h-4 w-4" />
                {isCurrentLessonCompleted
                  ? cms.get("academy.detail.completed")
                  : cms.get("academy.detail.markComplete")}
              </button>
            )}
          </div>
        ) : (
          <div className="rounded-2xl bg-white/5 flex items-center justify-center overflow-hidden">
            {course.cover_image_url ? (
              <img
                src={course.cover_image_url}
                alt={title}
                className="w-full h-auto rounded-2xl"
              />
            ) : (
              <div className="aspect-video w-full flex items-center justify-center bg-gradient-to-br from-[hsl(340_40%_65%)] to-[hsl(30_40%_70%)] rounded-2xl">
                <span className="text-8xl">{course.cover_emoji || "🎓"}</span>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Course Info */}
      <div className="px-4 pt-5 space-y-5">
        {/* Title & Meta */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
          
          {subtitle && (
            <p className="text-sm text-white/70 mb-3">{subtitle}</p>
          )}

          {/* Metadata chips */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-xs text-white/70">
              <User className="h-3.5 w-3.5" />
              <span>{course.instructor_name || "Sara Lucas"}</span>
            </div>
            
            {course.total_duration_minutes && course.total_duration_minutes > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-xs text-white/70">
                <Clock className="h-3.5 w-3.5" />
                <span>{formatTotalDuration(course.total_duration_minutes)}</span>
              </div>
            )}
            
            {lessons && lessons.length > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-xs text-white/70">
                <BookOpen className="h-3.5 w-3.5" />
                <span>
                  {lessons.length} {cms.get("academy.course.lessons")}
                </span>
              </div>
            )}
            
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-xs text-white/70">
              <Award className="h-3.5 w-3.5" />
              <span>{difficultyLabel}</span>
            </div>
          </div>
        </motion.div>

        {/* Progress Card (if purchased) */}
        {hasPurchased && lessons && lessons.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="rounded-2xl bg-gradient-to-r from-[hsl(155_40%_45%)]/20 to-[hsl(155_40%_35%)]/10 border border-[hsl(155_40%_45%)]/30 p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white">
                {cms.get("academy.detail.yourProgress")}
              </span>
              <span className="text-sm font-bold text-[hsl(155_40%_55%)]">
                {completedCount}/{lessons.length}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2 bg-white/10" />
            <p className="text-xs text-white/70 mt-2">
              {progressPercentage === 100
                ? cms.get("academy.detail.courseComplete")
                : `${progressPercentage}% ${cms.get("academy.detail.completed")}`}
            </p>
          </motion.div>
        )}

        {/* Description / About */}
        {description && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl bg-white/5 border border-white/10 p-4"
          >
            <h3 className="font-semibold text-white text-sm mb-2">
              {isProgram 
                ? cms.get("academy.detail.aboutProgram") || "Sobre o Programa"
                : cms.get("academy.detail.about")}
            </h3>
            <p className="text-sm text-white/70 leading-relaxed">{description}</p>
          </motion.div>
        )}

        {/* Format Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.17 }}
          className="rounded-2xl bg-white/5 border border-white/10 p-4"
        >
          <h3 className="font-semibold text-white text-sm mb-3">
            {cms.get("academy.detail.format") || "Formato"}
          </h3>
          <div className="flex items-center gap-3">
            {course.item_type === "course" || course.item_type === "program" ? (
              <>
                <div className="p-2 rounded-xl bg-purple-500/20">
                  <Video className="h-5 w-5 text-purple-300" />
                </div>
                <div>
                  <p className="text-sm text-white font-medium">
                    {course.item_type === "program" 
                      ? cms.get("academy.detail.formatProgram") || "Programa completo com acompanhamento"
                      : cms.get("academy.detail.formatVideo") || "Aulas em vídeo com acesso vitalício"}
                  </p>
                  {lessons && lessons.length > 0 && (
                    <p className="text-xs text-white/70">
                      {lessons.length} {cms.get("academy.course.lessons")}
                      {course.total_duration_minutes && course.total_duration_minutes > 0 && (
                        <> • {formatTotalDuration(course.total_duration_minutes)}</>
                      )}
                    </p>
                  )}
                </div>
              </>
            ) : course.item_type === "ebook" ? (
              <>
                <div className="p-2 rounded-xl bg-blue-500/20">
                  <FileText className="h-5 w-5 text-blue-300" />
                </div>
                <div>
                  <p className="text-sm text-white font-medium">
                    {cms.get("academy.detail.formatEbook") || "Ebook digital para download"}
                  </p>
                  <p className="text-xs text-white/70">PDF</p>
                </div>
              </>
            ) : (
              <>
                <div className="p-2 rounded-xl bg-orange-500/20">
                  <Package className="h-5 w-5 text-orange-300" />
                </div>
                <div>
                  <p className="text-sm text-white font-medium">
                    {cms.get("academy.detail.formatBundle") || "Pacote com múltiplos conteúdos"}
                  </p>
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* What's Included (for bundles) */}
        {course.item_type === "bundle" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="rounded-2xl bg-white/5 border border-white/10 p-4"
          >
            <h3 className="font-semibold text-white text-sm mb-3">
              {cms.get("academy.detail.whatsIncluded") || "O Que Está Incluído"}
            </h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[hsl(155_40%_55%)]" />
                <span className="text-sm text-white/70">Curso completo em vídeo</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[hsl(155_40%_55%)]" />
                <span className="text-sm text-white/70">Ebook complementar</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[hsl(155_40%_55%)]" />
                <span className="text-sm text-white/70">Materiais de apoio</span>
              </li>
            </ul>
          </motion.div>
        )}

        {/* What you'll learn */}
        {whatYouLearn && whatYouLearn.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl bg-white/5 border border-white/10 p-4"
          >
            <h3 className="font-semibold text-white text-sm mb-3">
              {cms.get("academy.detail.whatYouLearn")}
            </h3>
            <ul className="space-y-2">
              {whatYouLearn.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-[hsl(155_40%_55%)] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-white/70">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Lesson List */}
        {lessons && lessons.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <LessonList
              lessons={lessons}
              currentLessonId={currentLesson?.id}
              onLessonSelect={handleLessonSelect}
              isPurchased={hasPurchased}
              completedLessons={completedLessonIds}
            />
          </motion.div>
        )}

        {/* Login prompt for non-authenticated users */}
        {!user && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.27 }}
            className="rounded-2xl bg-white/5 border border-white/10 p-4 text-center"
          >
            <p className="text-sm text-white/70 mb-3">
              {cms.get("academy.detail.loginPrompt")}
            </p>
            <button
              onClick={() => navigate("/profile")}
              className="px-4 py-2 rounded-xl bg-white/10 text-white text-sm font-medium hover:bg-white/15 transition-colors"
            >
              {cms.get("academy.detail.loginButton")}
            </button>
          </motion.div>
        )}

        {/* Testimonials Section */}
        <TestimonialsSection productId={itemId} location="academy" className="mt-4" />

        {/* Info Banner */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-xs text-white/70 text-center">
            {cms.get("academy.detail.lifetimeAccess")}
          </p>
        </div>
      </div>

      {/* Fixed Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent"
      >
        <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
          <div>
            {hasPurchased ? (
              <>
                <span className="text-lg font-bold text-[hsl(155_40%_55%)]">
                  {cms.get("academy.detail.unlocked")}
                </span>
                <p className="text-xs text-white/70">
                  {completedCount}/{lessons?.length || 0} {cms.get("academy.detail.lessonsCompleted")}
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-white">
                    {formatPrice(course.price)}
                  </span>
                  {course.original_price && course.original_price > course.price && (
                    <span className="text-sm text-white/70 line-through">
                      {formatPrice(course.original_price)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/70">
                  {cms.get("academy.detail.accessLabel")}
                </p>
              </>
            )}
          </div>

          {hasPurchased ? (
            course.item_type === "ebook" && (course as any).download_url ? (
              <button
                onClick={() => navigate(`/learn/ebook/${itemId}/view`)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-[hsl(340_45%_45%)] font-semibold shadow-lg hover:bg-white/90 transition-colors"
              >
                <Download className="h-5 w-5" />
                <span>{language === "pt" ? "Abrir Ebook" : "Open Ebook"}</span>
              </button>
            ) : (
              <button
                onClick={() => lessons?.[0] && handleLessonSelect(lessons[0])}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-[hsl(340_45%_45%)] font-semibold shadow-lg hover:bg-white/90 transition-colors"
              >
                <BookOpen className="h-5 w-5" />
                <span>{cms.get("academy.detail.continue")}</span>
              </button>
            )
          ) : user ? (
            <button
              onClick={() => handlePurchase(false)}
              disabled={isCheckingOut}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-[hsl(340_45%_45%)] font-semibold shadow-lg hover:bg-white/90 transition-colors disabled:opacity-50"
            >
              {isCheckingOut ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5" />
                  <span>{cms.get("academy.detail.buyNow")}</span>
                </>
              )}
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handlePurchase(true)}
                disabled={isCheckingOut}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[hsl(340_45%_45%)] font-semibold shadow-lg hover:bg-white/90 transition-colors disabled:opacity-50 text-sm"
              >
                {isCheckingOut ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    <span>{language === "pt" ? "Comprar" : "Buy Now"}</span>
                  </>
                )}
              </button>
              <button
                onClick={() => navigate("/profile")}
                className="text-xs text-white/60 hover:text-white/80 transition-colors underline"
              >
                {language === "pt" ? "ou criar conta" : "or create account"}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
