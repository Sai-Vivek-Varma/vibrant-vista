
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Post } from '@/types/post';
import { isPostBookmarked } from '@/utils/postUtils';
import { useAuthContext } from '@/contexts/AuthContext';

export const usePostDetail = (id: string | undefined) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const { user } = useAuthContext();
  const API_BASE = import.meta.env.VITE_API_URL || "https://vibrant-vista-sa5w.onrender.com";
  
  // Fetch post data using React Query
  const { 
    data: post, 
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['post', id],
    queryFn: async () => {
      if (!id) return null;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (localStorage.getItem('token')) {
        headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
      }
      
      const response = await fetch(`${API_BASE}/api/posts/${id}`, { headers });
      
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
            `${API_BASE}/api/posts?category=${post.category}&limit=2`
          );
          if (!response.ok) throw new Error('Failed to fetch related posts');
          
          const data = await response.json();
          // Filter out current post
          setRelatedPosts(
            data.filter((p: Post) => p._id !== post._id).slice(0, 2)
          );
        } catch (error) {
          console.error('Error fetching related posts:', error);
        }
      };
      
      fetchRelatedPosts();
    }
  }, [post, API_BASE]);

  // Initialize likes and bookmark status
  useEffect(() => {
    if (post) {
      // Set likes from post data
      setLikes(post.likes || post.likesCount || 0);
      
      // Check if user has bookmarked this post
      setIsBookmarked(isPostBookmarked(post._id));
      
      // Check if user has liked this post
      setHasLiked(post.hasLiked || false);
      
      // If user is authenticated, check server for like status
      if (user && id) {
        const checkLikeStatus = async () => {
          try {
            const response = await fetch(
              `${API_BASE}/api/posts/${id}/likes/check`,
              {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
              }
            );
            
            if (response.ok) {
              const data = await response.json();
              setHasLiked(data.hasLiked);
              setLikes(data.likesCount);
            }
          } catch (error) {
            console.error('Error checking like status:', error);
          }
        };
        
        checkLikeStatus();
      }
    }
  }, [post, id, user, API_BASE]);
  
  const refreshComments = async () => {
    await refetch();
  };
  
  return {
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
  };
};
