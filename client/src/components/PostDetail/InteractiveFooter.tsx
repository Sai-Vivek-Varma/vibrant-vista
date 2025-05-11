
import { Button } from '@/components/ui/button';
import { ThumbsUp, Bookmark, BookmarkCheck, Share } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { toast as sonnerToast } from 'sonner';

interface InteractiveFooterProps {
  postId: string;
  hasLiked: boolean;
  likes: number;
  isBookmarked: boolean;
  onLikeClick: () => void;
  onBookmarkClick: () => void;
  onShareClick: () => void;
}

const InteractiveFooter = ({
  postId,
  hasLiked,
  likes,
  isBookmarked,
  onLikeClick,
  onBookmarkClick,
  onShareClick
}: InteractiveFooterProps) => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [isLiking, setIsLiking] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);
  
  const handleLikeClick = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to like posts",
        variant: "destructive",
      });
      return;
    }
    
    setIsLiking(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to like post');
      }
      
      const data = await response.json();
      onLikeClick();
      
      sonnerToast.success(data.liked ? 'Post liked!' : 'Post unliked', {
        description: data.liked ? 'Thanks for your feedback!' : 'Your like has been removed',
      });
      
    } catch (error) {
      console.error('Error liking post:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLiking(false);
    }
  };
  
  const handleBookmarkClick = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to bookmark posts",
        variant: "destructive",
      });
      return;
    }
    
    setIsBookmarking(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${postId}/bookmark`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to bookmark post');
      }
      
      const data = await response.json();
      onBookmarkClick();
      
      sonnerToast.success(data.bookmarked ? 'Post bookmarked!' : 'Bookmark removed', {
        description: data.bookmarked ? 'Added to your saved items' : 'Removed from your saved items',
      });
      
    } catch (error) {
      console.error('Error bookmarking post:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBookmarking(false);
    }
  };
  
  const handleShareClick = () => {
    // Copy the post URL to clipboard
    const postUrl = `${window.location.origin}/posts/${postId}`;
    navigator.clipboard.writeText(postUrl);
    
    sonnerToast.success('Link copied!', {
      description: 'Post link copied to clipboard',
    });
    
    onShareClick();
  };
  
  return (
    <div className="border-t border-b border-border py-6 my-8">
      <div className="flex flex-wrap justify-center items-center gap-4">
        <Button 
          variant={hasLiked ? "default" : "outline"} 
          onClick={handleLikeClick}
          className="flex items-center gap-2"
          disabled={isLiking}
        >
          <ThumbsUp size={18} className={hasLiked ? 'fill-white' : ''} />
          <span>{hasLiked ? 'You liked this post' : 'Like this post'}</span>
          <span className="bg-secondary/20 px-2 py-0.5 rounded-full text-sm">
            {likes}
          </span>
        </Button>
        
        <Button 
          variant={isBookmarked ? "default" : "outline"} 
          onClick={handleBookmarkClick}
          className="flex items-center gap-2"
          disabled={isBookmarking}
        >
          {isBookmarked ? (
            <>
              <BookmarkCheck size={18} />
              <span>Saved</span>
            </>
          ) : (
            <>
              <Bookmark size={18} />
              <span>Save for later</span>
            </>
          )}
        </Button>
        
        <Button variant="outline" onClick={handleShareClick} className="flex items-center gap-2">
          <Share size={18} />
          <span>Share with friends</span>
        </Button>
      </div>
    </div>
  );
};

export default InteractiveFooter;
