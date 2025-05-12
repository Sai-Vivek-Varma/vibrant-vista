
import { useState, useEffect } from 'react';
import { CommentType } from '@/types/comment';
import { useAuthContext } from '@/contexts/AuthContext';
import { isPostBookmarked } from '@/utils/postUtils';

export const usePostDetails = (postId: string) => {
  const [hasLiked, setHasLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthContext();
  
  const API_BASE = import.meta.env.VITE_API_URL || "https://vibrant-vista-sa5w.onrender.com";
  
  // Check if post is bookmarked (from localStorage)
  useEffect(() => {
    if (postId) {
      setIsBookmarked(isPostBookmarked(postId));
    }
  }, [postId]);
  
  // Fetch like status and count
  useEffect(() => {
    if (!postId) return;
    
    const fetchLikeStatus = async () => {
      try {
        setIsLoading(true);
        const headers: Record<string, string> = {};
        const token = localStorage.getItem('token');
        
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
        
        const response = await fetch(`${API_BASE}/api/posts/${postId}/likes/check`, {
          headers
        });
        
        if (response.ok) {
          const data = await response.json();
          setHasLiked(data.hasLiked);
          setLikesCount(data.likesCount);
        }
      } catch (error) {
        console.error('Error fetching like status:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLikeStatus();
  }, [postId, API_BASE]);
  
  // Fetch comments
  const fetchComments = async () => {
    if (!postId) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE}/api/posts/${postId}/comments`);
      
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchComments();
  }, [postId, API_BASE]);
  
  const toggleLike = async () => {
    if (!user || !postId) return false;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;
      
      const response = await fetch(`${API_BASE}/api/posts/${postId}/likes`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to toggle like');
      
      const data = await response.json();
      setHasLiked(data.liked);
      setLikesCount(data.likesCount);
      return true;
    } catch (error) {
      console.error('Error toggling like:', error);
      return false;
    }
  };
  
  return {
    hasLiked,
    setHasLiked,
    likesCount,
    setLikesCount,
    comments,
    setComments,
    refreshComments: fetchComments,
    isBookmarked,
    setIsBookmarked,
    toggleLike,
    isLoading
  };
};
