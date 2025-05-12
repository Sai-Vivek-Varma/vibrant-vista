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
} from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { useInView } from "@/hooks/useInView";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  analyzeContent,
  generateQuickSummary,
  generateAudio,
} from "@/services/aiService";
import { toast as sonnerToast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [summaryLoading, setSummaryLoading] = useState<{
    [key: string]: boolean;
  }>({});
  const [summaries, setSummaries] = useState<{ [key: string]: string }>({});
  const [audioUrls, setAudioUrls] = useState<{ [key: string]: string }>({});
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({});
  const [selectedVoice, setSelectedVoice] = useState<string>("default");
  const [isSpeaking, setIsSpeaking] = useState<{ [key: string]: boolean }>({});
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [currentUtterance, setCurrentUtterance] =
    useState<SpeechSynthesisUtterance | null>(null); // To store the current utterance
  const [targetVoiceName, setTargetVoiceName] = useState<string>("Samantha"); // Default female voice
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);
  const [speechSynthesisError, setSpeechSynthesisError] = useState<
    string | null
  >(null);
  const [voicesLoaded, setVoicesLoaded] = useState(false); // Track if voices are loaded
  const [voicesLoading, setVoicesLoading] = useState(false);

  // Load voices and set up listener
  useEffect(() => {
    speechSynthesisRef.current = window.speechSynthesis;

    const loadVoices = () => {
      if (speechSynthesisRef.current) {
        setVoicesLoading(true);
        try {
          const availableVoices = speechSynthesisRef.current.getVoices();
          setVoices(availableVoices);
          setVoicesLoaded(true); // Set flag when voices are loaded
        } catch (error) {
          console.error("Error getting voices: ", error);
          setSpeechSynthesisError("Error initializing speech synthesis.");
        } finally {
          setVoicesLoading(false);
        }
      }
    };

    // Load voices immediately
    loadVoices();

    // Set up listener for voiceschanged event
    const handleVoicesChanged = () => {
      loadVoices();
    };

    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.onvoiceschanged = handleVoicesChanged;
    }

    // Cleanup the event listener
    return () => {
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.onvoiceschanged = null;
      }
      speechSynthesisRef.current = null;
    };
  }, []); // Empty dependency array to run only once on mount

  useEffect(() => {
    if (inView && !isLoading && hasMore) {
      loadMorePosts();
    }
  }, [inView, isLoading, hasMore]);

  const loadMorePosts = async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL ||
          "https://vibrant-vista-sa5w.onrender.com"
        }/api/posts?page=${page}&limit=3`
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
      setSpeechSynthesisError(null); // Clear any previous errors

      // Start new speech
      const utterance = new SpeechSynthesisUtterance(summary.substring(0, 300));
      setCurrentUtterance(utterance); // Store the utterance

      // Set voice if selected
      if (selectedVoice !== "default") {
        const voice = voices.find((v) => v.name === selectedVoice);
        if (voice) {
          utterance.voice = voice;
        } else {
          console.warn(`Voice "${selectedVoice}" not found.`);
        }
      } else if (targetVoiceName !== "default") {
        // Use the default female voice.
        const femaleVoice = voices.find(
          (v) =>
            v.name.toLowerCase().includes("female") ||
            v.name === targetVoiceName
        );
        if (femaleVoice) {
          utterance.voice = femaleVoice;
          setSelectedVoice(femaleVoice.name); // update the dropdown
        }
      }

      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        setIsSpeaking((prev) => ({ ...prev, [postId]: true }));
      };

      utterance.onend = () => {
        setIsSpeaking((prev) => ({ ...prev, [postId]: false }));
        setCurrentUtterance(null); // Clear the utterance
      };

      utterance.onerror = (event) => {
        setIsSpeaking((prev) => ({ ...prev, [postId]: false }));
        setCurrentUtterance(null); // Clear the utterance
        console.error("Error during speech:", event); // Log the error
        setSpeechSynthesisError(event.error); // set the error
        sonnerToast.error("Error playing audio");
      };

      try {
        if (speechSynthesisRef.current) {
          speechSynthesisRef.current.speak(utterance);
        }
      } catch (error) {
        console.error("Error calling speak: ", error);
        setSpeechSynthesisError("Error starting speech.");
        sonnerToast.error("Error playing audio.");
      }
    },
    [voices, selectedVoice, summaries]
  );

  const stopAudio = () => {
    if (speechSynthesisRef.current && currentUtterance) {
      speechSynthesisRef.current.cancel();
      setIsSpeaking({});
      setCurrentUtterance(null); // Clear the utterance here as well
    }
  };

  const handleLikePost = (postId: string) => {
    sonnerToast.success("Post liked!", {
      description: "Your like has been recorded",
    });
  };

  const handleBookmarkPost = (postId: string) => {
    sonnerToast.success("Post bookmarked!", {
      description: "Added to your saved items",
    });
  };

  const PostItem = ({ post }: { post: Post }) => {
    const formattedDate = post.createdAt
      ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
      : "Recently";

    return (
      <div className='w-full max-w-xl mx-auto mb-8'>
        <audio
          ref={(el) => (audioRefs.current[post._id] = el)}
          src={audioUrls[post._id]}
          className='hidden'
        />

        <Card className='overflow-hidden border shadow-md'>
          <div className='p-4 border-b flex items-center justify-between'>
            <div className='flex items-center space-x-3'>
              <div className='w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold'>
                {post.author?.name?.charAt(0).toUpperCase() || "A"}
              </div>
              <div>
                <Link
                  to={`/profile/${post.author?._id}`}
                  className='font-medium hover:text-primary transition-colors'
                >
                  {post.author?.name || "Anonymous"}
                </Link>
                <p className='text-xs text-muted-foreground'>{formattedDate}</p>
              </div>
            </div>
          </div>

          {post.coverImage && (
            <div className='relative overflow-hidden bg-muted'>
              <img
                src={post.coverImage || "/placeholder.svg"}
                alt={post.title}
                className='w-full h-full object-cover'
              />
            </div>
          )}

          <div className='p-4 flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <Button
                variant='ghost'
                size='icon'
                className='hover:text-primary'
                onClick={() => handleLikePost(post._id)}
              >
                <Heart className='h-6 w-6' />
              </Button>
              <Link to={`/posts/${post._id}`}>
                <Button
                  variant='ghost'
                  size='icon'
                  className='hover:text-primary'
                >
                  <MessageSquare className='h-6 w-6' />
                </Button>
              </Link>
              <Button
                variant='ghost'
                size='icon'
                className='hover:text-primary'
              >
                <Share className='h-6 w-6' />
              </Button>
            </div>
            <Button
              variant='ghost'
              size='icon'
              className='hover:text-primary'
              onClick={() => handleBookmarkPost(post._id)}
            >
              <Bookmark className='h-6 w-6' />
            </Button>
          </div>

          <CardContent className='pb-6'>
            <Link to={`/posts/${post._id}`}>
              <h3 className='text-xl font-bold mb-2 font-serif hover:text-primary transition-colors'>
                {post.title}
              </h3>
            </Link>
            <p className='text-muted-foreground mb-4 line-clamp-3'>
              {post.excerpt || post.content}
            </p>

            {/* Quick Summary Section */}
            <div className='mt-4 mb-4'>
              <div className='flex items-center justify-between mb-2'>
                <h4 className='font-medium text-sm flex items-center'>
                  <Sparkles className='h-4 w-4 mr-2 text-yellow-500' />
                  Quick Summary
                </h4>
                {summaries[post._id] && (
                  <div className='flex items-center gap-2'>
                    <Select
                      value={selectedVoice}
                      onValueChange={(value) => {
                        setSelectedVoice(value);
                      }}
                      disabled={!voicesLoaded || voicesLoading}
                    >
                      <SelectTrigger className='w-[120px] h-8'>
                        <SelectValue
                          placeholder={
                            voicesLoading
                              ? "Loading..."
                              : voicesLoaded
                              ? "Voice"
                              : "Unavailable"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {voicesLoaded ? (
                          voices.map((voice) => (
                            <SelectItem key={voice.name} value={voice.name}>
                              {voice.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value='unavailable' disabled>
                            Voices Unavailable
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    {isSpeaking[post._id] ? (
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={stopAudio}
                        className='text-sm'
                      >
                        <VolumeX className='h-4 w-4 mr-1' />
                        Stop
                      </Button>
                    ) : (
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => playAudio(post._id)}
                        className='text-sm'
                        disabled={!voicesLoaded || voicesLoading}
                      >
                        <Volume2 className='h-4 w-4 mr-1' />
                        Listen
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {summaries[post._id] ? (
                <div>
                  <div className='p-3 bg-secondary/10 rounded-lg border border-secondary/20'>
                    <p className='text-sm'>{summaries[post._id]}</p>
                  </div>
                  <div className='mt-4 p-3 bg-secondary/10 rounded-lg border border-secondary/20'>
                    {" "}
                    <p className='text-xs font-medium text-secondary-foreground mb-1'>
                      AI Analysis
                    </p>
                    <div className='space-y-2'>
                      <p className='text-sm'>
                        <span className='font-medium'>Insight:</span>{" "}
                        {aiAnalysis[post._id]?.insight || "N/A"}
                      </p>
                      <p className='text-sm'>
                        <span className='font-medium'>Sentiment:</span>{" "}
                        <span
                          className={
                            aiAnalysis[post._id]?.sentiment === "positive"
                              ? "text-green-500"
                              : aiAnalysis[post._id]?.sentiment === "negative"
                              ? "text-red-500"
                              : "text-blue-500"
                          }
                          style={{ textTransform: "capitalize" }}
                        >
                          {aiAnalysis[post._id]?.sentiment || "N/A"}
                        </span>
                      </p>
                      <p className='text-sm'>
                        <span className='font-medium'>Topics:</span>{" "}
                        {aiAnalysis[post._id]?.topics.join(", ") || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handleGenerateSummary(post._id, post.content)}
                  disabled={summaryLoading[post._id]}
                  className='w-full'
                >
                  {summaryLoading[post._id] ? (
                    <>
                      <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className='h-4 w-4 mr-2' />
                      Generate Quick Summary
                    </>
                  )}
                </Button>
              )}
            </div>
            {/* 
            <div className='mt-4'>
              <Link
                to={`/posts/${post._id}`}
                className='text-primary text-sm hover:underline'
              >
                Read more
              </Link>
            </div> */}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className='instagram-style-feed w-full mx-auto py-6'>
      <div className='flex flex-col items-center pb-20'>
        {posts.map((post) => (
          <PostItem key={post._id} post={post} />
        ))}
      </div>

      <div ref={ref} className='w-full flex justify-center py-8 mt-4'>
        {isLoading && <Loader2 className='h-8 w-8 animate-spin text-primary' />}
        {!hasMore && posts.length > 0 && (
          <div className='text-center p-6 bg-card rounded-lg border border-border shadow-sm'>
            <h3 className='font-medium text-lg mb-2'>
              You're all caught up! 🎉
            </h3>
            <p className='text-muted-foreground'>
              You've seen all the posts for now. Check back later for more
              content.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstagramStyleFeed;
