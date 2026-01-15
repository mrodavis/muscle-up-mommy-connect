import { MobileLayout } from "@/components/MobileLayout";
import { usePosts, useCreatePost } from "@/hooks/use-posts";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/Button";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, Share2, Image as ImageIcon, Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPostSchema } from "@shared/schema";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/Input";
import { Textarea } from "@/components/ui/textarea";

export default function FeedPage() {
  const { user } = useAuth();
  const { data: posts, isLoading } = usePosts();
  const createPost = useCreatePost();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(insertPostSchema),
    defaultValues: {
      content: "",
      userId: user?.id || 0,
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

  return (
    <MobileLayout>
      <div className="p-4 space-y-6">
        <header className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Community Feed</h1>
            <p className="text-muted-foreground text-sm">Welcome back, {user?.displayName}</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-full w-10 h-10 p-0 shadow-lg shadow-primary/20">
                <span className="text-xl leading-none mb-0.5">+</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-white/10 text-white max-w-sm mx-auto">
              <DialogHeader>
                <DialogTitle>Create Post</DialogTitle>
              </DialogHeader>
              <form onSubmit={onSubmit} className="space-y-4 mt-4">
                <Textarea 
                  placeholder="Share your journey..." 
                  className="bg-background border-white/10 resize-none h-32"
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

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-card animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {posts?.map((post) => (
              <article key={post.id} className="bg-card rounded-2xl p-5 border border-white/5 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden border border-white/10">
                    {post.author.photoUrl ? (
                      <img src={post.author.photoUrl} alt={post.author.username} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground font-bold">
                        {post.author.displayName[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{post.author.displayName}</h3>
                    <p className="text-xs text-muted-foreground">
                      {post.createdAt && formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>

                <p className="text-sm leading-relaxed text-white/90 mb-4 whitespace-pre-wrap">
                  {post.content}
                </p>

                {post.mediaUrl && (
                  <div className="rounded-xl overflow-hidden mb-4 border border-white/5 bg-background/50">
                    {/* Unsplash fallback for demo if needed */}
                    {/* Descriptive comment: User provided content, dynamic */}
                    <img src={post.mediaUrl} alt="Post content" className="w-full h-auto max-h-80 object-cover" />
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm">
                    <Heart className="w-5 h-5" /> <span>{post.likesCount}</span>
                  </button>
                  <button className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors text-sm">
                    <MessageCircle className="w-5 h-5" /> <span>{post.comments?.length || 0}</span>
                  </button>
                  <button className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors text-sm">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </article>
            ))}
            
            {posts?.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p>No posts yet. Be the first to share!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
