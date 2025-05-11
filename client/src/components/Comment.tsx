
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { CommentType } from '@/types/comment';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface CommentProps {
  comment: CommentType;
  postId: string;
  onCommentUpdated: () => void;
}

const Comment = ({ comment, postId, onCommentUpdated }: CommentProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { user } = useAuthContext();
  const { toast } = useToast();
  
  const formattedDate = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true });
  
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editedContent.trim()) {
      toast({
        title: "Comment cannot be empty",
        description: "Please enter some text for your comment.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Make API request to update comment
      const response = await fetch(`${import.meta.env.VITE_API_URL || "https://vibrant-vista-sa5w.onrender.com"}/api/posts/${postId}/comments/${comment._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content: editedContent }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update comment');
      }
      
      setIsEditing(false);
      onCommentUpdated();
      
      toast({
        title: "Comment Updated",
        description: "Your comment has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to update comment",
        description: "There was an error updating your comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async () => {
    try {
      // Make API request to delete comment
      const response = await fetch(`${import.meta.env.VITE_API_URL || "https://vibrant-vista-sa5w.onrender.com"}/api/posts/${postId}/comments/${comment._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }
      
      onCommentUpdated();
      
      toast({
        title: "Comment Deleted",
        description: "Your comment has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to delete comment",
        description: "There was an error deleting your comment. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const isAuthor = user && user._id === comment.author._id;
  
  return (
    <div className="border-b border-border py-6 last:border-b-0">
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-primary/30 flex items-center justify-center text-primary">
          {comment.author.name.charAt(0).toUpperCase()}
        </div>
        <div className="ml-3">
          <Link to={`/profile/${comment.author._id}`} className="font-medium hover:text-primary transition-colors">
            {comment.author.name}
          </Link>
          <p className="text-muted-foreground text-sm">{formattedDate}</p>
        </div>
      </div>
      
      {isEditing ? (
        <form onSubmit={handleEdit} className="mt-4">
          <Textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            rows={3}
            className="mb-3"
          />
          <div className="flex space-x-2">
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setIsEditing(false);
                setEditedContent(comment.content);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <>
          <div className="mt-4">
            <p className="text-foreground">{comment.content}</p>
          </div>
          
          {isAuthor && (
            <div className="mt-3 flex space-x-2">
              <button 
                onClick={() => setIsEditing(true)} 
                className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Edit
              </button>
              <button 
                onClick={() => setIsDeleteDialogOpen(true)} 
                className="text-xs font-medium text-destructive hover:text-destructive/80 transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Comment;
