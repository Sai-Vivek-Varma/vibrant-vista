
import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Post } from '@/types/post';
import { isPostBookmarked, isPostLiked, togglePostBookmark, togglePostLike } from '@/utils/postUtils';
import { useAuthContext } from '@/contexts/AuthContext';

export const usePostDetail = (id: string | undefined) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const { user } = useAuthContext();
  
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
      
      const postData = await response.json();
      
      // Update likes and bookmark status directly from the server data
      if (user && postData) {
        setHasLiked(postData.likes?.includes(user._id) || false);
        setLikes(postData.likes?.length || 0);
        setIsBookmarked(postData.bookmarks?.includes(user._id) || false);
      }
      
      return postData;
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
          if (Array.isArray(data)) {
            setRelatedPosts(
              data.filter((p: Post) => p._id !== post._id).slice(0, 2)
            );
          } else if (data.posts) {
            setRelatedPosts(
              data.posts.filter((p: Post) => p._id !== post._id).slice(0, 2)
            );
          }
        } catch (error) {
          console.error('Error fetching related posts:', error);
        }
      };
      
      fetchRelatedPosts();
    }
  }, [post]);

  // Initialize like and bookmark state when post or user changes
  useEffect(() => {
    if (post && user) {
      // Check if user has liked/bookmarked from the server data
      setHasLiked(post.likes?.includes(user._id) || false);
      setLikes(post.likes?.length || 0);
      setIsBookmarked(post.bookmarks?.includes(user._id) || false);
    } else if (post) {
      // If no user, initialize with local data
      setLikes(post.likes?.length || 0);
      setHasLiked(isPostLiked(post._id));
      setIsBookmarked(isPostBookmarked(post._id));
    }
  }, [post, user]);
  
  const handleLikeToggle = useCallback(() => {
    if (!post) return;
    
    setHasLiked(prev => !prev);
    setLikes(prev => hasLiked ? prev - 1 : prev + 1);
    
    // Update local storage for non-authenticated users
    if (!user) {
      togglePostLike(post._id);
    }
  }, [post, hasLiked, user]);
  
  const handleBookmarkToggle = useCallback(() => {
    if (!post) return;
    
    setIsBookmarked(prev => !prev);
    
    // Update local storage for non-authenticated users
    if (!user) {
      togglePostBookmark(post._id);
    }
  }, [post, user]);
  
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
    refreshComments,
    handleLikeToggle,
    handleBookmarkToggle
  };
};
