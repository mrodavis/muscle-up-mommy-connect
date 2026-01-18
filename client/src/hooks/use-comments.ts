import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

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
    enabled: !!postId,
  });
}

/* =========================
   CREATE COMMENT
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
      const queryKey = [api.comments.listByPost.path, postId];

      await queryClient.cancelQueries({ queryKey });

      const previousComments =
        queryClient.getQueryData<CommentWithAuthor[]>(queryKey);

      queryClient.setQueryData<CommentWithAuthor[]>(queryKey, (old) => [
        ...(old ?? []),
        {
          id: Date.now(), // temporary client id
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

      return { previousComments };
    },

    /* ---------- ROLLBACK ---------- */
    onError: (_err, _input, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(
          [api.comments.listByPost.path, postId],
          context.previousComments,
        );
      }
    },

    /* ---------- SYNC ---------- */
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [api.comments.listByPost.path, postId],
      });
    },
  });
}
