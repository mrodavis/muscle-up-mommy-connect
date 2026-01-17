import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";
import type { Post, User, Comment } from "@shared/schema";

/* =========================
   TYPES
========================= */

type PostWithDetails = Post & {
  author: User;
  comments: Comment[];
  likes: { userId: number }[];
};

/* =========================
   GET POSTS
========================= */

export function usePosts(groupId?: string) {
  return useQuery<PostWithDetails[]>({
    queryKey: [api.posts.list.path, groupId ?? "all"],
    queryFn: async () => {
      const url = groupId
        ? `${api.posts.list.path}?groupId=${groupId}`
        : api.posts.list.path;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch posts");

      return api.posts.list.responses[200].parse(await res.json());
    },
  });
}

/* =========================
   CREATE POST
========================= */

export function useCreatePost(groupId?: string) {
  const queryClient = useQueryClient();
  const key = [api.posts.list.path, groupId ?? "all"];

  return useMutation({
    mutationFn: async (data: z.infer<typeof api.posts.create.input>) => {
      const res = await fetch(api.posts.create.path, {
        method: api.posts.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to create post");

      return api.posts.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key });
    },
  });
}

/* =========================
   LIKE POST (OPTIMISTIC)
========================= */

export function useLikePost(groupId?: string) {
  const queryClient = useQueryClient();
  const key = [api.posts.list.path, groupId ?? "all"];

  return useMutation({
    mutationFn: async (postId: number) => {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to like post");
    },

    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: key });

      const previous = queryClient.getQueryData<PostWithDetails[]>(key);

      queryClient.setQueryData<PostWithDetails[]>(key, (old) =>
        old?.map((p) =>
          p.id === postId
            ? {
                ...p,
                likesCount: p.likesCount + 1,
                likes: [...p.likes, { userId: -1 }],
              }
            : p,
        ),
      );

      return { previous };
    },

    onError: (_err, _postId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(key, context.previous);
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key });
    },
  });
}

/* =========================
   UNLIKE POST (OPTIMISTIC)
========================= */

export function useUnlikePost(groupId?: string) {
  const queryClient = useQueryClient();
  const key = [api.posts.list.path, groupId ?? "all"];

  return useMutation({
    mutationFn: async (postId: number) => {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to unlike post");
    },

    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: key });

      const previous = queryClient.getQueryData<PostWithDetails[]>(key);

      queryClient.setQueryData<PostWithDetails[]>(key, (old) =>
        old?.map((p) =>
          p.id === postId
            ? {
                ...p,
                likesCount: Math.max(0, p.likesCount - 1),
                likes: p.likes.slice(0, -1),
              }
            : p,
        ),
      );

      return { previous };
    },

    onError: (_err, _postId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(key, context.previous);
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key });
    },
  });
}
