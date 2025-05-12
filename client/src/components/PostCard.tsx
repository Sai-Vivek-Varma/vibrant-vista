
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Post } from "@/types/post";
import { Heart, MessageSquare, Bookmark, Share } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { toggleLikePost, toggleBookmarkPost } from "@/utils/postUtils";
import { useAuthContext } from "@/contexts/AuthContext";

interface PostCardProps {
  post: Post;
}

const PostCard = ({ post }: PostCardProps) => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [hasLiked, setHasLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes || 0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  const formattedDate = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
  });

  const handleLikePost = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to like posts",
        variant: "destructive",
      });
      return;
    }
    
    const newHasLiked = toggleLikePost(post._id);
    setHasLiked(newHasLiked);
    setLikesCount(prev => newHasLiked ? prev + 1 : prev - 1);
    
    toast({
      title: newHasLiked ? "Post Liked" : "Removed Like",
      description: newHasLiked 
        ? "You have liked this post!" 
        : "You have removed your like from this post.",
    });
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
    
    const newIsBookmarked = toggleBookmarkPost(post._id);
    setIsBookmarked(newIsBookmarked);
    
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

  return (
    <div className='post-card flex flex-col h-full shadow-md rounded-xl overflow-hidden border border-border'>
      <div className='p-4 border-b flex items-center justify-between'>
        <div className='flex items-center space-x-3'>
          <div className='w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold'>
            {post.author?.name?.charAt(0).toUpperCase() || "A"}
          </div>
          <div>
            <Link
              to={`/profile/${post.author?._id}`}
              className='font-medium hover:text-primary transition-colors'
            >
              {post.author?.name || "Anonymous"}
            </Link>
            <p className='text-xs text-muted-foreground'>{formattedDate}</p>
          </div>
        </div>
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
              
              <Link to={`/posts/${post._id}`} className='flex items-center space-x-1'>
                <MessageSquare size={18} />
                <span className='text-sm'>{post.comments?.length || 0}</span>
              </Link>
              
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
        </div>
      </div>
    </div>
  );
};

export default PostCard;
