import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FeaturedPost from "@/components/FeaturedPost";
import PostCard from "@/components/PostCard";
import CategoryCard from "@/components/CategoryCard";
import NewsletterForm from "@/components/NewsletterForm";
import { Post } from "@/types/post";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([]);
  const [latestPosts, setLatestPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState([
    {
      name: "Technology",
      count: 24,
      image: "https://source.unsplash.com/random/600x400/?technology",
    },
    {
      name: "Health",
      count: 18,
      image: "https://source.unsplash.com/random/600x400/?health",
    },
    {
      name: "Travel",
      count: 16,
      image: "https://source.unsplash.com/random/600x400/?travel",
    },
    {
      name: "Food",
      count: 12,
      image: "https://source.unsplash.com/random/600x400/?food",
    },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);

        // Fetch featured posts
        const featuredResponse = await fetch(
          "http://localhost:5000/api/posts/featured"
        );
        if (!featuredResponse.ok)
          throw new Error("Failed to fetch featured posts");
        const featuredData = await featuredResponse.json();

        // Fetch latest posts
        const latestResponse = await fetch(
          "http://localhost:5000/api/posts/latest"
        );
        if (!latestResponse.ok) throw new Error("Failed to fetch latest posts");
        const latestData = await latestResponse.json();

        setFeaturedPosts(featuredData);
        setLatestPosts(latestData);
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

  return (
    <div className='min-h-screen flex flex-col'>
      <Navbar />

      <main className='flex-grow'>
        {/* Hero Section */}
        <section className='bg-gradient-to-r from-primary/10 to-secondary/10 py-16 md:py-24'>
          <div className='container mx-auto px-4'>
            <div className='max-w-3xl mx-auto text-center'>
              <h1 className='text-4xl md:text-6xl font-bold font-serif mb-6 animate-fadeIn'>
                Share Your <span className='text-primary'>Ideas</span>, Connect
                with <span className='text-secondary'>Others</span>
              </h1>
              <p className='text-lg md:text-xl text-muted-foreground mb-8 animate-slideUp'>
                A platform for creators to publish their thoughts, stories, and
                expertise with a passionate community.
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
                  <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4'>
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

                {/* Newsletter */}
                <div>
                  <NewsletterForm />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
