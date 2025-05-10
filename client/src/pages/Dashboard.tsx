import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Post } from "@/types/post";
import { Edit, Trash, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PostEditor from "@/components/PostEditor";

const Dashboard = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const { user } = useAuthContext();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchUserPosts = async () => {
      try {
        setIsLoading(true);
        const PostsResponse = await fetch(
          `${
            import.meta.env.VITE_API_URL ||
            "https://vibrant-vista-sa5w.onrender.com"
          }/api/posts`
        );
        if (!PostsResponse.ok) throw new Error("Failed to fetch posts");
        const PostsData = await PostsResponse.json();
        setPosts(PostsData);
      } catch (error) {
        console.error("Fetch error:", error);
        toast({
          title: "Error loading posts",
          description: "Couldn't fetch posts from the server",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserPosts();
  }, [user, navigate, toast]);

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setPosts(posts.filter((post) => post._id !== postId));
      toast({
        title: "Post Deleted",
        description: "Your post has been successfully deleted.",
      });
    } catch (error) {
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

      <main className='flex-grow py-12'>
        <div className='container mx-auto px-4'>
          <div className='flex justify-between items-center mb-8'>
            <h1 className='text-2xl md:text-3xl font-bold font-serif'>
              Your Dashboard
            </h1>
            <Button onClick={handleNewPost} className='flex items-center gap-2'>
              <Plus size={18} />
              <span>New Post</span>
            </Button>
          </div>

          {/* User Stats Section */}
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8'>
            <div className='bg-white p-6 rounded-xl shadow-sm border border-border'>
              <h3 className='text-lg font-medium mb-2'>Total Posts</h3>
              <p className='text-3xl font-bold'>{posts.length}</p>
            </div>
            <div className='bg-white p-6 rounded-xl shadow-sm border border-border'>
              <h3 className='text-lg font-medium mb-2'>Total Views</h3>
              <p className='text-3xl font-bold'>1,245</p>
            </div>
            <div className='bg-white p-6 rounded-xl shadow-sm border border-border'>
              <h3 className='text-lg font-medium mb-2'>Total Comments</h3>
              <p className='text-3xl font-bold'>32</p>
            </div>
          </div>

          <h2 className='text-xl font-bold mb-6'>Your Posts</h2>

          {isLoading ? (
            <div className='space-y-6'>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className='animate-pulse bg-white rounded-xl p-6 h-24 border border-border'
                ></div>
              ))}
            </div>
          ) : posts.length > 0 ? (
            <div className='space-y-4'>
              {posts.map((post) => (
                <div
                  key={post._id}
                  className='bg-white p-4 sm:p-6 rounded-xl border border-border flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center'
                >
                  <div className='w-full sm:w-20 h-20 rounded-lg overflow-hidden'>
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className='w-full h-full object-cover'
                    />
                  </div>

                  <div className='flex-grow'>
                    <Link to={`/posts/${post._id}`}>
                      <h3 className='font-bold font-serif hover:text-primary transition-colors'>
                        {post.title}
                      </h3>
                    </Link>
                    <div className='flex flex-wrap items-center text-sm text-muted-foreground mt-1 gap-x-4 gap-y-2'>
                      <span>
                        Published{" "}
                        {formatDistanceToNow(new Date(post.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                      <span className='flex items-center gap-1'>
                        <span className='inline-block w-2 h-2 rounded-full bg-secondary'></span>
                        {post.category}
                      </span>
                      <span>325 views</span>
                      <span>12 comments</span>
                    </div>
                  </div>

                  <div className='flex gap-2 w-full sm:w-auto'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleEditPost(post._id)}
                      className='w-full sm:w-auto'
                    >
                      <Edit size={16} className='mr-1' />
                      Edit
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleDeletePost(post._id)}
                      className='w-full sm:w-auto text-destructive hover:text-destructive'
                    >
                      <Trash size={16} className='mr-1' />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='bg-muted/30 rounded-xl p-12 text-center'>
              <h3 className='text-lg font-medium mb-2'>
                You haven't written any posts yet
              </h3>
              <p className='text-muted-foreground mb-6'>
                Create your first post to share your thoughts with the world.
              </p>
              <Button onClick={handleNewPost}>
                <Plus size={18} className='mr-2' />
                Create Your First Post
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Post Editor Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className='max-w-2xl h-[90vh] overflow-y-auto'>
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
