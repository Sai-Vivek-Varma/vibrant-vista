
import { Button } from '@/components/ui/button';
import { ThumbsUp, Bookmark, BookmarkCheck, Share } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface InteractiveFooterProps {
  hasLiked: boolean;
  likes: number;
  isBookmarked: boolean;
  onLikeClick: () => void;
  onBookmarkClick: () => void;
  onShareClick: () => void;
}

const InteractiveFooter = ({
  hasLiked,
  likes,
  isBookmarked,
  onLikeClick,
  onBookmarkClick,
  onShareClick
}: InteractiveFooterProps) => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  
  const handleLikeClick = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to like posts",
        variant: "destructive",
      });
      return;
    }
    
    onLikeClick();
  };
  
  const handleBookmarkClick = () => {
    onBookmarkClick();
  };
  
  return (
    <div className="border-t border-b border-border py-6 my-8">
      <div className="flex flex-wrap justify-center items-center gap-4">
        <Button 
          variant={hasLiked ? "default" : "outline"} 
          onClick={handleLikeClick}
          className="flex items-center gap-2"
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
        
        <Button variant="outline" onClick={onShareClick} className="flex items-center gap-2">
          <Share size={18} />
          <span>Share with friends</span>
        </Button>
      </div>
    </div>
  );
};

export default InteractiveFooter;
