
import { useState, useEffect } from "react";
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
    setIsBookmarked
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
    
    try {
      const response = await fetch(`${API_BASE}/api/posts/${post._id}/likes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to toggle like');
      
      const data = await response.json();
      setHasLiked(data.liked);
      setLikesCount(data.likesCount);
      
      toast({
        title: data.liked ? "Post Liked" : "Like Removed",
        description: data.liked 
          ? "You have liked this post!" 
          : "You have removed your like from this post.",
      });
    } catch (error) {
      console.error('Error toggling like:', error);
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
  
  const handleSharePost = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.origin + `/posts/${post._id}`,
      });
    } else {
      navigator.clipboard.writeText(window.location.origin + `/posts/${post._id}`);
      toast({
        title: "Link Copied",
        description: "Post link copied to clipboard",
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
      const response = await fetch(`${API_BASE}/api/posts/${post._id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
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
    <div className='post-card flex flex-col h-full shadow-md rounded-xl overflow-hidden border border-border bg-white dark:bg-gray-800'>
      <div className='p-4 border-b flex items-center justify-between'>
        <Link to={`/profile/${post.author?._id}`} className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={`https://source.unsplash.com/random/100x100/?portrait&${post.author?._id}`} />
            <AvatarFallback>
              {post.author?.name?.charAt(0).toUpperCase() || "A"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className='font-medium hover:text-primary transition-colors'>
              {post.author?.name || "Anonymous"}
            </p>
            <p className='text-xs text-muted-foreground'>{formattedDate}</p>
          </div>
        </Link>
      </div>
      
      <div className='relative overflow-hidden'>
        <Link to={`/posts/${post._id}`} className="block">
          <img
            src={post.coverImage}
            alt={post.title}
            className='w-full h-48 sm:h-64 object-cover transition-transform duration-300 hover:scale-105'
          />
        </Link>
        <Link
          to={`/categories/${post.category}`}
          className='absolute top-4 left-4 px-3 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded-full'
        >
          {post.category}
        </Link>
      </div>

      <div className='p-5 flex flex-col flex-grow'>
        <Link to={`/posts/${post._id}`}>
          <h3 className='text-xl font-bold mb-2 font-serif hover:text-primary transition-colors line-clamp-2'>
            {post.title}
          </h3>
        </Link>
        <p className='text-muted-foreground mb-4 line-clamp-2 text-sm'>
          {post.excerpt}
        </p>
        
        <div className='mt-auto'>
          {/* Instagram-style action buttons */}
          <div className='flex items-center justify-between mb-2'>
            <div className='flex items-center space-x-4'>
              <button 
                onClick={handleLikePost}
                className={`flex items-center space-x-1 ${hasLiked ? 'text-red-500' : ''}`}
              >
                <Heart size={18} className={hasLiked ? 'fill-red-500' : ''} />
                <span className='text-sm'>{likesCount}</span>
              </button>
              
              <button 
                onClick={() => setShowComments(!showComments)} 
                className='flex items-center space-x-1'
              >
                <MessageSquare size={18} />
                <span className='text-sm'>{comments?.length || 0}</span>
              </button>
              
              <button onClick={handleSharePost} className='flex items-center space-x-1'>
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
          
          {/* Comments Section */}
          {showComments && (
            <div className="mt-3">
              <Separator className="my-2" />
              <div className="max-h-40 overflow-y-auto mb-2">
                {comments && comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment._id} className="py-2">
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
                              className="text-sm font-medium mr-2"
                            >
                              {comment.author.name}
                            </Link>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-sm">{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-2">
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
                  className="h-8 min-h-8 py-1 text-sm"
                  disabled={!user || isSubmitting}
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  variant="ghost" 
                  disabled={!user || isSubmitting || !newComment.trim()}
                >
                  <Send size={16} />
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostCard;
