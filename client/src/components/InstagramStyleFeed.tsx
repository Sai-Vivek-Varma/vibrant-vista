
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Post } from "@/types/post";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, MessageSquare, Heart, Share, Bookmark } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { useInView } from "@/hooks/useInView";
import { useAuthContext } from "@/contexts/AuthContext";
import { analyzeContent } from "@/services/aiService";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface InstagramStyleFeedProps {
  initialPosts?: Post[];
}

const InstagramStyleFeed = ({ initialPosts = [] }: InstagramStyleFeedProps) => {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState<{[key: string]: {
    insight: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    topics: string[];
    summary: string;
  }}>({});
  const { toast } = useToast();
  const [ref, inView] = useInView({ threshold: 0.5 });
  const { user } = useAuthContext();
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch more posts when user scrolls to the bottom
  useEffect(() => {
    if (inView && !isLoading && hasMore) {
      loadMorePosts();
    }
  }, [inView, isLoading, hasMore]);

  const loadMorePosts = async () => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "https://vibrant-vista-sa5w.onrender.com"}/api/posts?page=${page}&limit=3`
      );
      
      if (!response.ok) throw new Error("Failed to fetch posts");
      
      const newPosts = await response.json();
      
      if (newPosts.length === 0) {
        setHasMore(false);
      } else {
        setPosts(prevPosts => {
          // Filter out duplicate posts
          const uniqueNewPosts = newPosts.filter(
            (newPost: Post) => !prevPosts.some(existingPost => existingPost._id === newPost._id)
          );
          return [...prevPosts, ...uniqueNewPosts];
        });
        setPage(prevPage => prevPage + 1);

        // Generate AI analysis for each new post
        newPosts.forEach((post: Post) => {
          generateAiInsight(post._id, post.content);
        });
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast({
        title: "Error",
        description: "Failed to load more posts",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate AI insights for each post
  const generateAiInsight = async (postId: string, content: string) => {
    try {
      const analysis = await analyzeContent(content);
      setAiAnalysis(prev => ({
        ...prev,
        [postId]: analysis
      }));
    } catch (error) {
      console.error("Error generating AI insight:", error);
    }
  };

  // Function to like a post (mock)
  const handleLikePost = (postId: string) => {
    toast.success("Post liked!", {
      description: "Your like has been recorded"
    });
  };

  // Function to bookmark a post (mock)
  const handleBookmarkPost = (postId: string) => {
    toast.success("Post bookmarked!", {
      description: "Added to your saved items"
    });
  };

  // Function for post item without animations
  const PostItem = ({ post }: { post: Post }) => {
    const formattedDate = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });
    
    return (
      <div className="w-full max-w-2xl mx-auto mb-8">
        <Card className="overflow-hidden border shadow-md">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {post.author.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <Link to={`/profile/${post.author._id}`} className="font-medium hover:text-primary transition-colors">
                  {post.author.name}
                </Link>
                <p className="text-xs text-muted-foreground">{formattedDate}</p>
              </div>
            </div>
          </div>
          
          {/* Post image */}
          <div className="relative aspect-square overflow-hidden bg-muted">
            <img 
              src={post.coverImage} 
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Action buttons */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="hover:text-primary"
                onClick={() => handleLikePost(post._id)}
              >
                <Heart className="h-6 w-6" />
              </Button>
              <Link to={`/posts/${post._id}`}>
                <Button variant="ghost" size="icon" className="hover:text-primary">
                  <MessageSquare className="h-6 w-6" />
                </Button>
              </Link>
              <Button variant="ghost" size="icon" className="hover:text-primary">
                <Share className="h-6 w-6" />
              </Button>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="hover:text-primary"
              onClick={() => handleBookmarkPost(post._id)}
            >
              <Bookmark className="h-6 w-6" />
            </Button>
          </div>
          
          {/* Content */}
          <CardContent className="pb-6">
            <Link to={`/posts/${post._id}`}>
              <h3 className="text-xl font-bold mb-2 font-serif hover:text-primary transition-colors">
                {post.title}
              </h3>
            </Link>
            <p className="text-muted-foreground mb-4 line-clamp-3">{post.excerpt}</p>
            
            {/* AI Analysis */}
            {aiAnalysis[post._id] && (
              <div className="mt-4 p-3 bg-secondary/10 rounded-lg border border-secondary/20">
                <p className="text-xs font-medium text-secondary-foreground mb-1">AI Analysis</p>
                <div className="space-y-2">
                  <p className="text-sm"><span className="font-medium">Insight:</span> {aiAnalysis[post._id].insight}</p>
                  <p className="text-sm"><span className="font-medium">Sentiment:</span> {' '}
                    <span className={
                      aiAnalysis[post._id].sentiment === 'positive' ? 'text-green-500' :
                      aiAnalysis[post._id].sentiment === 'negative' ? 'text-red-500' : 'text-blue-500'
                    }>
                      {aiAnalysis[post._id].sentiment}
                    </span>
                  </p>
                  <p className="text-sm"><span className="font-medium">Topics:</span> {aiAnalysis[post._id].topics.join(', ')}</p>
                </div>
              </div>
            )}
            
            <div className="mt-4">
              <Link to={`/posts/${post._id}`} className="text-primary text-sm hover:underline">
                Read more
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <ScrollArea className="instagram-style-feed w-full mx-auto py-6 h-full">
      <div className="flex flex-col items-center pb-20">
        {posts.map((post) => (
          <PostItem key={post._id} post={post} />
        ))}
      </div>
      
      <div 
        ref={ref} 
        className="w-full flex justify-center py-8 mt-4"
      >
        {isLoading && (
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        )}
        {!hasMore && posts.length > 0 && (
          <p className="text-muted-foreground text-center">No more posts to show</p>
        )}
      </div>
    </ScrollArea>
  );
};

export default InstagramStyleFeed;
