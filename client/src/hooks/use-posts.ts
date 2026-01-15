import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";
import type { Post, User, Comment } from "@shared/schema";

type PostWithDetails = Post & { author: User; comments: Comment[] };

export function usePosts(groupId?: string) {
  return useQuery({
    queryKey: [api.posts.list.path, { groupId }],
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

export function useCreatePost() {
  const queryClient = useQueryClient();
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
      queryClient.invalidateQueries({ queryKey: [api.posts.list.path] });
    },
  });
}
