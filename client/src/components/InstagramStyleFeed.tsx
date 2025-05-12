
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import type { Post } from "@/types/post";
import { Card, CardContent } from "@/components/ui/card";
import {
  Loader2,
  MessageSquare,
  Heart,
  Share,
  Bookmark,
  Volume2,
  Sparkles,
  VolumeX,
  User
} from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { useInView } from "@/hooks/useInView";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  analyzeContent,
  generateQuickSummary,
} from "@/services/aiService";
import { toast as sonnerToast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { toggleLikePost, isPostBookmarked, toggleBookmarkPost, sharePost } from "@/utils/postUtils";

interface InstagramStyleFeedProps {
  initialPosts?: Post[];
}

const InstagramStyleFeed = ({ initialPosts = [] }: InstagramStyleFeedProps) => {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState<{
    [key: string]: {
      insight: string;
      sentiment: "positive" | "neutral" | "negative";
      topics: string[];
      summary: string;
    };
  }>({});
  const { toast } = useToast();
  const [ref, inView] = useInView({ threshold: 0.5 });
  const { user } = useAuthContext();
  const [summaryLoading, setSummaryLoading] = useState<{
    [key: string]: boolean;
  }>({});
  const [summaries, setSummaries] = useState<{ [key: string]: string }>({});
  const [selectedVoice, setSelectedVoice] = useState<string>("default");
  const [isSpeaking, setIsSpeaking] = useState<{ [key: string]: boolean }>({});
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voicesLoaded, setVoicesLoaded] = useState(false); 
  const [voicesLoading, setVoicesLoading] = useState(false);
  const [expandedComments, setExpandedComments] = useState<{ [key: string]: boolean }>({});
  const [comments, setComments] = useState<{ [key: string]: any[] }>({});
  const [newCommentText, setNewCommentText] = useState<{ [key: string]: string }>({});
  const [isSubmittingComment, setIsSubmittingComment] = useState<{ [key: string]: boolean }>({});
  const [postLikes, setPostLikes] = useState<{ [key: string]: number }>({});
  const [hasLiked, setHasLiked] = useState<{ [key: string]: boolean }>({});
  const [isBookmarked, setIsBookmarked] = useState<{ [key: string]: boolean }>({});
  const API_BASE = import.meta.env.VITE_API_URL || "https://vibrant-vista-sa5w.onrender.com";
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load voices and set up listener
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      speechSynthesisRef.current = window.speechSynthesis;
      
      const loadVoices = () => {
        if (speechSynthesisRef.current) {
          try {
            setVoicesLoading(true);
            const availableVoices = speechSynthesisRef.current.getVoices();
            if (availableVoices.length > 0) {
              setVoices(availableVoices);
              setVoicesLoaded(true);
            }
          } catch (error) {
            console.error("Error getting voices:", error);
          } finally {
            setVoicesLoading(false);
          }
        }
      };
      
      // Initial load
      loadVoices();
      
      // Setup event listener
      speechSynthesisRef.current.onvoiceschanged = loadVoices;
      
      return () => {
        if (speechSynthesisRef.current) {
          speechSynthesisRef.current.onvoiceschanged = null;
        }
      };
    }
  }, []);
  
  // Cancel speech synthesis when component unmounts
  useEffect(() => {
    return () => {
      if (speechSynthesisRef.current && currentUtteranceRef.current) {
        speechSynthesisRef.current.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (inView && !isLoading && hasMore) {
      loadMorePosts();
    }
  }, [inView, isLoading, hasMore]);

  // Initialize like status, bookmarks, and comments for posts on load
  useEffect(() => {
    const initPostStatuses = async () => {
      const token = localStorage.getItem('token');
      
      // Check bookmarks
      const bookmarkStatusObj: { [key: string]: boolean } = {};
      posts.forEach(post => {
        bookmarkStatusObj[post._id] = isPostBookmarked(post._id);
      });
      setIsBookmarked(bookmarkStatusObj);
      
      // Fetch likes and comments for each post
      const likesObj: { [key: string]: number } = {};
      const likedObj: { [key: string]: boolean } = {};
      const commentsObj: { [key: string]: any[] } = {};
      
      await Promise.all(posts.map(async (post) => {
        // Fetch like status
        try {
          const likeResponse = await fetch(`${API_BASE}/api/posts/${post._id}/likes/check`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          });
          
          if (likeResponse.ok) {
            const likeData = await likeResponse.json();
            likesObj[post._id] = likeData.likesCount;
            likedObj[post._id] = likeData.hasLiked;
          } else {
            likesObj[post._id] = post.likesCount || 0;
            likedObj[post._id] = false;
          }
        } catch (error) {
          likesObj[post._id] = post.likesCount || 0;
          likedObj[post._id] = false;
        }
        
        // Fetch comments
        try {
          const commentsResponse = await fetch(`${API_BASE}/api/posts/${post._id}/comments`);
          if (commentsResponse.ok) {
            const commentsData = await commentsResponse.json();
            commentsObj[post._id] = commentsData;
          } else {
            commentsObj[post._id] = [];
          }
        } catch (error) {
          commentsObj[post._id] = [];
        }
      }));
      
      setPostLikes(likesObj);
      setHasLiked(likedObj);
      setComments(commentsObj);
    };
    
    if (posts.length > 0) {
      initPostStatuses();
    }
  }, [posts, API_BASE]);

  const loadMorePosts = async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}/api/posts?page=${page}&limit=3`
      );

      if (!response.ok) throw new Error("Failed to fetch posts");

      const newPosts = await response.json();

      if (newPosts.length === 0) {
        setHasMore(false);
      } else {
        setPosts((prevPosts) => {
          const uniqueNewPosts = newPosts.filter(
            (newPost: Post) =>
              !prevPosts.some(
                (existingPost) => existingPost._id === newPost._id
              )
          );

          if (uniqueNewPosts.length === 0) {
            setHasMore(false);
            return prevPosts;
          }

          return [...prevPosts, ...uniqueNewPosts];
        });
        setPage((prevPage) => prevPage + 1);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast({
        title: "Error",
        description: "Failed to load more posts",
        variant: "destructive",
      });
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateSummary = async (postId: string, content: string) => {
    try {
      setSummaryLoading((prev) => ({ ...prev, [postId]: true }));

      const summaryPromise = generateQuickSummary(content);
      const analysisPromise = analyzeContent(content);

      const [summary, analysis] = await Promise.all([
        summaryPromise,
        analysisPromise,
      ]);

      setSummaries((prev) => ({ ...prev, [postId]: summary }));
      setAiAnalysis((prev) => ({ ...prev, [postId]: analysis }));

      sonnerToast.success("Summary and analysis generated!", {
        description:
          "You can now listen to the quick summary and see the analysis.",
      });
    } catch (error) {
      console.error("Error generating summary or analysis:", error);
      sonnerToast.error("Failed to generate summary and analysis");
    } finally {
      setSummaryLoading((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const playAudio = useCallback(
    (postId: string) => {
      const summary = summaries[postId];
      if (!summary) return;

      // Stop any currently playing audio
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
      setIsSpeaking({});

      try {
        // Create new utterance
        const utterance = new SpeechSynthesisUtterance(summary.substring(0, 300));
        currentUtteranceRef.current = utterance;
        
        // Set voice if available
        if (selectedVoice !== "default") {
          const voice = voices.find((v) => v.name === selectedVoice);
          if (voice) utterance.voice = voice;
        }
        
        // Set event handlers
        utterance.onstart = () => {
          setIsSpeaking((prev) => ({ ...prev, [postId]: true }));
        };
        
        utterance.onend = () => {
          setIsSpeaking((prev) => ({ ...prev, [postId]: false }));
          currentUtteranceRef.current = null;
        };
        
        utterance.onerror = (event) => {
          console.error("Speech synthesis error:", event);
          setIsSpeaking((prev) => ({ ...prev, [postId]: false }));
          sonnerToast.error("Error playing audio");
          currentUtteranceRef.current = null;
        };
        
        // Speak
        if (speechSynthesisRef.current) {
          speechSynthesisRef.current.speak(utterance);
        }
      } catch (error) {
        console.error("Error starting speech synthesis:", error);
        sonnerToast.error("Could not start text-to-speech");
      }
    },
    [selectedVoice, summaries, voices]
  );

  const stopAudio = useCallback(() => {
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
      setIsSpeaking({});
      currentUtteranceRef.current = null;
    }
  }, []);

  const handleLikePost = async (postId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to like posts",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Login session expired. Please log in again.",
          variant: "destructive",
        });
        return;
      }

      // Optimistic update
      const wasLiked = hasLiked[postId];
      setHasLiked(prev => ({ ...prev, [postId]: !wasLiked }));
      setPostLikes(prev => ({ 
        ...prev, 
        [postId]: wasLiked ? Math.max(0, prev[postId] - 1) : (prev[postId] || 0) + 1 
      }));

      const response = await fetch(`${API_BASE}/api/posts/${postId}/likes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to toggle like');
      
      const data = await response.json();
      
      // Update with actual values from server
      setHasLiked(prev => ({ ...prev, [postId]: data.liked }));
      setPostLikes(prev => ({ ...prev, [postId]: data.likesCount }));
      
    } catch (error) {
      console.error('Error liking post:', error);
      // Revert the optimistic update on error
      toast({
        title: "Error",
        description: "Failed to update like status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBookmarkPost = (postId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to bookmark posts",
        variant: "destructive",
      });
      return;
    }

    try {
      const newBookmarkState = !isBookmarked[postId];
      
      // Update state optimistically
      setIsBookmarked(prev => ({ ...prev, [postId]: newBookmarkState }));
      
      // Toggle bookmark in localStorage
      toggleBookmarkPost(postId);
      
      sonnerToast.success(
        newBookmarkState ? "Post bookmarked!" : "Bookmark removed", 
        { description: newBookmarkState ? "Added to your saved items" : "Removed from your saved items" }
      );
    } catch (error) {
      console.error('Error bookmarking post:', error);
      toast({
        title: "Error",
        description: "Failed to bookmark post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggleComments = async (postId: string) => {
    setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }));
    
    // Initialize comment text field if needed
    if (!newCommentText[postId]) {
      setNewCommentText(prev => ({ ...prev, [postId]: "" }));
    }
  };

  const handleSubmitComment = async (postId: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to comment",
        variant: "destructive",
      });
      return;
    }
    
    const commentText = newCommentText[postId];
    if (!commentText || commentText.trim() === "") {
      toast({
        title: "Comment Required",
        description: "Please enter a comment",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmittingComment(prev => ({ ...prev, [postId]: true }));
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Login session expired. Please log in again.",
          variant: "destructive",
        });
        return;
      }
      
      const response = await fetch(`${API_BASE}/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: commentText }),
      });
      
      if (!response.ok) throw new Error('Failed to add comment');
      
      const newComment = await response.json();
      
      // Update comments state
      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newComment]
      }));
      
      // Clear comment input
      setNewCommentText(prev => ({ ...prev, [postId]: "" }));
      
      sonnerToast.success("Comment added!", {
        description: "Your comment has been posted."
      });
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast({
        title: "Error",
        description: "Failed to submit your comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingComment(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleSharePost = async (postId: string, title: string, excerpt: string) => {
    try {
      const postUrl = `${window.location.origin}/posts/${postId}`;
      const success = await sharePost(title, excerpt, postUrl);
      
      sonnerToast.success(
        success ? "Post shared!" : "Link copied", 
        { description: success ? "Successfully shared the post" : "Post URL copied to clipboard" }
      );
    } catch (error) {
      console.error('Error sharing post:', error);
      toast({
        title: "Error",
        description: "Failed to share post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const PostItem = ({ post }: { post: Post }) => {
    const formattedDate = post.createdAt
      ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
      : "Recently";

    return (
      <div className="w-full max-w-md sm:max-w-xl mx-auto mb-6">
        <Card className="overflow-hidden border shadow-md">
          <div className="p-3 border-b flex items-center justify-between">
            <Link to={`/profile/${post.author?._id}`} className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={`https://source.unsplash.com/random/100x100/?portrait&${post.author?._id}`} alt={post.author?.name} />
                <AvatarFallback>{post.author?.name?.[0] || "A"}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm hover:text-primary transition-colors">{post.author?.name || "Anonymous"}</p>
                <p className="text-xs text-muted-foreground">{formattedDate}</p>
              </div>
            </Link>
          </div>
          
          {post.coverImage && (
            <div className="relative aspect-video sm:aspect-square overflow-hidden bg-muted">
              <Link to={`/posts/${post._id}`}>
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </Link>
              <Link
                to={`/categories/${post.category}`}
                className="absolute top-2 right-2 px-2 py-1 text-xs font-medium bg-black/60 text-white rounded-md"
              >
                {post.category}
              </Link>
            </div>
          )}

          <div className="p-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleLikePost(post._id)}
                className={`flex items-center space-x-1 ${hasLiked[post._id] ? "text-red-500" : ""}`}
              >
                <Heart size={18} className={hasLiked[post._id] ? "fill-red-500" : ""} />
                <span className="text-sm">{postLikes[post._id] || post.likesCount || 0}</span>
              </button>
              
              <button
                onClick={() => handleToggleComments(post._id)}
                className="flex items-center space-x-1"
              >
                <MessageSquare size={18} />
                <span className="text-sm">{(comments[post._id] || []).length}</span>
              </button>
              
              <button
                onClick={() => handleSharePost(post._id, post.title, post.excerpt)}
                className="flex items-center"
              >
                <Share size={18} />
              </button>
            </div>
            
            <button
              onClick={() => handleBookmarkPost(post._id)}
              className={isBookmarked[post._id] ? "text-primary" : ""}
            >
              <Bookmark size={18} className={isBookmarked[post._id] ? "fill-primary" : ""} />
            </button>
          </div>

          <CardContent className="pb-3 pt-0">
            <Link to={`/posts/${post._id}`}>
              <h3 className="text-lg font-bold mb-1 hover:text-primary transition-colors">
                {post.title}
              </h3>
            </Link>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {post.excerpt}
            </p>
            
            {/* Comments section */}
            {expandedComments[post._id] && (
              <div className="mt-2 mb-3 border-t pt-2">
                <div className="max-h-32 overflow-y-auto">
                  {comments[post._id]?.length > 0 ? (
                    comments[post._id].map((comment) => (
                      <div key={comment._id} className="py-1.5">
                        <div className="flex gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback>{comment.author.name?.[0] || "?"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center">
                              <Link to={`/profile/${comment.author._id}`} className="text-xs font-medium mr-1">
                                {comment.author.name}
                              </Link>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-xs">{comment.content}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-center text-muted-foreground py-2">
                      No comments yet. Be the first to comment!
                    </p>
                  )}
                </div>
                
                <form onSubmit={(e) => handleSubmitComment(post._id, e)} className="flex items-center gap-2 mt-2">
                  <Avatar className="w-6 h-6 flex-shrink-0">
                    <AvatarFallback>{user ? user.name?.[0] : "?"}</AvatarFallback>
                  </Avatar>
                  <Textarea
                    value={newCommentText[post._id] || ""}
                    onChange={(e) => setNewCommentText(prev => ({ ...prev, [post._id]: e.target.value }))}
                    placeholder="Add a comment..."
                    className="h-8 min-h-8 py-1 text-xs"
                    disabled={!user || isSubmittingComment[post._id]}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    variant="ghost"
                    disabled={!user || isSubmittingComment[post._id] || !newCommentText[post._id]?.trim()}
                    className="h-8 w-8"
                  >
                    <Share size={14} className="rotate-90" />
                  </Button>
                </form>
              </div>
            )}

            {/* Quick Summary Section */}
            {post.content && post.content.length > 100 && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-xs flex items-center">
                    <Sparkles className="h-3 w-3 mr-1 text-yellow-500" />
                    AI Summary
                  </h4>
                  
                  {summaries[post._id] && (
                    <div className="flex items-center gap-1">
                      <Select
                        value={selectedVoice}
                        onValueChange={(value) => setSelectedVoice(value)}
                        disabled={!voicesLoaded || voicesLoading}
                      >
                        <SelectTrigger className="w-[80px] h-6 text-xs">
                          <SelectValue placeholder="Voice" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Default</SelectItem>
                          {voices.map((voice) => (
                            <SelectItem key={voice.name} value={voice.name}>
                              {voice.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {isSpeaking[post._id] ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={stopAudio}
                          className="h-6 px-2 text-xs"
                        >
                          <VolumeX className="h-3 w-3 mr-1" />
                          Stop
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => playAudio(post._id)}
                          className="h-6 px-2 text-xs"
                          disabled={!summaries[post._id] || !voicesLoaded}
                        >
                          <Volume2 className="h-3 w-3 mr-1" />
                          Listen
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {summaries[post._id] ? (
                  <div className="p-2 bg-secondary/10 rounded-lg text-xs mb-2 border border-secondary/10">
                    <p>{summaries[post._id]}</p>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleGenerateSummary(post._id, post.content)}
                    disabled={summaryLoading[post._id]}
                    className="w-full h-7 text-xs mb-2"
                  >
                    {summaryLoading[post._id] ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3 w-3 mr-1" />
                        Generate AI Summary
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
            
            <div>
              <Link
                to={`/posts/${post._id}`}
                className="text-primary text-xs hover:underline"
              >
                Read more
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="instagram-style-feed w-full max-w-screen-xl mx-auto py-4">
      <div className="flex flex-col items-center">
        {posts.map((post) => (
          <PostItem key={post._id} post={post} />
        ))}
      </div>

      <div ref={ref} className="w-full flex justify-center py-4">
        {isLoading && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
        {!hasMore && posts.length > 0 && (
          <div className="text-center p-4 bg-card rounded-lg border border-border shadow-sm max-w-md mx-auto">
            <h3 className="font-medium text-base mb-1">
              You're all caught up! 🎉
            </h3>
            <p className="text-sm text-muted-foreground">
              You've seen all the posts for now.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstagramStyleFeed;
