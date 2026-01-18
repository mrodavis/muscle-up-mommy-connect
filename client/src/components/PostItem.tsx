import { Heart, MessageCircle, Share2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { useComments, useCreateComment } from "@/hooks/use-comments";
import { useAuth } from "@/hooks/use-auth";

type PostItemProps = {
  post: any;
  onLike: () => void;
  hasLiked: boolean;
};

export function PostItem({ post, onLike, hasLiked }: PostItemProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const { data: comments } = useComments(post.id);
  const createComment = useCreateComment(post.id);

  return (
    <article className="bg-card rounded-xl p-5 border border-white/5">
      {/* HEADER */}
      <div className="flex gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
          {post.author.displayName[0]}
        </div>
        <div>
          <h3 className="font-semibold text-sm">
            {post.author.displayName}
          </h3>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <p className="mb-4">{post.content}</p>

      {post.mediaUrl && (
        <img src={post.mediaUrl} className="rounded-lg mb-4" />
      )}

      {/* ACTIONS */}
      <div className="flex justify-between pt-4 border-t">
        <button
          onClick={onLike}
          className={`flex gap-2 ${
            hasLiked ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Heart className={`w-5 h-5 ${hasLiked ? "fill-primary" : ""}`} />
          {post.likesCount}
        </button>

        <button
          onClick={() => setOpen(!open)}
          className="flex gap-2 text-muted-foreground"
        >
          <MessageCircle className="w-5 h-5" />
          {post.comments?.length || 0}
        </button>

        <Share2 className="w-5 h-5 text-muted-foreground" />
      </div>

      {/* COMMENTS */}
      {open && (
        <div className="mt-4 space-y-3">
          {comments?.map((c: any) => (
            <div key={c.id} className="text-sm">
              <span className="font-semibold mr-2">
                {c.author.displayName}
              </span>
              {c.content}
            </div>
          ))}

          {user && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const input = (e.currentTarget.elements.namedItem(
                  "comment"
                ) as HTMLInputElement);

                if (!input.value) return;
                createComment.mutate({ content: input.value });
                input.value = "";
              }}
              className="flex gap-2"
            >
              <Input name="comment" placeholder="Write a comment…" />
              <Button size="sm">Send</Button>
            </form>
          )}
        </div>
      )}
    </article>
  );
}
