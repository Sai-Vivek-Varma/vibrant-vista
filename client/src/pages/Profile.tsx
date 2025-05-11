import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PostCard from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/types/user";
import { Post } from "@/types/post";

const API_BASE =
  import.meta.env.VITE_API_URL || "https://vibrant-vista-sa5w.onrender.com";

const Profile = () => {
  const { id } = useParams<{ id: string }>();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const { user, updateProfile } = useAuthContext();
  const { toast } = useToast();

  // Check if viewing own profile
  const isOwnProfile = !id || (user && id === user._id);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch user data
        const userEndpoint = isOwnProfile
          ? `${API_BASE}/api/users/me`
          : `${API_BASE}/api/users/${id}`;

        const userResponse = await fetch(userEndpoint, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!userResponse.ok) throw new Error("Failed to fetch user data");
        const userData = await userResponse.json();
        setProfileUser(userData);
        setName(userData.name);
        setBio(userData.bio || "");

        // Fetch user posts
        const postsResponse = await fetch(
          `${API_BASE}/api/posts/user/${userData._id}`
        );
        if (!postsResponse.ok) throw new Error("Failed to fetch user posts");
        const postsData = await postsResponse.json();
        setPosts(postsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, user, isOwnProfile, toast]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isOwnProfile) return;

    setIsSaving(true);

    try {
      // Update profile through your auth context
      await updateProfile({
        name,
        bio,
      });

      // Also update the local profile user state
      if (profileUser) {
        setProfileUser({
          ...profileUser,
          name,
          bio,
        });
      }

      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className='min-h-screen flex flex-col'>
        <Navbar />
        <main className='flex-grow container mx-auto px-4 py-12'>
          <div className='animate-pulse space-y-8'>
            <div className='h-32 bg-muted rounded'></div>
            <div className='h-24 bg-muted rounded'></div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className='h-64 bg-muted rounded'></div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className='min-h-screen flex flex-col'>
        <Navbar />
        <main className='flex-grow container mx-auto px-4 py-12 text-center'>
          <h1 className='text-2xl font-bold'>User not found</h1>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className='min-h-screen flex flex-col'>
      <Navbar />

      <main className='flex-grow py-12'>
        <div className='container mx-auto px-4'>
          {/* Profile Header */}
          <div className='bg-white rounded-xl shadow-sm border border-border p-6 md:p-8'>
            {isEditing ? (
              <form onSubmit={handleSaveProfile} className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='name'>Name</Label>
                  <Input
                    id='name'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='bio'>Bio</Label>
                  <Textarea
                    id='bio'
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder='Tell us about yourself...'
                    rows={4}
                  />
                </div>

                <div className='flex gap-3'>
                  <Button type='submit' disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => {
                      setIsEditing(false);
                      setName(profileUser.name);
                      setBio(profileUser.bio || "");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center'>
                    <div className='w-16 h-16 rounded-full bg-primary/30 flex items-center justify-center text-primary text-2xl'>
                      {profileUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div className='ml-4'>
                      <h1 className='text-2xl font-bold font-serif'>
                        {profileUser.name}
                      </h1>
                      <p className='text-muted-foreground'>
                        Member since{" "}
                        {new Date(profileUser.createdAt).getFullYear()}
                      </p>
                    </div>
                  </div>

                  {isOwnProfile && (
                    <Button onClick={() => setIsEditing(true)}>
                      Edit Profile
                    </Button>
                  )}
                </div>

                {profileUser.bio && <p className='mt-6'>{profileUser.bio}</p>}
              </>
            )}
          </div>

          {/* User Posts */}
          <h2 className='text-2xl font-bold font-serif mt-12 mb-6'>
            {isOwnProfile ? "Your Posts" : `${profileUser.name}'s Posts`}
          </h2>

          {posts.length > 0 ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          ) : (
            <div className='bg-muted/30 rounded-xl p-12 text-center'>
              <h3 className='text-lg font-medium mb-2'>
                {isOwnProfile
                  ? "You haven't written any posts yet"
                  : "This user hasn't written any posts yet"}
              </h3>
              {isOwnProfile && (
                <p className='text-muted-foreground'>
                  Create your first post to share your thoughts with the world.
                </p>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
