"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FeaturedPost from "@/components/FeaturedPost";
import PostCard from "@/components/PostCard";
import NewsletterForm from "@/components/NewsletterForm";
import InstagramStyleFeed from "@/components/InstagramStyleFeed";
import type { Post } from "@/types/post";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Moon,
  Sun,
  Plus,
  Search,
  TrendingUp,
  Sparkles,
  Bookmark,
  Settings,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import CategoryCard from "@/components/CategoryCard";

const Index = () => {
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([]);
  const [latestPosts, setLatestPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState([
    {
      name: "Technology",
      count: 24,
      image:
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      icon: "🖥️",
    },
    {
      name: "Health",
      count: 18,
      image:
        "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGhlYWx0aHxlbnwwfHwwfHx8MA%3D%3D",
      icon: "🏥",
    },
    {
      name: "Travel",
      count: 16,
      image:
        "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHRyYXZlbHxlbnwwfHwwfHx8MA%3D%3D",
      icon: "✈️",
    },
    {
      name: "Food",
      count: 12,
      image:
        "https://plus.unsplash.com/premium_photo-1689596509614-4190d17efb6a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTd8fGZvb2R8ZW58MHx8MHx8fDA%3D",
      icon: "🍔",
    },
    {
      name: "Science",
      count: 15,
      image:
        "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2NpZW5jZXxlbnwwfHwwfHx8MA%3D%3D",
      icon: "🔬",
    },
    {
      name: "Education",
      count: 20,
      image:
        "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZWR1Y2F0aW9ufGVufDB8fDB8fHww",
      icon: "📚",
    },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [createSpaceOpen, setCreateSpaceOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    image: "",
    icon: "🔍",
  });
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuthContext();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);

        // Fetch featured posts
        const featuredResponse = await fetch(
          `${
            import.meta.env.VITE_API_URL ||
            "https://vibrant-vista-sa5w.onrender.com"
          }/api/posts/featured`
        );
        if (!featuredResponse.ok)
          throw new Error("Failed to fetch featured posts");
        const featuredData = await featuredResponse.json();

        // Fetch latest posts
        const latestResponse = await fetch(
          `${
            import.meta.env.VITE_API_URL ||
            "https://vibrant-vista-sa5w.onrender.com"
          }/api/posts/latest`
        );
        if (!latestResponse.ok) throw new Error("Failed to fetch latest posts");
        const latestData = await latestResponse.json();

        setFeaturedPosts(featuredData);
        setLatestPosts(latestData);

        // If we have very few posts, we should indicate that there are no more to load
        if (latestData.length < 4) {
          // We'll pass this information to the InstagramStyleFeed component
          console.log("Limited posts available, disabling infinite scroll");
        }
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

    fetchPosts();
  }, [toast]);

  const handleCreateSpace = () => {
    if (!newCategory.name.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive",
      });
      return;
    }

    // Generate a random count between 5 and 30
    const randomCount = Math.floor(Math.random() * 25) + 5;

    // Create new category
    const category = {
      name: newCategory.name,
      count: randomCount,
      image:
        newCategory.image ||
        `https://source.unsplash.com/random/300x200/?${newCategory.name.toLowerCase()}`,
      icon: newCategory.icon,
      description: newCategory.description,
    };

    setCategories([...categories, category]);
    setNewCategory({ name: "", description: "", image: "", icon: "🔍" });
    setCreateSpaceOpen(false);

    toast({
      title: "Success",
      description: `${category.name} space created successfully!`,
      variant: "default",
    });
  };

  // Theme toggle button component
  const ThemeToggleButton = () => (
    <Button
      variant='ghost'
      size='icon'
      onClick={toggleTheme}
      className='fixed bottom-4 right-4 z-50 h-10 w-10 rounded-full bg-primary/10 backdrop-blur-sm'
    >
      {theme === "dark" ? (
        <Sun className='h-5 w-5' />
      ) : (
        <Moon className='h-5 w-5' />
      )}
    </Button>
  );

  // Category sidebar component
  const CategorySidebar = () => (
    <div className='bg-card rounded-xl border border-border shadow-sm overflow-hidden'>
      <button
        onClick={() => setCreateSpaceOpen(true)}
        className='w-full p-4 flex items-center gap-2 border-b border-border hover:bg-muted/50 transition-colors'
      >
        <Plus className='h-4 w-4' />
        <span className='font-medium'>Create Space</span>
      </button>
      <ScrollArea className=''>
        <div className='py-2'>
          {categories.map((category) => (
            <Link
              key={category.name}
              to={`/category/${category.name.toLowerCase()}`}
              className={`flex items-center gap-3 px-4 py-2 hover:bg-muted/50 transition-colors ${
                activeCategory === category.name ? "bg-muted/70" : ""
              }`}
              onClick={(e) => {
                e.preventDefault();
                setActiveCategory(category.name);
              }}
            >
              <div className='w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-sm'>
                {category.icon}
              </div>
              <span className='font-medium'>{category.name}</span>
              <div className='ml-auto'>
                <div className='w-2 h-2 rounded-full bg-red-500'></div>
              </div>
            </Link>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  // Additional sidebar components
  const TrendingSidebar = () => (
    <div className='bg-card rounded-xl border border-border shadow-sm p-4 mt-4'>
      <div className='flex items-center gap-2 mb-4'>
        <TrendingUp className='h-4 w-4 text-primary' />
        <h3 className='font-medium'>Trending Topics</h3>
      </div>
      <div className='space-y-3'>
        {[
          "AI in Healthcare",
          "Climate Change",
          "Remote Work",
          "Blockchain",
        ].map((topic) => (
          <div key={topic} className='flex items-center gap-2'>
            <div className='w-1 h-1 rounded-full bg-primary'></div>
            <span className='text-sm'>{topic}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const DiscoverSidebar = () => (
    <div className='bg-card rounded-xl border border-border shadow-sm p-4 mt-4'>
      <div className='flex items-center gap-2 mb-4'>
        <Sparkles className='h-4 w-4 text-primary' />
        <h3 className='font-medium'>Discover</h3>
      </div>
      <div className='space-y-2'>
        {["For You", "Following", "Recommended", "Popular"].map((item) => (
          <button
            key={item}
            className='w-full text-left px-2 py-1.5 rounded-md hover:bg-muted/50 text-sm transition-colors'
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );

  const SavedSidebar = () => (
    <div className='bg-card rounded-xl border border-border shadow-sm p-4 mt-4'>
      <div className='flex items-center gap-2 mb-4'>
        <Bookmark className='h-4 w-4 text-primary' />
        <h3 className='font-medium'>Saved Items</h3>
      </div>
      <p className='text-xs text-muted-foreground'>
        Access your bookmarked posts and topics here.
      </p>
      <Button variant='outline' size='sm' className='w-full mt-2'>
        View Saved
      </Button>
    </div>
  );

  return (
    <div className='min-h-screen flex flex-col'>
      <Navbar />

      <main className='flex-grow'>
        {user ? (
          // Instagram-style feed for logged-in users (Quora-like)
          <section className='py-2'>
            <div className='container mx-auto px-4'>
              <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
                {/* Categories sidebar - fixed on the left */}
                <div className='lg:col-span-3 lg:sticky lg:top-20 lg:self-start space-y-4'>
                  <div className='relative'>
                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                    <Input
                      placeholder='Search topics and posts'
                      className='pl-9 bg-card border-border'
                    />
                  </div>
                  <CategorySidebar />
                  <TrendingSidebar />
                </div>

                {/* Main content area */}
                <div className='lg:col-span-6'>
                  {/* Instagram/Quora-style feed with infinite scroll */}
                  <InstagramStyleFeed initialPosts={latestPosts} />
                </div>

                {/* Right sidebar */}
                <div className='lg:col-span-3 space-y-6 lg:sticky lg:top-20 lg:self-start'>
                  {/* Newsletter */}
                  <DiscoverSidebar />
                  <SavedSidebar />
                  {/* <NewsletterForm /> */}

                  {/* Create Post Button */}
                  {/* <div className='bg-card rounded-xl p-4 border border-border shadow-sm'>
                    <h3 className='text-base font-bold mb-2'>
                      Share your ideas
                    </h3>
                    <p className='text-sm text-muted-foreground mb-3'>
                      Have something interesting to share?
                    </p>
                    <Link to='/create-post' className='w-full'>
                      <Button size='sm' className='w-full'>
                        Create Post
                      </Button>
                    </Link>
                  </div> */}

                  {/* Who to follow */}
                  <div className='bg-card rounded-xl p-4 border border-border shadow-sm'>
                    <h3 className='text-base font-bold mb-3'>Who to follow</h3>
                    <div className='space-y-3'>
                      {[
                        { name: "Alex Johnson", role: "Tech Writer" },
                        { name: "Sarah Miller", role: "Health Expert" },
                        { name: "David Chen", role: "Travel Blogger" },
                      ].map((person) => (
                        <div
                          key={person.name}
                          className='flex items-center justify-between'
                        >
                          <div className='flex items-center gap-2'>
                            <div className='w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium'>
                              {person.name.charAt(0)}
                            </div>
                            <div>
                              <p className='text-sm font-medium'>
                                {person.name}
                              </p>
                              <p className='text-xs text-muted-foreground'>
                                {person.role}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant='outline'
                            size='sm'
                            className='h-7 text-xs'
                          >
                            Follow
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Settings and help */}
                  {/* <div className='bg-card rounded-xl p-4 border border-border shadow-sm'>
                    <div className='flex items-center gap-2 mb-2'>
                      <Settings className='h-4 w-4 text-muted-foreground' />
                      <h3 className='text-sm font-medium'>
                        Settings and Support
                      </h3>
                    </div>
                    <div className='grid grid-cols-2 gap-2 mt-2'>
                      <Link
                        to='/settings'
                        className='text-xs text-muted-foreground hover:text-foreground transition-colors'
                      >
                        Settings
                      </Link>
                      <Link
                        to='/help'
                        className='text-xs text-muted-foreground hover:text-foreground transition-colors'
                      >
                        Help Center
                      </Link>
                      <Link
                        to='/privacy'
                        className='text-xs text-muted-foreground hover:text-foreground transition-colors'
                      >
                        Privacy
                      </Link>
                      <Link
                        to='/terms'
                        className='text-xs text-muted-foreground hover:text-foreground transition-colors'
                      >
                        Terms
                      </Link>
                    </div>
                  </div> */}
                </div>
              </div>
            </div>
          </section>
        ) : (
          // Landing page for guests
          <>
            {/* Categories and Featured Posts in one section */}
            <section className='bg-gradient-to-r from-primary/10 to-secondary/10 py-16 md:py-24'>
              <div className='container mx-auto px-4'>
                <div className='max-w-3xl mx-auto text-center'>
                  <h1 className='text-4xl md:text-6xl font-bold font-serif mb-6 animate-fadeIn'>
                    Share Your <span className='text-primary'>Ideas</span>,
                    Connect with <span className='text-secondary'>Others</span>
                  </h1>
                  <p className='text-lg md:text-xl text-muted-foreground mb-8 animate-slideUp'>
                    A platform for creators to publish their thoughts, stories,
                    and expertise with a passionate community.
                  </p>
                  <div className='flex flex-col sm:flex-row justify-center gap-4'>
                    <Link to='/signup'>
                      <Button size='lg' className='w-full sm:w-auto'>
                        Get Started
                      </Button>
                    </Link>
                    <Link to='/about'>
                      <Button
                        size='lg'
                        variant='outline'
                        className='w-full sm:w-auto'
                      >
                        Learn More
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            {/* Featured Posts */}
            <section className='py-16'>
              <div className='container mx-auto px-4'>
                <h2 className='text-2xl md:text-3xl font-bold font-serif mb-8'>
                  Featured Posts
                </h2>

                {isLoading ? (
                  <div className='grid grid-cols-1 gap-8 h-[400px]'>
                    <div className='animate-pulse bg-muted rounded-xl h-full'></div>
                  </div>
                ) : (
                  <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                    {featuredPosts.map((post) => (
                      <FeaturedPost key={post._id} post={post} />
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Latest Posts and Categories */}
            <section className='py-16 bg-muted/30'>
              <div className='container mx-auto px-4'>
                <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12'>
                  {/* Latest Posts */}
                  <div className='col-span-2'>
                    <div className='flex justify-between items-center mb-8'>
                      <h2 className='text-2xl md:text-3xl font-bold font-serif'>
                        Latest Posts
                      </h2>
                      <Link
                        to='/posts'
                        className='text-primary font-medium hover:underline'
                      >
                        View All
                      </Link>
                    </div>

                    {isLoading ? (
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className='animate-pulse bg-white rounded-xl h-80'
                          ></div>
                        ))}
                      </div>
                    ) : (
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        {latestPosts.map((post) => (
                          <PostCard key={post._id} post={post} />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Sidebar with Categories and Newsletter */}
                  <div className='space-y-8'>
                    {/* Categories */}
                    <div>
                      <h3 className='text-xl font-bold font-serif mb-6'>
                        Popular Categories
                      </h3>
                      <div className='max-h-[calc(100vh-10px)] overflow-y-auto'>
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 p-2'>
                          {categories.map((category) => (
                            <CategoryCard
                              key={category.name}
                              name={category.name}
                              count={category.count}
                              image={category.image}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Newsletter */}
                    <div>
                      <NewsletterForm />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <Footer />

      {/* Create Space Dialog */}
      <Dialog open={createSpaceOpen} onOpenChange={setCreateSpaceOpen}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Create a new space</DialogTitle>
            <button
              className='absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground'
              onClick={() => setCreateSpaceOpen(false)}
            >
              <X className='h-4 w-4' />
              <span className='sr-only'>Close</span>
            </button>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='name' className='text-right'>
                Name
              </Label>
              <Input
                id='name'
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, name: e.target.value })
                }
                className='col-span-3'
                placeholder='e.g., Photography'
              />
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='icon' className='text-right'>
                Icon
              </Label>
              <div className='col-span-3 flex items-center gap-2'>
                <div className='w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-lg'>
                  {newCategory.icon}
                </div>
                <select
                  id='icon'
                  value={newCategory.icon}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, icon: e.target.value })
                  }
                  className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  {[
                    "🔍",
                    "📚",
                    "🖥️",
                    "🏥",
                    "✈️",
                    "🍔",
                    "🔬",
                    "🎨",
                    "🎮",
                    "🎵",
                    "📱",
                    "🏛️",
                    "🌱",
                    "🏆",
                    "📊",
                  ].map((icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='image' className='text-right'>
                Image URL
              </Label>
              <Input
                id='image'
                value={newCategory.image}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, image: e.target.value })
                }
                className='col-span-3'
                placeholder='https://example.com/image.jpg (optional)'
              />
            </div>
            <div className='grid grid-cols-4 items-start gap-4'>
              <Label htmlFor='description' className='text-right pt-2'>
                Description
              </Label>
              <Textarea
                id='description'
                value={newCategory.description}
                onChange={(e) =>
                  setNewCategory({
                    ...newCategory,
                    description: e.target.value,
                  })
                }
                className='col-span-3'
                placeholder='What is this space about?'
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setCreateSpaceOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSpace}>Create Space</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
