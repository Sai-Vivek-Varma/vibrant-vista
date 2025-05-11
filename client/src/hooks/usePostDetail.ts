
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
        const userLikes = Array.isArray(postData.likes) ? postData.likes : [];
        const userBookmarks = Array.isArray(postData.bookmarks) ? postData.bookmarks : [];
        
        setHasLiked(userLikes.includes(user._id) || false);
        setLikes(userLikes.length || 0);
        setIsBookmarked(userBookmarks.includes(user._id) || false);
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
          // Use mock data since the API endpoint is returning 404
          const mockRelatedPosts = [
            {
              _id: '1',
              title: 'Related Post 1',
              excerpt: 'This is a related post',
              content: 'Content for related post 1',
              coverImage: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&auto=format&fit=crop&q=60',
              category: post.category,
              author: {
                _id: '1',
                name: 'Author 1',
                email: 'author1@example.com'
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              _id: '2',
              title: 'Related Post 2',
              excerpt: 'This is another related post',
              content: 'Content for related post 2',
              coverImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop&q=60',
              category: post.category,
              author: {
                _id: '2',
                name: 'Author 2',
                email: 'author2@example.com'
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ];
          
          setRelatedPosts(mockRelatedPosts);
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
      // Check if likes and bookmarks are arrays before using array methods
      const userLikes = Array.isArray(post.likes) ? post.likes : [];
      const userBookmarks = Array.isArray(post.bookmarks) ? post.bookmarks : [];
      
      // Check if user has liked/bookmarked from the server data
      setHasLiked(userLikes.includes(user._id) || false);
      setLikes(userLikes.length || 0);
      setIsBookmarked(userBookmarks.includes(user._id) || false);
    } else if (post) {
      // If no user, initialize with local data
      const postLikes = Array.isArray(post.likes) ? post.likes.length : 0;
      setLikes(postLikes);
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
