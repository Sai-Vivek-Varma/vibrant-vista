
/**
 * Utility functions for post interaction features
 */

/**
 * Toggle bookmark status for a post
 */
export const togglePostBookmark = (postId: string): boolean => {
  const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
  let updatedBookmarks;
  const isCurrentlyBookmarked = bookmarks.includes(postId);
  
  if (isCurrentlyBookmarked) {
    updatedBookmarks = bookmarks.filter((id: string) => id !== postId);
  } else {
    updatedBookmarks = [...bookmarks, postId];
  }
  
  localStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));
  return !isCurrentlyBookmarked;
};

/**
 * Toggle like status for a post
 */
export const togglePostLike = (postId: string): boolean => {
  const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
  let updatedLikedPosts;
  const hasLiked = likedPosts.includes(postId);
  
  if (hasLiked) {
    updatedLikedPosts = likedPosts.filter((id: string) => id !== postId);
  } else {
    updatedLikedPosts = [...likedPosts, postId];
  }
  
  localStorage.setItem('likedPosts', JSON.stringify(updatedLikedPosts));
  return !hasLiked;
};

/**
 * Share post content
 */
export const sharePost = (title: string, excerpt: string, url: string): Promise<boolean> => {
  if (navigator.share) {
    return navigator.share({
      title,
      text: excerpt,
      url,
    })
    .then(() => true)
    .catch((error) => {
      console.error('Error sharing:', error);
      return false;
    });
  } else {
    // Fallback
    navigator.clipboard.writeText(url);
    return Promise.resolve(true);
  }
};

/**
 * Check if post is bookmarked
 */
export const isPostBookmarked = (postId: string): boolean => {
  const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
  return bookmarks.includes(postId);
};

/**
 * Check if post is liked
 */
export const isPostLiked = (postId: string): boolean => {
  const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
  return likedPosts.includes(postId);
};

/**
 * Format post content by rendering markdown-like syntax
 */
export const renderPostContent = (content: string) => {
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

// For backward compatibility
export const toggleBookmarkPost = togglePostBookmark;
export const toggleLikePost = togglePostLike;
