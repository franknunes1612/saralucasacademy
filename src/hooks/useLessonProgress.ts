import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  course_id: string;
  completed: boolean;
  progress_seconds: number;
  completed_at: string | null;
  last_watched_at: string;
  created_at: string;
  updated_at: string;
}

export function useLessonProgress(courseId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["lesson-progress", courseId, user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("user_lesson_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("course_id", courseId);

      if (error) throw error;
      return data as LessonProgress[];
    },
    enabled: !!user && !!courseId,
  });
}

export function useCourseProgress(courseId: string, totalLessons: number) {
  const { data: progress, isLoading } = useLessonProgress(courseId);
  
  const completedLessons = progress?.filter(p => p.completed) ?? [];
  const completedCount = completedLessons.length;
  const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  
  return {
    completedLessonIds: completedLessons.map(p => p.lesson_id),
    completedCount,
    totalLessons,
    progressPercentage,
    isLoading,
  };
}

export function useUpdateLessonProgress() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      lessonId,
      courseId,
      completed,
      progressSeconds,
    }: {
      lessonId: string;
      courseId: string;
      completed?: boolean;
      progressSeconds?: number;
    }) => {
      if (!user) throw new Error("User not authenticated");

      const updateData = {
        user_id: user.id,
        lesson_id: lessonId,
        course_id: courseId,
        last_watched_at: new Date().toISOString(),
        completed: completed ?? false,
        completed_at: completed ? new Date().toISOString() : null,
        progress_seconds: progressSeconds ?? 0,
      };

      const { data, error } = await supabase
        .from("user_lesson_progress")
        .upsert(updateData, {
          onConflict: "user_id,lesson_id",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["lesson-progress", variables.courseId] 
      });
    },
  });
}

export function useMarkLessonComplete() {
  const updateProgress = useUpdateLessonProgress();

  return {
    markComplete: (lessonId: string, courseId: string) =>
      updateProgress.mutateAsync({ lessonId, courseId, completed: true }),
    markIncomplete: (lessonId: string, courseId: string) =>
      updateProgress.mutateAsync({ lessonId, courseId, completed: false }),
    isPending: updateProgress.isPending,
  };
}
