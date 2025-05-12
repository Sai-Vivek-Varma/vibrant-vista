
import { useState, useEffect } from 'react';
import { CommentType } from '@/types/comment';
import { useAuthContext } from '@/contexts/AuthContext';

export const usePostDetails = (postId: string) => {
  const [hasLiked, setHasLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { user } = useAuthContext();
  
  const API_BASE = import.meta.env.VITE_API_URL || "https://vibrant-vista-sa5w.onrender.com";
  
  // Check if post is bookmarked (from localStorage)
  useEffect(() => {
    if (postId) {
      const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
      setIsBookmarked(bookmarks.includes(postId));
    }
  }, [postId]);
  
  // Fetch like status and count
  useEffect(() => {
    if (!postId) return;
    
    const fetchLikeStatus = async () => {
      try {
        const headers: Record<string, string> = {};
        if (user && localStorage.getItem('token')) {
          headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
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
      }
    };
    
    fetchLikeStatus();
  }, [postId, user, API_BASE]);
  
  // Fetch comments
  const fetchComments = async () => {
    if (!postId) return;
    
    try {
      const response = await fetch(`${API_BASE}/api/posts/${postId}/comments`);
      
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };
  
  useEffect(() => {
    fetchComments();
  }, [postId, API_BASE]);
  
  return {
    hasLiked,
    setHasLiked,
    likesCount,
    setLikesCount,
    comments,
    setComments,
    refreshComments: fetchComments,
    isBookmarked,
    setIsBookmarked
  };
};
