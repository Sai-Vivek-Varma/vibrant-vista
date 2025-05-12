
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CommentForm from '@/components/CommentForm';
import Comment from '@/components/Comment';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Eye, MessageSquare, Heart, Bookmark, Share } from 'lucide-react';
import { sharePost } from '@/utils/postUtils';
import { usePostDetail } from '@/hooks/usePostDetail';

import { PostHero } from '@/components/PostDetail/PostHero';
import { PostContent } from '@/components/PostDetail/PostContent';
import { ReadingProgressBar } from '@/components/PostDetail/ReadingProgressBar';
import { AuthorBio } from '@/components/PostDetail/AuthorBio';
import { Sidebar } from '@/components/PostDetail/Sidebar';

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthContext();
  const { toast } = useToast();
  
  const { 
    post, 
    isLoading, 
    isError,
    isBookmarked,
    setIsBookmarked,
    likes,
    setLikes,
    hasLiked,
    setHasLiked,
    relatedPosts,
    refreshComments
  } = usePostDetail(id);
  
  const handleLikeToggle = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to like posts",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${id}/likes`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to toggle like');
      
      const data = await response.json();
      setHasLiked(data.liked);
      setLikes(data.likesCount);
      
      toast({
        title: data.liked ? "Post Liked" : "Like Removed",
        description: data.liked ? "You have liked this post" : "You have removed your like",
      });
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive",
      });
    }
  };
  
  const handleBookmarkToggle = () => {
    const newIsBookmarked = !isBookmarked;
    setIsBookmarked(newIsBookmarked);
    
    // Update localStorage
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    if (newIsBookmarked) {
      bookmarks.push(post!._id);
    } else {
      const index = bookmarks.indexOf(post!._id);
      if (index !== -1) {
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
  
  const handleShareClick = async () => {
    if (!post) return;
    
    const success = await sharePost(
      post.title, 
      post.excerpt, 
      window.location.href
    );
    
    toast({
      title: success ? "Shared Successfully" : "Link Copied",
      description: success 
        ? "The post has been shared."
        : "The post URL has been copied to clipboard.",
    });
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-3/4"></div>
            <div className="h-6 bg-muted rounded w-1/2"></div>
            <div className="h-96 bg-muted rounded"></div>
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (isError || !post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold">Post not found</h1>
          <p className="mt-4 text-muted-foreground">
            The post you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/" className="mt-6 inline-block">
            <button className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80 transition">
              Return to Homepage
            </button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white to-slate-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section with Post Title and Cover Image */}
        <PostHero post={post} />
        
        {/* Reading Progress Bar */}
        <ReadingProgressBar />
        
        {/* Post Content Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
              {/* Main Content */}
              <div className="lg:col-span-2">
                {/* Instagram-style action buttons */}
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={handleLikeToggle}
                      className={`flex items-center gap-1 ${hasLiked ? 'text-red-500' : ''}`}
                    >
                      <Heart size={20} className={hasLiked ? 'fill-red-500' : ''} />
                      <span>{likes}</span>
                    </button>
                    
                    <button className="flex items-center gap-1">
                      <MessageSquare size={20} />
                      <span>{post.comments?.length || 0}</span>
                    </button>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button onClick={handleBookmarkToggle}>
                      <Bookmark 
                        size={20} 
                        className={isBookmarked ? 'fill-primary text-primary' : ''} 
                      />
                    </button>
                    <button onClick={handleShareClick}>
                      <Share size={20} />
                    </button>
                  </div>
                </div>
                
                {/* Post stats */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Eye size={16} />
                    <span>{post.views || 0} views</span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MessageSquare size={16} />
                    <span>{post.comments?.length || 0} comments</span>
                  </div>
                </div>
                
                {/* Post content */}
                <PostContent 
                  content={post.content} 
                  coverImage={post.coverImage} 
                  title={post.title}
                />
                
                {/* Author Bio Card */}
                <AuthorBio author={post.author} category={post.category} />
                
                {/* Comments Section */}
                <div className="mt-12 border-t border-border pt-8">
                  <h3 className="text-xl font-bold font-serif mb-6">
                    Comments ({post.comments?.length || 0})
                  </h3>
                  
                  {/* Comment Form */}
                  <CommentForm postId={post._id} onCommentAdded={refreshComments} />
                  
                  {/* Comments List */}
                  <div className="mt-8">
                    {post.comments && post.comments.length > 0 ? (
                      post.comments.map((comment) => (
                        <Comment 
                          key={comment._id} 
                          comment={comment} 
                          postId={post._id} 
                          onCommentUpdated={refreshComments} 
                        />
                      ))
                    ) : (
                      <div className="py-8 text-center">
                        <p className="text-muted-foreground">
                          No comments yet. Be the first to share your thoughts!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Sidebar */}
              <Sidebar post={post} relatedPosts={relatedPosts} />
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default PostDetail;
