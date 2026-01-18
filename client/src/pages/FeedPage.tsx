import { MobileLayout } from "@/components/MobileLayout";
import { usePosts, useCreatePost } from "@/hooks/use-posts";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/Button";
import { Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/Input";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";
import { PostItem } from "@/components/PostItem";

/* =========================
   FRONTEND POST SCHEMA
========================= */

const createPostSchema = z.object({
  content: z.string().min(1, "Post cannot be empty"),
  mediaUrl: z.string().optional(),
});

/* =========================
   TYPES
========================= */

type FeedPost = {
  id: number;
  content: string;
  mediaUrl?: string;
  createdAt: string;
  likesCount: number;
  likes: { userId: number }[];
  comments?: { id: number }[];
  author: {
    id: number;
    username: string;
    displayName: string;
    photoUrl?: string;
  };
};

/* =========================
   API HELPERS
========================= */

async function likePost(postId: number) {
  await fetch(`/api/posts/${postId}/like`, { method: "POST" });
}

async function unlikePost(postId: number) {
  await fetch(`/api/posts/${postId}/like`, { method: "DELETE" });
}

/* =========================
   COMPONENT
========================= */

export default function FeedPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = [api.posts.list.path, "all"];

  const { data: posts, isLoading } = usePosts();
  const createPost = useCreatePost();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  /* ---------- CREATE POST ---------- */

  const form = useForm({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      content: "",
      mediaUrl: "",
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    createPost.mutate(data, {
      onSuccess: () => {
        setIsDialogOpen(false);
        form.reset();
      },
    });
  });

  /* ---------- LIKE TOGGLE ---------- */

  const handleLikeToggle = async (post: FeedPost) => {
    if (!user) return;

    const hasLiked = post.likes.some((l) => l.userId === user.id);

    // optimistic update
    queryClient.setQueryData<FeedPost[]>(queryKey, (old) =>
      old?.map((p) =>
        p.id === post.id
          ? {
              ...p,
              likes: hasLiked
                ? p.likes.filter((l) => l.userId !== user.id)
                : [...p.likes, { userId: user.id }],
              likesCount: hasLiked
                ? p.likesCount - 1
                : p.likesCount + 1,
            }
          : p,
      ),
    );

    try {
      hasLiked ? await unlikePost(post.id) : await likePost(post.id);
    } catch {
      queryClient.invalidateQueries({ queryKey });
    }
  };

  return (
    <MobileLayout>
      <div className="p-4 space-y-6">
        {/* ================= HEADER ================= */}
        <header className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Community Feed</h1>
            <p className="text-muted-foreground text-sm">
              Welcome back, {user?.displayName}
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-full w-10 h-10 p-0">
                +
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Post</DialogTitle>
              </DialogHeader>

              <form onSubmit={onSubmit} className="space-y-4 mt-4">
                <Textarea
                  placeholder="Share your journey..."
                  {...form.register("content")}
                />
                <Input
                  placeholder="Image URL (optional)"
                  {...form.register("mediaUrl")}
                />
                <Button className="w-full" isLoading={createPost.isPending}>
                  Post <Send className="w-4 h-4 ml-2" />
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        {/* ================= FEED ================= */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-48 bg-card animate-pulse rounded-xl"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {posts?.map((post) => {
              const hasLiked = post.likes.some(
                (l) => l.userId === user?.id,
              );

              return (
                <PostItem
                  key={post.id}
                  post={post}
                  hasLiked={hasLiked}
                  onLike={() => handleLikeToggle(post)}
                />
              );
            })}

            {posts?.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No posts yet. Be the first to share!
              </div>
            )}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
