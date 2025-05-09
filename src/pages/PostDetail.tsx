
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CommentForm from '@/components/CommentForm';
import Comment from '@/components/Comment';
import NewsletterForm from '@/components/NewsletterForm';
import { Post } from '@/types/post';
import { CommentType } from '@/types/comment';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Edit, Share, ThumbsUp, Eye, MessageSquare, Bookmark, BookmarkCheck } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const { user } = useAuthContext();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Fetch post data using React Query
  const { 
    data: post, 
    isLoading: isLoadingPost,
    isError: isErrorPost
  } = useQuery({
    queryKey: ['post', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${id}`, {
        headers: {
          'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch post');
      }
      
      return response.json();
    },
    enabled: !!id
  });

  // Fetch related posts based on category
  useEffect(() => {
    if (post?.category) {
      const fetchRelatedPosts = async () => {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/categories/${post.category}/posts`
          );
          if (!response.ok) throw new Error('Failed to fetch related posts');
          
          const data = await response.json();
          // Filter out current post and limit to 2 posts
          setRelatedPosts(
            data.filter((p: Post) => p._id !== post._id).slice(0, 2)
          );
        } catch (error) {
          console.error('Error fetching related posts:', error);
        }
      };
      
      fetchRelatedPosts();
    }
  }, [post]);

  // Initialize random likes count
  useEffect(() => {
    if (post) {
      // Generate random number of likes between 5 and 50
      setLikes(Math.floor(Math.random() * 45) + 5);
      
      // Check local storage to see if user has bookmarked this post
      const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
      setIsBookmarked(bookmarks.includes(post._id));
      
      // Check if user has liked this post
      const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
      setHasLiked(likedPosts.includes(post._id));
    }
  }, [post]);
  
  const handleLikePost = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to like posts",
        variant: "destructive",
      });
      return;
    }
    
    // Toggle like status
    setHasLiked(prev => !prev);
    setLikes(prev => hasLiked ? prev - 1 : prev + 1);
    
    // Store liked status in localStorage
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
    let updatedLikedPosts;
    
    if (hasLiked) {
      updatedLikedPosts = likedPosts.filter((postId: string) => postId !== post?._id);
    } else {
      updatedLikedPosts = [...likedPosts, post?._id];
    }
    
    localStorage.setItem('likedPosts', JSON.stringify(updatedLikedPosts));
    
    toast({
      title: hasLiked ? "Removed Like" : "Post Liked",
      description: hasLiked 
        ? "You have removed your like from this post." 
        : "You have liked this post!",
    });
  };
  
  const toggleBookmark = () => {
    if (!post) return;
    
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    let updatedBookmarks;
    
    if (isBookmarked) {
      updatedBookmarks = bookmarks.filter((postId: string) => postId !== post._id);
      toast({
        title: "Bookmark Removed",
        description: "Post removed from your bookmarks.",
      });
    } else {
      updatedBookmarks = [...bookmarks, post._id];
      toast({
        title: "Bookmarked!",
        description: "Post saved to your bookmarks.",
      });
    }
    
    localStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));
    setIsBookmarked(!isBookmarked);
  };
  
  const refreshComments = async () => {
    // Invalidate the post query to refresh comments
    await queryClient.invalidateQueries({ queryKey: ['post', id] });
    
    toast({
      title: "Comment Added",
      description: "Your comment has been added to the discussion.",
    });
  };
  
  const handleShareClick = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        text: post?.excerpt,
        url: window.location.href,
      })
      .then(() => {
        toast({
          title: "Shared Successfully",
          description: "The post has been shared.",
        });
      })
      .catch((error) => {
        console.error('Error sharing:', error);
      });
    } else {
      // Fallback
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "The post URL has been copied to clipboard.",
      });
    }
  };
  
  if (isLoadingPost) {
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
  
  if (isErrorPost || !post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold">Post not found</h1>
          <p className="mt-4 text-muted-foreground">
            The post you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/" className="mt-6 inline-block">
            <Button variant="default">Return to Homepage</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }
  
  const formattedDate = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });
  
  // Convert markdown-like content to JSX
  const renderContent = () => {
    const paragraphs = post.content.split('\n\n').map((paragraph, index) => {
      if (paragraph.startsWith('## ')) {
        return <h2 key={index} className="text-2xl font-bold font-serif mt-8 mb-4">{paragraph.substring(3)}</h2>;
      }
      
      if (paragraph.startsWith('- ')) {
        const items = paragraph.split('\n').map((item, itemIndex) => (
          <li key={itemIndex} className="ml-6 mb-2">{item.substring(2)}</li>
        ));
        return <ul key={index} className="list-disc my-4">{items}</ul>;
      }
      
      return <p key={index} className="mb-4">{paragraph}</p>;
    });
    
    return <div className="prose prose-lg max-w-none">{paragraphs}</div>;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white to-slate-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section with Post Title and Cover Image */}
        <section className="relative h-[60vh] min-h-[400px]">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${post.coverImage})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/50"></div>
          </div>
          
          <div className="relative container mx-auto px-4 h-full flex flex-col justify-end pb-12">
            <Link to={`/categories/${post.category}`} className="inline-block px-3 py-1 mb-4 text-xs font-medium bg-secondary text-secondary-foreground rounded-full backdrop-blur-sm">
              {post.category}
            </Link>
            <h1 className="text-3xl md:text-5xl font-bold text-white font-serif max-w-4xl animate-fade-in">
              {post.title}
            </h1>
            
            <div className="flex items-center mt-6">
              <div className="w-12 h-12 rounded-full bg-primary/30 flex items-center justify-center text-white text-lg">
                {post.author.name.charAt(0).toUpperCase()}
              </div>
              <div className="ml-4">
                <Link to={`/profile/${post.author._id}`} className="text-white font-medium hover:text-secondary transition-colors">
                  {post.author.name}
                </Link>
                <div className="flex items-center text-white/70 text-sm">
                  <span>{formattedDate}</span>
                  <span className="mx-2">•</span>
                  <span>{Math.ceil(post.content.length / 1000)} min read</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Reading Progress Bar */}
        <div className="sticky top-0 z-10 w-full h-1 bg-gray-200">
          <div 
            id="reading-progress-bar"
            className="h-full bg-primary transition-all duration-100"
            style={{ width: '0%' }}
          ></div>
        </div>
        
        {/* Post Content Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
              {/* Main Content */}
              <div className="lg:col-span-2">
                {/* Action buttons */}
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
                    
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Eye size={16} />
                      <span>{Math.floor(Math.random() * 100) + 50} views</span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MessageSquare size={16} />
                      <span>{post.comments?.length || 0} comments</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {user && user._id === post.author._id && (
                      <Link to={`/edit-post/${post._id}`}>
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <Edit size={16} />
                          <span>Edit</span>
                        </Button>
                      </Link>
                    )}
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={toggleBookmark} 
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
                
                {/* Post content */}
                <article className="prose prose-lg max-w-none">
                  {/* Featured image in content */}
                  <div className="relative rounded-lg overflow-hidden mb-8 aspect-video">
                    <img 
                      src={post.coverImage} 
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {renderContent()}
                </article>
                
                {/* Interactive elements */}
                <div className="border-t border-b border-border py-6 my-8">
                  <div className="flex flex-wrap justify-center items-center gap-4">
                    <Button 
                      variant={hasLiked ? "default" : "outline"} 
                      onClick={handleLikePost}
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
                      onClick={toggleBookmark}
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
                    
                    <Button variant="outline" onClick={handleShareClick} className="flex items-center gap-2">
                      <Share size={18} />
                      <span>Share with friends</span>
                    </Button>
                  </div>
                </div>
                
                {/* Author Bio Card */}
                <div className="bg-secondary/10 rounded-lg p-6 my-8">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
                    <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
                      {post.author.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-xl font-semibold">About {post.author.name}</h3>
                      <p className="mt-2 text-muted-foreground">
                        {post.author.bio || `${post.author.name} is a content creator who shares insights on ${post.category}.`}
                      </p>
                      <div className="mt-4">
                        <Link to={`/profile/${post.author._id}`}>
                          <Button variant="outline" size="sm">View Profile</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
                
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
              <div className="space-y-8">
                {/* Author Info */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-border shadow-sm">
                  <h3 className="text-lg font-bold font-serif mb-4">About the Author</h3>
                  <div className="flex items-center">
                    <div className="w-14 h-14 rounded-full bg-primary/30 flex items-center justify-center text-primary text-xl">
                      {post.author.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-4">
                      <Link to={`/profile/${post.author._id}`} className="font-medium hover:text-primary transition-colors">
                        {post.author.name}
                      </Link>
                    </div>
                  </div>
                  {post.author.bio && (
                    <p className="mt-4 text-muted-foreground">{post.author.bio}</p>
                  )}
                  <Link to={`/profile/${post.author._id}`} className="mt-4 inline-block text-primary font-medium hover:text-primary/80">
                    View all posts
                  </Link>
                </div>
                
                {/* Table of Contents */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-border shadow-sm">
                  <h3 className="text-lg font-bold font-serif mb-4">Table of Contents</h3>
                  <nav className="toc-nav">
                    <ul className="space-y-2 text-sm">
                      {post.content.split('\n\n')
                        .filter(para => para.startsWith('## '))
                        .map((heading, i) => (
                          <li key={i}>
                            <a 
                              href={`#heading-${i}`}
                              className="text-muted-foreground hover:text-primary transition-colors flex items-center"
                            >
                              <span className="w-5 inline-block">{i+1}.</span>
                              <span>{heading.substring(3)}</span>
                            </a>
                          </li>
                        ))}
                    </ul>
                  </nav>
                </div>
                
                {/* Related Posts */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-border shadow-sm">
                  <h3 className="text-lg font-bold font-serif mb-4">Related Posts</h3>
                  <div className="space-y-4">
                    {relatedPosts.length > 0 ? (
                      relatedPosts.map((relatedPost) => (
                        <div key={relatedPost._id} className="group bg-secondary/5 rounded-lg overflow-hidden border border-border hover:border-primary/30 transition-all duration-300">
                          <Link to={`/posts/${relatedPost._id}`}>
                            <div className="h-40 overflow-hidden">
                              <img 
                                src={relatedPost.coverImage} 
                                alt={relatedPost.title}
                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          </Link>
                          <div className="p-4">
                            <Link to={`/posts/${relatedPost._id}`}>
                              <h4 className="font-bold hover:text-primary transition-colors line-clamp-2 group-hover:text-primary">
                                {relatedPost.title}
                              </h4>
                            </Link>
                            <div className="flex items-center mt-2">
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(relatedPost.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm">No related posts found</p>
                    )}
                  </div>
                </div>
                
                {/* Newsletter */}
                <NewsletterForm />
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

// Add scroll tracking for reading progress when component mounts
useEffect(() => {
  const updateReadingProgress = () => {
    const progressBar = document.getElementById('reading-progress-bar');
    if (!progressBar) return;
    
    const totalHeight = document.body.scrollHeight - window.innerHeight;
    const progress = (window.scrollY / totalHeight) * 100;
    progressBar.style.width = `${progress}%`;
  };
  
  window.addEventListener('scroll', updateReadingProgress);
  return () => window.removeEventListener('scroll', updateReadingProgress);
}, []);

export default PostDetail;
