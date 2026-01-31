import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CourseLesson {
  id: string;
  course_id: string;
  title_pt: string;
  title_en: string;
  description_pt: string | null;
  description_en: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  duration_seconds: number;
  display_order: number;
  is_preview: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Fetch lessons for a specific course
export function useCourseLessons(courseId: string | undefined) {
  return useQuery({
    queryKey: ["course-lessons", courseId],
    queryFn: async () => {
      if (!courseId) return [];
      
      const { data, error } = await supabase
        .from("course_lessons")
        .select("*")
        .eq("course_id", courseId)
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as CourseLesson[];
    },
    enabled: !!courseId,
  });
}

// Admin hook - fetches all lessons including inactive
export function useAdminCourseLessons(courseId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["admin-course-lessons", courseId],
    queryFn: async () => {
      if (!courseId) return [];
      
      const { data, error } = await supabase
        .from("course_lessons")
        .select("*")
        .eq("course_id", courseId)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as CourseLesson[];
    },
    enabled: !!courseId,
  });

  const createMutation = useMutation({
    mutationFn: async (lesson: Omit<CourseLesson, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("course_lessons")
        .insert(lesson)
        .select()
        .single();
      if (error) throw error;
      return data as CourseLesson;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-course-lessons", courseId] });
      queryClient.invalidateQueries({ queryKey: ["course-lessons", courseId] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CourseLesson> & { id: string }) => {
      const { data, error } = await supabase
        .from("course_lessons")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as CourseLesson;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-course-lessons", courseId] });
      queryClient.invalidateQueries({ queryKey: ["course-lessons", courseId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("course_lessons").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-course-lessons", courseId] });
      queryClient.invalidateQueries({ queryKey: ["course-lessons", courseId] });
    },
  });

  return {
    ...query,
    createLesson: createMutation.mutateAsync,
    updateLesson: updateMutation.mutateAsync,
    deleteLesson: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

// Format duration from seconds to readable string
export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return "0m";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  return `${minutes}m`;
}

// Format total duration from minutes
export function formatTotalDuration(minutes: number): string {
  if (!minutes || minutes <= 0) return "0m";
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  return `${mins}m`;
}
