
import { useState, useEffect, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import PostCard from "@/components/PostCard";
import { Loader2 } from "lucide-react";
import { Post } from "@/types/post";
import { useIsMobile } from "@/hooks/use-mobile";

interface InfinitePostFeedProps {
  initialPosts?: Post[];
}

const InfinitePostFeed = ({ initialPosts = [] }: InfinitePostFeedProps) => {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { toast } = useToast();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const loadMorePosts = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL ||
          "https://vibrant-vista-sa5w.onrender.com"
        }/api/posts?page=${page}&limit=${isMobile ? 4 : 6}`
      );

      if (!response.ok) throw new Error("Failed to fetch posts");

      const newPosts = await response.json();

      if (newPosts.length === 0) {
        setHasMore(false);
      } else {
        setPosts((prevPosts) => [...prevPosts, ...newPosts]);
        setPage((prevPage) => prevPage + 1);
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
  }, [page, isLoading, hasMore, toast, isMobile]);

  useEffect(() => {
    if (!loadingRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isLoading) {
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
  }, [loadMorePosts, isLoading]);

  return (
    <div className='w-full'>
      <div className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-2 lg:grid-cols-3'} gap-6`}>
        {posts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>

      <div ref={loadingRef} className='w-full flex justify-center py-8'>
        {isLoading && <Loader2 className='h-8 w-8 animate-spin text-primary' />}
        {!hasMore && posts.length > 0 && (
          <p className='text-muted-foreground text-center'>
            No more posts to show
          </p>
        )}
      </div>
    </div>
  );
};

export default InfinitePostFeed;
