
/**
 * Utility functions for post interaction features
 */
 
const API_BASE = import.meta.env.VITE_API_URL || "https://vibrant-vista-sa5w.onrender.com";

/**
 * Toggle bookmark status for a post
 */
export const toggleBookmarkPost = (postId: string): boolean => {
  const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]') as string[];
  let updatedBookmarks;
  const isCurrentlyBookmarked = bookmarks.includes(postId);
  
  if (isCurrentlyBookmarked) {
    updatedBookmarks = bookmarks.filter((id) => id !== postId);
  } else {
    updatedBookmarks = [...bookmarks, postId];
  }
  
  localStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));
  
  // Return the new bookmarked state
  return !isCurrentlyBookmarked;
};

/**
 * Check if post is bookmarked
 */
export const isPostBookmarked = (postId: string): boolean => {
  const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]') as string[];
  return bookmarks.includes(postId);
};

/**
 * Toggle like status for a post
 */
export const toggleLikePost = async (postId: string, token?: string): Promise<boolean> => {
  if (!token) {
    console.error('No authentication token provided');
    return false;
  }
  
  try {
    const response = await fetch(`${API_BASE}/api/posts/${postId}/likes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to toggle like');
    }
    
    const data = await response.json();
    return data.liked;
  } catch (error) {
    console.error('Error toggling like:', error);
    return false;
  }
};

/**
 * Check if post is liked by current user
 */
export const checkPostLikeStatus = async (postId: string, token?: string): Promise<{hasLiked: boolean, likesCount: number}> => {
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE}/api/posts/${postId}/likes/check`, {
      headers
    });
    
    if (!response.ok) {
      throw new Error('Failed to check like status');
    }
    
    const data = await response.json();
    return {
      hasLiked: data.hasLiked,
      likesCount: data.likesCount
    };
  } catch (error) {
    console.error('Error checking like status:', error);
    return {
      hasLiked: false,
      likesCount: 0
    };
  }
};

/**
 * Share post content
 */
export const sharePost = async (title: string, excerpt: string, url: string): Promise<boolean> => {
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text: excerpt,
        url,
      });
      return true;
    } catch (error) {
      console.error('Error sharing:', error);
      try {
        await navigator.clipboard.writeText(url);
        return true;
      } catch (clipboardError) {
        console.error('Clipboard error:', clipboardError);
        return false;
      }
    }
  } else {
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch (error) {
      console.error('Clipboard error:', error);
      return false;
    }
  }
};

/**
 * Format post content by rendering markdown-like syntax
 */
export const renderPostContent = (content: string) => {
  if (!content) return [];
  
  const paragraphs = content.split('\n\n').map((paragraph, index) => {
    if (paragraph.startsWith('## ')) {
      return {
        type: 'heading',
        content: paragraph.substring(3),
        id: `heading-${index}`
      };
    }
    
    if (paragraph.startsWith('- ')) {
      const items = paragraph.split('\n').map(item => item.substring(2));
      return {
        type: 'list',
        items,
        id: `list-${index}`
      };
    }
    
    return {
      type: 'paragraph',
      content: paragraph,
      id: `para-${index}`
    };
  });
  
  return paragraphs;
};

/**
 * Fetch trending posts
 */
export const fetchTrendingPosts = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/posts/trending`);
    if (!response.ok) throw new Error('Failed to fetch trending posts');
    return await response.json();
  } catch (error) {
    console.error('Error fetching trending posts:', error);
    return [];
  }
};

/**
 * Fetch posts for dashboard stats
 */
export const fetchUserDashboardStats = async (userId: string, token: string) => {
  try {
    const response = await fetch(`${API_BASE}/api/users/${userId}/stats`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch user stats');
    return await response.json();
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return {
      postCount: 0,
      viewCount: 0,
      commentCount: 0,
      likeCount: 0,
      followerCount: 0,
      followingCount: 0
    };
  }
};

// Legacy export names for backward compatibility
export const toggleBookmark = toggleBookmarkPost;
export const toggleLike = toggleLikePost;
