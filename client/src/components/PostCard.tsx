
import { useState } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Post } from "@/types/post";
import { Heart, MessageSquare, Bookmark, Share, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { usePostDetails } from "@/hooks/usePostDetails";
import { sharePost } from "@/utils/postUtils";

interface PostCardProps {
  post: Post;
}

const PostCard = ({ post }: PostCardProps) => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { 
    hasLiked,
    setHasLiked,
    likesCount, 
    setLikesCount,
    comments,
    refreshComments,
    isBookmarked,
    setIsBookmarked,
    toggleLike
  } = usePostDetails(post._id);

  const API_BASE = import.meta.env.VITE_API_URL || "https://vibrant-vista-sa5w.onrender.com";
  
  const formattedDate = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
  });

  const handleLikePost = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to like posts",
        variant: "destructive",
      });
      return;
    }
    
    // Optimistic UI update
    const wasLiked = hasLiked;
    setHasLiked(!wasLiked);
    setLikesCount(prevCount => wasLiked ? Math.max(0, prevCount - 1) : prevCount + 1);
    
    try {
      const success = await toggleLike();
      
      if (success) {
        toast({
          title: !wasLiked ? "Post Liked" : "Like Removed",
          description: !wasLiked 
            ? "You have liked this post!" 
            : "You have removed your like from this post.",
        });
      }
    } catch (error) {
      // Revert on error
      console.error('Error toggling like:', error);
      setHasLiked(wasLiked);
      setLikesCount(prevCount => wasLiked ? prevCount + 1 : Math.max(0, prevCount - 1));
      
      toast({
        title: "Error",
        description: "Failed to process your like. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleBookmarkPost = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to bookmark posts",
        variant: "destructive",
      });
      return;
    }
    
    const newIsBookmarked = !isBookmarked;
    setIsBookmarked(newIsBookmarked);
    
    // Update localStorage
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    if (newIsBookmarked) {
      if (!bookmarks.includes(post._id)) {
        bookmarks.push(post._id);
      }
    } else {
      const index = bookmarks.indexOf(post._id);
      if (index > -1) {
        bookmarks.splice(index, 1);
      }
    }
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    
    toast({
      title: newIsBookmarked ? "Bookmarked!" : "Bookmark Removed",
      description: newIsBookmarked 
        ? "Post saved to your bookmarks."
        : "Post removed from your bookmarks.",
    });
  };
  
  const handleSharePost = async () => {
    try {
      const success = await sharePost(
        post.title, 
        post.excerpt, 
        window.location.origin + `/posts/${post._id}`
      );
      
      toast({
        title: success ? "Shared Successfully" : "Link Copied",
        description: success 
          ? "The post has been shared."
          : "Post URL copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error sharing",
        description: "Could not share the post",
        variant: "destructive",
      });
    }
  };
  
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to comment",
        variant: "destructive",
      });
      return;
    }
    
    if (!newComment.trim()) {
      toast({
        title: "Comment Required",
        description: "Please enter a comment",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        });
        return;
      }
      
      const response = await fetch(`${API_BASE}/api/posts/${post._id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: newComment }),
      });
      
      if (!response.ok) throw new Error('Failed to add comment');
      
      await refreshComments();
      setNewComment('');
      
      toast({
        title: "Comment Added",
        description: "Your comment has been added successfully",
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add your comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="post-card flex flex-col h-full shadow-md rounded-lg overflow-hidden border border-border bg-white dark:bg-gray-800">
      <div className="p-3 border-b flex items-center justify-between">
        <Link to={`/profile/${post.author?._id}`} className="flex items-center space-x-2">
          <Avatar className="h-7 w-7">
            <AvatarImage src={`https://source.unsplash.com/random/100x100/?portrait&${post.author?._id}`} />
            <AvatarFallback>
              {post.author?.name?.charAt(0).toUpperCase() || "A"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm hover:text-primary transition-colors">
              {post.author?.name || "Anonymous"}
            </p>
            <p className="text-xs text-muted-foreground">{formattedDate}</p>
          </div>
        </Link>
      </div>
      
      <div className="relative aspect-video sm:aspect-auto overflow-hidden bg-muted">
        <Link to={`/posts/${post._id}`} className="block">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
          />
        </Link>
        <Link
          to={`/categories/${post.category}`}
          className="absolute top-2 right-2 px-2 py-1 text-xs font-medium bg-black/60 text-white rounded-md"
        >
          {post.category}
        </Link>
      </div>

      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleLikePost}
            className={`flex items-center space-x-1 ${hasLiked ? 'text-red-500' : ''}`}
          >
            <Heart size={18} className={hasLiked ? 'fill-red-500' : ''} />
            <span className="text-sm">{likesCount}</span>
          </button>
          
          <button 
            onClick={() => setShowComments(!showComments)} 
            className="flex items-center space-x-1"
          >
            <MessageSquare size={18} />
            <span className="text-sm">{comments?.length || 0}</span>
          </button>
          
          <button onClick={handleSharePost} className="flex items-center">
            <Share size={18} />
          </button>
        </div>
        
        <button 
          onClick={handleBookmarkPost}
          className={isBookmarked ? 'text-primary' : ''}
        >
          <Bookmark size={18} className={isBookmarked ? 'fill-primary' : ''} />
        </button>
      </div>

      <div className="p-3 pt-0 flex flex-col flex-grow">
        <Link to={`/posts/${post._id}`}>
          <h3 className="text-base font-bold mb-1 hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
          {post.excerpt}
        </p>
        
        {/* Comments Section */}
        {showComments && (
          <div className="mt-2">
            <Separator className="my-2" />
            <div className="max-h-32 overflow-y-auto mb-2">
              {comments && comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment._id} className="py-1.5">
                    <div className="flex items-start gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback>
                          {comment.author.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <Link 
                            to={`/profile/${comment.author._id}`}
                            className="text-xs font-medium mr-1"
                          >
                            {comment.author.name}
                          </Link>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-xs">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-center text-muted-foreground py-2">
                  No comments yet. Be the first to comment!
                </p>
              )}
            </div>
            
            <form onSubmit={handleSubmitComment} className="flex items-center gap-2">
              <Avatar className="w-6 h-6 flex-shrink-0">
                {user ? (
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                ) : (
                  <AvatarFallback>?</AvatarFallback>
                )}
              </Avatar>
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="h-8 min-h-8 py-1 text-xs"
                disabled={!user || isSubmitting}
              />
              <Button 
                type="submit" 
                size="icon" 
                variant="ghost" 
                disabled={!user || isSubmitting || !newComment.trim()}
              >
                <Send size={16} className="rotate-90" />
              </Button>
            </form>
          </div>
        )}
        
        <div className="mt-auto pt-2">
          <Link
            to={`/posts/${post._id}`}
            className="text-primary text-xs hover:underline"
          >
            Read more
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
