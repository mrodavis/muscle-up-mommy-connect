import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

/* =========================
   TYPES
========================= */

export type CommentWithAuthor = {
  id: number;
  content: string;
  createdAt: string;
  author: {
    id: number;
    username: string;
    displayName: string;
    photoUrl?: string | null;
  };
};

/* =========================
   FETCH COMMENTS
========================= */

export function useComments(postId: number) {
  return useQuery<CommentWithAuthor[]>({
    enabled: postId > 0,
    queryKey: [api.comments.listByPost.path, postId],
    queryFn: async () => {
      const url = buildUrl(api.comments.listByPost.path, { id: postId });

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Failed to fetch comments");
      }

      return api.comments.listByPost.responses[200].parse(
        await res.json(),
      );
    },
  });
}

/* =========================
   CREATE COMMENT (OPTIMISTIC)
========================= */

export function useCreateComment(postId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { content: string }) => {
      const url = buildUrl(api.comments.create.path, { id: postId });

      const res = await fetch(url, {
        method: api.comments.create.method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        throw new Error("Failed to create comment");
      }

      return api.comments.create.responses[201].parse(
        await res.json(),
      );
    },

    /* ---------- OPTIMISTIC UPDATE ---------- */
    onMutate: async (newComment) => {
      const commentsKey = [api.comments.listByPost.path, postId];
      const postsKey = [api.posts.list.path, "all"];

      // Stop outgoing queries
      await queryClient.cancelQueries({ queryKey: commentsKey });
      await queryClient.cancelQueries({ queryKey: postsKey });

      const previousComments =
        queryClient.getQueryData<CommentWithAuthor[]>(commentsKey);

      const previousPosts =
        queryClient.getQueryData<any[]>(postsKey);

      const optimisticId = Date.now();

      // 1️⃣ Optimistically add comment
      queryClient.setQueryData<CommentWithAuthor[]>(commentsKey, (old = []) => [
        ...old,
        {
          id: optimisticId,
          content: newComment.content,
          createdAt: new Date().toISOString(),
          author: {
            id: -1,
            username: "you",
            displayName: "You",
            photoUrl: null,
          },
        },
      ]);

      // 2️⃣ Optimistically increment comment count on post
      queryClient.setQueryData<any[]>(postsKey, (old) =>
        old?.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: [...(post.comments ?? []), { id: optimisticId }],
              }
            : post,
        ),
      );

      return { previousComments, previousPosts };
    },

    /* ---------- ROLLBACK ---------- */
    onError: (_err, _input, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(
          [api.comments.listByPost.path, postId],
          context.previousComments,
        );
      }

      if (context?.previousPosts) {
        queryClient.setQueryData(
          [api.posts.list.path, "all"],
          context.previousPosts,
        );
      }
    },

    /* ---------- FINAL SYNC ---------- */
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [api.comments.listByPost.path, postId],
      });

      queryClient.invalidateQueries({
        queryKey: [api.posts.list.path, "all"],
      });
    },
  });
}
