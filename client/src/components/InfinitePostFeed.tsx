
import { useState, useEffect, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import PostCard from "@/components/PostCard";
import { Loader2 } from "lucide-react";
import { Post } from "@/types/post";
import { useIsMobile } from "@/hooks/use-mobile";

interface InfinitePostFeedProps {
  initialPosts?: Post[];
  category?: string;
  featured?: boolean;
  trending?: boolean;
  tag?: string;
  author?: string;
}

const InfinitePostFeed = ({ 
  initialPosts = [],
  category,
  featured,
  trending,
  tag,
  author
}: InfinitePostFeedProps) => {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { toast } = useToast();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  const API_BASE = import.meta.env.VITE_API_URL || "https://vibrant-vista-sa5w.onrender.com";

  const buildUrl = useCallback(() => {
    let url = `${API_BASE}/api/posts`;
    
    if (featured) {
      url = `${API_BASE}/api/posts/featured`;
    } else if (trending) {
      url = `${API_BASE}/api/posts/trending`;
    } else if (category) {
      url = `${API_BASE}/api/posts?category=${category}`;
    } else if (author) {
      url = `${API_BASE}/api/users/${author}/posts`;
    } else if (tag) {
      url = `${API_BASE}/api/posts/tags/${tag}`;
    }
    
    // Add pagination
    if (!featured && !trending) {
      url += url.includes('?') ? '&' : '?';
      url += `page=${page}&limit=${isMobile ? 4 : 6}`;
    }
    
    return url;
  }, [API_BASE, page, category, featured, trending, tag, author, isMobile]);

  const loadMorePosts = useCallback(async () => {
    if (isLoading || !hasMore || (featured || trending)) return;

    setIsLoading(true);
    try {
      const response = await fetch(buildUrl());

      if (!response.ok) throw new Error(`Failed to fetch posts: ${response.statusText}`);

      const newPosts = await response.json();
      
      if (Array.isArray(newPosts)) {
        if (newPosts.length === 0) {
          setHasMore(false);
        } else {
          // Make sure we don't add duplicate posts
          const uniquePosts = newPosts.filter(
            (newPost) => !posts.some((existingPost) => existingPost._id === newPost._id)
          );
          
          setPosts((prevPosts) => [...prevPosts, ...uniquePosts]);
          setPage((prevPage) => prevPage + 1);
        }
      } else {
        console.error("Received non-array data:", newPosts);
        toast({
          title: "Error",
          description: "Received invalid data from server",
          variant: "destructive",
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
  }, [page, isLoading, hasMore, toast, isMobile, buildUrl, posts, featured, trending]);

  // Initial load for featured/trending posts
  useEffect(() => {
    if ((featured || trending) && initialPosts.length === 0) {
      const fetchSpecialPosts = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(buildUrl());
          if (!response.ok) throw new Error(`Failed to fetch ${featured ? 'featured' : 'trending'} posts`);
          const data = await response.json();
          
          if (Array.isArray(data)) {
            setPosts(data);
          } else {
            console.error("Received non-array data:", data);
          }
        } catch (error) {
          console.error(`Error fetching ${featured ? 'featured' : 'trending'} posts:`, error);
          toast({
            title: "Error",
            description: `Failed to load ${featured ? 'featured' : 'trending'} posts`,
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchSpecialPosts();
    }
  }, [featured, trending, initialPosts, buildUrl, toast]);

  useEffect(() => {
    if (!loadingRef.current || (featured || trending)) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isLoading && hasMore) {
          loadMorePosts();
        }
      },
      { threshold: 0.1 }
    );

    if (loadingRef.current) {
      observerRef.current.observe(loadingRef.current);
    }

    return () => {
      if (observerRef.current && loadingRef.current) {
        observerRef.current.unobserve(loadingRef.current);
      }
    };
  }, [loadMorePosts, isLoading, hasMore, featured, trending]);

  return (
    <div className="w-full">
      {isLoading && posts.length === 0 ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : posts.length === 0 && !isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No posts found</p>
        </div>
      ) : (
        <div className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-2 lg:grid-cols-3'} gap-6`}>
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}

      <div ref={loadingRef} className="w-full flex justify-center py-8">
        {isLoading && posts.length > 0 && (
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        )}
        {!hasMore && posts.length > 0 && (
          <p className="text-muted-foreground text-center">
            No more posts to show
          </p>
        )}
      </div>
    </div>
  );
};

export default InfinitePostFeed;
