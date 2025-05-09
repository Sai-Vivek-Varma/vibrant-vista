
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Post } from '@/types/post';
import { isPostBookmarked, isPostLiked } from '@/utils/postUtils';

export const usePostDetail = (id: string | undefined) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  
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
      
      // Check if user has bookmarked this post
      setIsBookmarked(isPostBookmarked(post._id));
      
      // Check if user has liked this post
      setHasLiked(isPostLiked(post._id));
    }
  }, [post]);
  
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
