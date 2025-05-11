import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PostCard from "@/components/PostCard";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import type { Post } from "@/types/post";

// Mock data for categories
const allCategories = [
  "Technology",
  "Health",
  "Food",
  "Travel",
  "Business",
  "Lifestyle",
  "Sports",
];

const Categories = () => {
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [latestPosts, setLatestPosts] = useState<Post[]>([]);
  const [popularPosts, setPopularPosts] = useState<Post[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([]);
  const { category } = useParams<{ category?: string }>();
  const [isLoading, setIsLoading] = useState({
    all: true,
    latest: false,
    popular: false,
    featured: false,
  });
  const [activeTab, setActiveTab] = useState(category || "all");
  const { toast } = useToast();

  // Fetch all posts initially
  useEffect(() => {
    const fetchAllPosts = async () => {
      try {
        setIsLoading((prev) => ({ ...prev, all: true }));

        const postsResponse = await fetch(
          `${
            import.meta.env.VITE_API_URL ||
            "https://vibrant-vista-sa5w.onrender.com"
          }/api/posts`
        );
        if (!postsResponse.ok) throw new Error("Failed to fetch posts");
        const postsData = await postsResponse.json();
        setAllPosts(postsData);
      } catch (error) {
        console.error("Fetch error:", error);
        toast({
          title: "Error loading posts",
          description: "Couldn't fetch posts from the server",
          variant: "destructive",
        });
      } finally {
        setIsLoading((prev) => ({ ...prev, all: false }));
      }
    };

    fetchAllPosts();
  }, [toast]);

  // Fetch posts when tab changes
  const fetchPostsByTab = async (tab: string) => {
    try {
      setIsLoading((prev) => ({ ...prev, [tab]: true }));

      let endpoint = "/api/posts";
      switch (tab) {
        case "latest":
          endpoint += "/latest";
          break;
        case "popular":
          endpoint += "/popular";
          break;
        case "featured":
          endpoint += "/featured";
          break;
        default:
          return;
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL ||
          "https://vibrant-vista-sa5w.onrender.com"
        }${endpoint}`
      );

      if (!response.ok) throw new Error(`Failed to fetch ${tab} posts`);
      const data = await response.json();

      switch (tab) {
        case "latest":
          setLatestPosts(data);
          break;
        case "popular":
          setPopularPosts(data);
          break;
        case "featured":
          setFeaturedPosts(data);
          break;
      }
    } catch (error) {
      console.error(`Fetch ${tab} error:`, error);
      toast({
        title: `Error loading ${tab} posts`,
        description: `Couldn't fetch ${tab} posts from the server`,
        variant: "destructive",
      });
    } finally {
      setIsLoading((prev) => ({ ...prev, [tab]: false }));
    }
  };

  // Handle category change
  const handleCategoryChange = async (value: string) => {
    setActiveTab(value);

    // Fetch specific posts when switching to these tabs
    if (value === "latest" && latestPosts.length === 0) {
      await fetchPostsByTab("latest");
    } else if (value === "popular" && popularPosts.length === 0) {
      await fetchPostsByTab("popular");
    } else if (value === "featured" && featuredPosts.length === 0) {
      await fetchPostsByTab("featured");
    }

    toast({
      title: "Category Changed",
      description: `Now viewing ${
        value === "all" ? "all categories" : value
      } posts`,
    });
  };

  // Filter posts based on active category
  const filteredPosts =
    activeTab === "all"
      ? allPosts
      : allPosts.filter(
          (post) => post.category.toLowerCase() === activeTab.toLowerCase()
        );

  return (
    <div className='min-h-screen flex flex-col'>
      <Navbar />

      <main className='flex-grow'>
        {/* Hero Section with Parallax */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className='relative h-[40vh] min-h-[300px] overflow-hidden'
        >
          <div
            className='absolute inset-0 bg-cover bg-center bg-fixed'
            style={{
              backgroundImage: `url(${
                activeTab === "all"
                  ? "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2053&auto=format&fit=crop"
                  : activeTab === "Food"
                  ? "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?q=80&w=2070&auto=format&fit=crop"
                  : activeTab === "Technology"
                  ? "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2532&auto=format&fit=crop"
                  : activeTab === "Travel"
                  ? "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2070&auto=format&fit=crop"
                  : activeTab === "Health"
                  ? "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=2122&auto=format&fit=crop"
                  : "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2053&auto=format&fit=crop"
              })`,
              transform: "translateZ(0)",
              backgroundAttachment: "fixed",
            }}
          />
          <div className='absolute inset-0 bg-gradient-to-b from-black/70 to-black/50' />

          <div className='relative container mx-auto px-4 h-full flex flex-col justify-center items-center'>
            <motion.h1
              className='text-3xl md:text-5xl font-bold text-white font-serif mb-4 text-center'
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              {activeTab === "all" ? "All Categories" : activeTab}
            </motion.h1>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className='flex flex-wrap justify-center gap-2'
            >
              {allCategories.map((cat) => (
                <Badge
                  key={cat}
                  variant={activeTab === cat ? "default" : "outline"}
                  className='cursor-pointer bg-secondary/70 hover:bg-secondary text-white border-white/20'
                  onClick={() => handleCategoryChange(cat)}
                >
                  {cat}
                </Badge>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* Content Section */}
        <section className='py-12 bg-gradient-to-b from-white to-muted/20'>
          <div className='container mx-auto px-4'>
            <div className='max-w-4xl mx-auto'>
              <Tabs
                defaultValue={activeTab}
                onValueChange={handleCategoryChange}
                className='mb-8'
              >
                <TabsList className='grid grid-cols-2 md:grid-cols-4'>
                  <TabsTrigger value='all'>All Posts</TabsTrigger>
                  <TabsTrigger value='latest'>Latest</TabsTrigger>
                  <TabsTrigger value='popular'>Popular</TabsTrigger>
                  <TabsTrigger value='featured'>Featured</TabsTrigger>
                </TabsList>

                <div className='mt-8 relative'>
                  <TabsContent value='all' className='space-y-6'>
                    {isLoading.all ? (
                      <div className='col-span-2 py-12 text-center'>
                        <p>Loading posts...</p>
                      </div>
                    ) : (
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                        {filteredPosts.length > 0 ? (
                          filteredPosts.map((post) => (
                            <motion.div
                              key={post._id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 20 }}
                              transition={{ duration: 0.5 }}
                              whileHover={{ scale: 1.02 }}
                            >
                              <PostCard post={post} />
                            </motion.div>
                          ))
                        ) : (
                          <div className='col-span-2 py-12 text-center'>
                            <h3 className='text-xl font-semibold mb-2'>
                              No posts found
                            </h3>
                            <p className='text-muted-foreground'>
                              There are no posts in this category yet.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value='latest' className='space-y-6'>
                    {isLoading.latest ? (
                      <div className='col-span-2 py-12 text-center'>
                        <p>Loading latest posts...</p>
                      </div>
                    ) : (
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                        {latestPosts.length > 0 ? (
                          latestPosts.map((post) => (
                            <motion.div
                              key={post._id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 20 }}
                              transition={{ duration: 0.5 }}
                              whileHover={{ scale: 1.02 }}
                            >
                              <PostCard post={post} />
                            </motion.div>
                          ))
                        ) : (
                          <div className='col-span-2 py-12 text-center'>
                            <h3 className='text-xl font-semibold mb-2'>
                              No latest posts found
                            </h3>
                            <p className='text-muted-foreground'>
                              There are no latest posts to display.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value='popular' className='space-y-6'>
                    {isLoading.popular ? (
                      <div className='col-span-2 py-12 text-center'>
                        <p>Loading popular posts...</p>
                      </div>
                    ) : (
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                        {popularPosts.length > 0 ? (
                          popularPosts.map((post) => (
                            <motion.div
                              key={post._id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 20 }}
                              transition={{ duration: 0.5 }}
                              whileHover={{ scale: 1.02 }}
                            >
                              <PostCard post={post} />
                            </motion.div>
                          ))
                        ) : (
                          <div className='col-span-2 py-12 text-center'>
                            <h3 className='text-xl font-semibold mb-2'>
                              No popular posts found
                            </h3>
                            <p className='text-muted-foreground'>
                              There are no popular posts to display.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value='featured' className='space-y-6'>
                    {isLoading.featured ? (
                      <div className='col-span-2 py-12 text-center'>
                        <p>Loading featured posts...</p>
                      </div>
                    ) : (
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                        {featuredPosts.length > 0 ? (
                          featuredPosts.map((post) => (
                            <motion.div
                              key={post._id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 20 }}
                              transition={{ duration: 0.5 }}
                              whileHover={{ scale: 1.02 }}
                            >
                              <PostCard post={post} />
                            </motion.div>
                          ))
                        ) : (
                          <div className='col-span-2 py-12 text-center'>
                            <h3 className='text-xl font-semibold mb-2'>
                              No featured posts found
                            </h3>
                            <p className='text-muted-foreground'>
                              There are no featured posts to display.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </TabsContent>
                </div>
              </Tabs>
            </div>

            {/* Trending Tags */}
            <div className='mt-16 max-w-4xl mx-auto'>
              <div className='flex items-center gap-2 mb-4'>
                <Sparkles className='text-primary' size={20} />
                <h2 className='text-xl font-bold font-serif'>Trending Tags</h2>
              </div>

              <div className='flex flex-wrap gap-2'>
                {[
                  "Recipes",
                  "Cooking",
                  "Vegan",
                  "Italian",
                  "Desserts",
                  "Quick Meals",
                  "Healthy Eating",
                  "Baking",
                ].map((tag) => (
                  <Badge
                    key={tag}
                    variant='outline'
                    className='cursor-pointer hover:bg-secondary hover:text-white transition-colors'
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div className='mt-16 max-w-4xl mx-auto'>
              <motion.div
                className='bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-8 text-center'
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <h3 className='text-2xl font-bold font-serif mb-4'>
                  Stay Updated with {activeTab === "all" ? "All" : activeTab}{" "}
                  Content
                </h3>
                <p className='text-muted-foreground mb-6'>
                  Subscribe to our newsletter and never miss the latest articles
                  and updates.
                </p>

                <div className='flex flex-col sm:flex-row gap-2 max-w-md mx-auto'>
                  <input
                    type='email'
                    placeholder='Enter your email'
                    className='px-4 py-2 rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary flex-grow'
                  />
                  <Button>Subscribe</Button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Categories;
