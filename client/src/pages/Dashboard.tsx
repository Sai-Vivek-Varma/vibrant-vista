import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Post } from "@/types/post";
import {
  Edit,
  Trash,
  Plus,
  BarChart2,
  MessageSquare,
  Eye,
  Heart,
  User,
  Users,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PostEditor from "@/components/PostEditor";
import { useIsMobile } from "@/hooks/use-mobile";

const Dashboard = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [userStats, setUserStats] = useState({
    postCount: 0,
    viewCount: 0,
    commentCount: 0,
    likeCount: 0,
    followerCount: 0,
    followingCount: 0,
  });
  const { user } = useAuthContext();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const API_BASE =
    import.meta.env.VITE_API_URL || "https://vibrant-vista-sa5w.onrender.com";

  const fetchUserPosts = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // Fetch user stats
      const statsResponse = await fetch(`${API_BASE}/api/users/me/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setUserStats(statsData);
      } else {
        throw new Error("Failed to fetch user stats");
      }

      // Fetch user's posts
      const postsResponse = await fetch(
        `${API_BASE}/api/users/${user._id}/posts`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!postsResponse.ok) throw new Error("Failed to fetch posts");
      const postsData = await postsResponse.json();
      setPosts(postsData);
    } catch (error) {
      console.error("Fetch error:", error);
      toast({
        title: "Error loading data",
        description:
          "Couldn't fetch your data from the server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    fetchUserPosts();
  }, [user, navigate, toast]);

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_BASE}/api/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete post");

      setPosts(posts.filter((post) => post._id !== postId));

      // Update stats
      setUserStats((prev) => ({
        ...prev,
        postCount: prev.postCount - 1,
      }));

      toast({
        title: "Post Deleted",
        description: "Your post has been successfully deleted.",
      });
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete the post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditPost = (postId: string) => {
    setEditingPostId(postId);
    setIsDialogOpen(true);
  };

  const handleNewPost = () => {
    setEditingPostId(null);
    setIsDialogOpen(true);
  };

  const handlePostSuccess = () => {
    setIsDialogOpen(false);
    // Refresh posts after successful creation/editing
    fetchUserPosts();
  };

  return (
    <div className='min-h-screen flex flex-col'>
      <Navbar />

      <main className='flex-grow py-8 sm:py-12'>
        <div className='container mx-auto px-4'>
          <div className='flex justify-between items-center mb-8'>
            <h1 className='text-xl sm:text-2xl font-bold font-serif'>
              Your Dashboard
            </h1>
            <Button
              onClick={handleNewPost}
              className='flex items-center gap-2 h-9'
            >
              <Plus size={16} />
              <span>New Post</span>
            </Button>
          </div>

          {/* User Stats Section */}
          <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8'>
            <div className='bg-white p-4 rounded-xl shadow-sm border border-border'>
              <h3 className='text-sm font-medium mb-1'>Posts</h3>
              <div className='flex items-center'>
                <Edit size={16} className='mr-2 text-primary' />
                <p className='text-xl font-bold'>{userStats.postCount}</p>
              </div>
            </div>
            <div className='bg-white p-4 rounded-xl shadow-sm border border-border'>
              <h3 className='text-sm font-medium mb-1'>Views</h3>
              <div className='flex items-center'>
                <Eye size={16} className='mr-2 text-blue-500' />
                <p className='text-xl font-bold'>{userStats.viewCount}</p>
              </div>
            </div>
            <div className='bg-white p-4 rounded-xl shadow-sm border border-border'>
              <h3 className='text-sm font-medium mb-1'>Comments</h3>
              <div className='flex items-center'>
                <MessageSquare size={16} className='mr-2 text-green-500' />
                <p className='text-xl font-bold'>{userStats.commentCount}</p>
              </div>
            </div>
            <div className='bg-white p-4 rounded-xl shadow-sm border border-border'>
              <h3 className='text-sm font-medium mb-1'>Likes</h3>
              <div className='flex items-center'>
                <Heart size={16} className='mr-2 text-red-500' />
                <p className='text-xl font-bold'>{userStats.likeCount}</p>
              </div>
            </div>
            <div className='bg-white p-4 rounded-xl shadow-sm border border-border'>
              <h3 className='text-sm font-medium mb-1'>Followers</h3>
              <div className='flex items-center'>
                <User size={16} className='mr-2 text-indigo-500' />
                <p className='text-xl font-bold'>{userStats.followerCount}</p>
              </div>
            </div>
            <div className='bg-white p-4 rounded-xl shadow-sm border border-border'>
              <h3 className='text-sm font-medium mb-1'>Following</h3>
              <div className='flex items-center'>
                <Users size={16} className='mr-2 text-purple-500' />
                <p className='text-xl font-bold'>{userStats.followingCount}</p>
              </div>
            </div>
          </div>

          <h2 className='text-lg font-bold mb-6'>Your Posts</h2>

          {isLoading ? (
            <div className='space-y-4'>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className='animate-pulse bg-white rounded-xl p-4 h-20 border border-border'
                ></div>
              ))}
            </div>
          ) : posts.length > 0 ? (
            <div className='space-y-3'>
              {posts.map((post) => (
                <div
                  key={post._id}
                  className='bg-white p-3 sm:p-4 rounded-lg border border-border flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center'
                >
                  <div className='w-full sm:w-16 h-16 rounded-md overflow-hidden'>
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className='w-full h-full object-cover'
                    />
                  </div>

                  <div className='flex-grow'>
                    <Link to={`/posts/${post._id}`}>
                      <h3 className='text-sm sm:text-base font-bold font-serif hover:text-primary transition-colors'>
                        {post.title}
                      </h3>
                    </Link>
                    <div className='flex flex-wrap items-center text-xs text-muted-foreground mt-1 gap-x-3 gap-y-1'>
                      <span>
                        {formatDistanceToNow(new Date(post.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                      <span className='flex items-center gap-1'>
                        <span className='inline-block w-1.5 h-1.5 rounded-full bg-secondary'></span>
                        {post.category}
                      </span>
                      <span className='flex items-center gap-1'>
                        <Eye size={12} />
                        {post.views || 0}
                      </span>
                      <span className='flex items-center gap-1'>
                        <MessageSquare size={12} />
                        {post.comments?.length || post.commentsCount || 0}
                      </span>
                      <span className='flex items-center gap-1'>
                        <Heart size={12} />
                        {post.likes || post.likesCount || 0}
                      </span>
                    </div>
                  </div>

                  <div className='flex gap-2 w-full sm:w-auto'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleEditPost(post._id)}
                      className='h-8 text-xs flex items-center'
                    >
                      <Edit size={14} className='mr-1' />
                      Edit
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleDeletePost(post._id)}
                      className='h-8 text-xs flex items-center text-destructive hover:text-destructive'
                    >
                      <Trash size={14} className='mr-1' />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='bg-muted/30 rounded-xl p-8 text-center'>
              <h3 className='text-base font-medium mb-2'>
                You haven't written any posts yet
              </h3>
              <p className='text-muted-foreground mb-6 text-sm'>
                Create your first post to share your thoughts with the world.
              </p>
              <Button
                onClick={handleNewPost}
                className='h-9 flex items-center gap-2'
              >
                <Plus size={16} />
                Create Your First Post
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Post Editor Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          className={`${
            isMobile ? "max-w-full h-full" : "max-w-2xl h-[90vh]"
          } overflow-y-auto`}
        >
          <DialogHeader>
            <DialogTitle>
              {editingPostId ? "Edit Post" : "Create New Post"}
            </DialogTitle>
          </DialogHeader>
          <PostEditor postId={editingPostId} onSuccess={handlePostSuccess} />
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Dashboard;
