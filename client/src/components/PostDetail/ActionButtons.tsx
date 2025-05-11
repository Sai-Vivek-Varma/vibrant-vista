
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThumbsUp, Share, Edit, Bookmark, BookmarkCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { toggleBookmarkPost, toggleLikePost, sharePost } from '@/utils/postUtils';
import { useAuthContext } from '@/contexts/AuthContext';

interface ActionButtonsProps {
  postId: string;
  authorId: string;
  title: string;
  excerpt: string;
  isBookmarked: boolean;
  hasLiked: boolean;
  likes: number;
  onBookmarkToggle: (newState: boolean) => void;
  onLikeToggle: (newState: boolean, newLikes: number) => void;
}

const ActionButtons = ({
  postId,
  authorId,
  title,
  excerpt,
  isBookmarked,
  hasLiked,
  likes,
  onBookmarkToggle,
  onLikeToggle,
}: ActionButtonsProps) => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  
  const handleLikePost = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to like posts",
        variant: "destructive",
      });
      return;
    }
    
    const newHasLiked = toggleLikePost(postId);
    const newLikes = hasLiked ? likes - 1 : likes + 1;
    onLikeToggle(newHasLiked, newLikes);
    
    toast({
      title: newHasLiked ? "Post Liked" : "Removed Like",
      description: newHasLiked 
        ? "You have liked this post!" 
        : "You have removed your like from this post.",
    });
  };
  
  const handleToggleBookmark = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to bookmark posts",
        variant: "destructive",
      });
      return;
    }
    
    const newIsBookmarked = toggleBookmarkPost(postId);
    onBookmarkToggle(newIsBookmarked);
    
    toast({
      title: newIsBookmarked ? "Bookmarked!" : "Bookmark Removed",
      description: newIsBookmarked 
        ? "Post saved to your bookmarks."
        : "Post removed from your bookmarks.",
    });
  };
  
  const handleShareClick = async () => {
    const success = await sharePost(title, excerpt, window.location.href);
    
    toast({
      title: success ? "Shared Successfully" : "Link Copied",
      description: success 
        ? "The post has been shared."
        : "The post URL has been copied to clipboard.",
    });
  };
  
  return (
    <div className="flex justify-between mb-6">
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className={`flex items-center gap-1 ${hasLiked ? 'text-red-500' : ''}`}
          onClick={handleLikePost}
        >
          <ThumbsUp size={16} className={hasLiked ? 'fill-red-500' : ''} />
          <span>{likes}</span>
        </Button>
      </div>
      
      <div className="flex space-x-2">
        {user && user._id === authorId && (
          <Link to={`/edit-post/${postId}`}>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Edit size={16} />
              <span>Edit</span>
            </Button>
          </Link>
        )}
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleToggleBookmark} 
          className="flex items-center gap-1"
        >
          {isBookmarked ? (
            <>
              <BookmarkCheck size={16} className="text-primary" />
              <span>Saved</span>
            </>
          ) : (
            <>
              <Bookmark size={16} />
              <span>Save</span>
            </>
          )}
        </Button>
        
        <Button variant="outline" size="sm" onClick={handleShareClick} className="flex items-center gap-1">
          <Share size={16} />
          <span>Share</span>
        </Button>
      </div>
    </div>
  );
};

export default ActionButtons;
