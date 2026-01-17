import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";

// If your posts queryKey uses api.posts.list.path, keep it consistent.
const POSTS_KEY = [api.posts.list.path];

export function useToggleLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (args: { postId: number; isLiked: boolean }) => {
      const { postId, isLiked } = args;

      const res = await fetch(`/api/posts/${postId}/like`, {
        method: isLiked ? "DELETE" : "POST",
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized");
        throw new Error("Failed to toggle like");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POSTS_KEY });
    },
  });
}
