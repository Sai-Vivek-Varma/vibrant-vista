
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
import { Edit, Share } from 'lucide-react';

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthContext();
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        
        // Simulated API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data for post detail
        const mockPost: Post = {
          _id: id,
          title: 'The Future of Web Development: Trends to Watch in 2025',
          excerpt: 'Discover the emerging technologies and practices that will shape web development in the coming years.',
          content: `
            ## Introduction
            
            The web development landscape is constantly evolving. With new technologies, frameworks, and design paradigms emerging every year, staying ahead of the curve is crucial for developers who want to remain competitive in the industry.
            
            In this comprehensive guide, we'll explore the most significant trends that are expected to shape the future of web development in 2025 and beyond. From AI-powered tools to new approaches to user experience, these trends represent the cutting edge of the field.
            
            ## 1. AI-Assisted Development
            
            Artificial intelligence is no longer just a buzzword—it's becoming an integral part of the development workflow. AI-powered tools are now capable of:
            
            - Generating code snippets based on natural language descriptions
            - Identifying and fixing bugs before they cause problems
            - Optimizing performance across different devices and browsers
            - Suggesting design improvements based on user behavior data
            
            As these tools become more sophisticated, they'll enable developers to work more efficiently and focus on solving higher-level problems.
            
            ## 2. WebAssembly Goes Mainstream
            
            WebAssembly (Wasm) has been around for a few years, but it's now reaching a level of maturity that makes it suitable for widespread adoption. By allowing code written in languages like C++, Rust, and Go to run in the browser at near-native speed, WebAssembly enables:
            
            - Complex applications that previously required native installation
            - High-performance games in the browser
            - Efficient data processing and visualization
            - Cross-platform applications with a single codebase
            
            ## 3. Progressive Web Apps (PWAs) Become the Standard
            
            The line between web and native applications continues to blur, with PWAs offering the best of both worlds. In 2025, we expect to see:
            
            - More websites adopting PWA architectures by default
            - Enhanced offline capabilities with improved caching strategies
            - Better integration with device features like cameras, GPS, and notifications
            - Improved installation flows that increase user adoption
            
            ## 4. Sustainable Web Design
            
            As awareness of climate change grows, so does the focus on creating more energy-efficient websites and applications. Sustainable web design practices include:
            
            - Optimizing assets to reduce data transfer
            - Implementing efficient caching strategies
            - Choosing green hosting providers
            - Designing interfaces that reduce unnecessary user interactions
            
            These practices not only help the environment but often lead to better performance and user experience.
            
            ## 5. Conclusion
            
            The future of web development is bright, with innovations that make the web more capable, accessible, and sustainable. By staying informed about these trends and incorporating them into your workflow, you'll be well-positioned to create cutting-edge web experiences that delight users and stand the test of time.
          `,
          coverImage: 'https://source.unsplash.com/random/1200x800/?web,code',
          category: 'Technology',
          author: {
            _id: '101',
            name: 'Alex Johnson',
            email: 'alex@example.com',
            bio: 'Full-stack developer with 10 years of experience in web technologies.'
          },
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        };
        
        // Mock comments
        const mockComments: CommentType[] = [
          {
            _id: 'c1',
            content: 'Great article! I especially appreciate the insights on WebAssembly and its potential applications.',
            author: {
              _id: '201',
              name: 'Jason Miller',
              email: 'jason@example.com'
            },
            post: id,
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: 'c2',
            content: 'I\'m curious how AI-assisted development will impact junior developers entering the field. Will it make it easier to get started or create a higher barrier to entry?',
            author: {
              _id: '202',
              name: 'Sophie Chen',
              email: 'sophie@example.com'
            },
            post: id,
            createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
          }
        ];
        
        // Mock related posts
        const mockRelatedPosts: Post[] = [
          {
            _id: 'r1',
            title: 'Mastering Modern JavaScript: Tips and Tricks',
            excerpt: 'Enhance your JavaScript skills with these advanced techniques used by professional developers.',
            content: 'Lorem ipsum dolor sit amet...',
            coverImage: 'https://source.unsplash.com/random/800x600/?javascript',
            category: 'Technology',
            author: {
              _id: '101',
              name: 'Alex Johnson',
              email: 'alex@example.com'
            },
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: 'r2',
            title: 'The Rise of No-Code Development Platforms',
            excerpt: 'Are traditional developers at risk? Explore the growing trend of no-code solutions.',
            content: 'Lorem ipsum dolor sit amet...',
            coverImage: 'https://source.unsplash.com/random/800x600/?code',
            category: 'Technology',
            author: {
              _id: '103',
              name: 'Sarah Chen',
              email: 'sarah@example.com'
            },
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];
        
        setPost(mockPost);
        setComments(mockComments);
        setRelatedPosts(mockRelatedPosts);
      } catch (error) {
        console.error('Error fetching post:', error);
        toast({
          title: "Error",
          description: "Failed to load the post. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPost();
  }, [id, toast]);
  
  const refreshComments = async () => {
    // In a real app, this would fetch the latest comments from the API
    // For demo purposes, we'll just show a success message
    toast({
      title: "Comments Updated",
      description: "Your comment has been added to the discussion.",
    });
    
    // Add a mock new comment
    const newComment: CommentType = {
      _id: `c${comments.length + 1}`,
      content: "This is a new comment that would normally come from the server.",
      author: {
        _id: user?._id || 'anonymous',
        name: user?.name || 'Anonymous User',
        email: user?.email || 'anon@example.com'
      },
      post: id || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setComments([newComment, ...comments]);
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
  
  if (!post) {
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
  
  // Convert markdown-like content to JSX (very simplified)
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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section with Post Title and Cover Image */}
        <section className="relative h-[50vh] min-h-[400px]">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${post.coverImage})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/50"></div>
          </div>
          
          <div className="relative container mx-auto px-4 h-full flex flex-col justify-end pb-12">
            <Link to={`/categories/${post.category}`} className="inline-block px-3 py-1 mb-4 text-xs font-medium bg-secondary text-secondary-foreground rounded-full">
              {post.category}
            </Link>
            <h1 className="text-3xl md:text-5xl font-bold text-white font-serif max-w-4xl">
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
        
        {/* Post Content Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
              {/* Main Content */}
              <div className="lg:col-span-2">
                {/* Action buttons */}
                <div className="flex justify-end mb-6 space-x-2">
                  {user && user._id === post.author._id && (
                    <Link to={`/edit-post/${post._id}`}>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Edit size={16} />
                        <span>Edit</span>
                      </Button>
                    </Link>
                  )}
                  <Button variant="outline" size="sm" onClick={handleShareClick} className="flex items-center gap-1">
                    <Share size={16} />
                    <span>Share</span>
                  </Button>
                </div>
                
                {/* Post content */}
                <article className="prose prose-lg max-w-none">
                  {renderContent()}
                </article>
                
                {/* Comments Section */}
                <div className="mt-12 border-t border-border pt-8">
                  <h3 className="text-xl font-bold font-serif mb-6">
                    Comments ({comments.length})
                  </h3>
                  
                  {/* Comment Form */}
                  <CommentForm postId={post._id} onCommentAdded={refreshComments} />
                  
                  {/* Comments List */}
                  <div className="mt-8">
                    {comments.length > 0 ? (
                      comments.map((comment) => (
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
                <div className="bg-white p-6 rounded-xl border border-border">
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
                
                {/* Related Posts */}
                <div>
                  <h3 className="text-lg font-bold font-serif mb-4">Related Posts</h3>
                  <div className="space-y-4">
                    {relatedPosts.map((relatedPost) => (
                      <div key={relatedPost._id} className="bg-white rounded-lg overflow-hidden border border-border">
                        <Link to={`/posts/${relatedPost._id}`}>
                          <img 
                            src={relatedPost.coverImage} 
                            alt={relatedPost.title}
                            className="w-full h-40 object-cover"
                          />
                        </Link>
                        <div className="p-4">
                          <Link to={`/posts/${relatedPost._id}`}>
                            <h4 className="font-bold hover:text-primary transition-colors line-clamp-2">
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
                    ))}
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

export default PostDetail;
