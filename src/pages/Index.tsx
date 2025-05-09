
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FeaturedPost from '@/components/FeaturedPost';
import PostCard from '@/components/PostCard';
import CategoryCard from '@/components/CategoryCard';
import NewsletterForm from '@/components/NewsletterForm';
import { Post } from '@/types/post';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([]);
  const [latestPosts, setLatestPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // For demo purposes using placeholder data
        // In a real app, you would fetch from your API
        
        // Simulating API call latency
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data for featured posts
        const mockFeaturedPosts = [
          {
            _id: '1',
            title: 'The Future of Web Development: Trends to Watch in 2025',
            excerpt: 'Discover the emerging technologies and practices that will shape web development in the coming years.',
            content: 'Lorem ipsum dolor sit amet...',
            coverImage: 'https://source.unsplash.com/random/1200x800/?web,code',
            category: 'Technology',
            author: {
              _id: '101',
              name: 'Alex Johnson',
              email: 'alex@example.com'
            },
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: '2',
            title: 'Sustainable Travel: Exploring the World Responsibly',
            excerpt: 'Learn how to minimize your environmental impact while maximizing your travel experiences.',
            content: 'Lorem ipsum dolor sit amet...',
            coverImage: 'https://source.unsplash.com/random/1200x800/?travel,nature',
            category: 'Travel',
            author: {
              _id: '102',
              name: 'Emma Roberts',
              email: 'emma@example.com'
            },
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];
        
        // Mock data for latest posts
        const mockLatestPosts = [
          {
            _id: '3',
            title: 'Mastering Modern JavaScript: Tips and Tricks',
            excerpt: 'Enhance your JavaScript skills with these advanced techniques used by professional developers.',
            content: 'Lorem ipsum dolor sit amet...',
            coverImage: 'https://source.unsplash.com/random/800x600/?javascript',
            category: 'Technology',
            author: {
              _id: '101',
              name: 'Alex Johnson',
              email: 'alex@example.com'
            },
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: '4',
            title: 'The Mediterranean Diet: Health Benefits and Delicious Recipes',
            excerpt: 'Explore the science-backed health advantages of this popular eating pattern and try some easy recipes.',
            content: 'Lorem ipsum dolor sit amet...',
            coverImage: 'https://source.unsplash.com/random/800x600/?food,mediterranean',
            category: 'Health',
            author: {
              _id: '103',
              name: 'Sarah Chen',
              email: 'sarah@example.com'
            },
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: '5',
            title: 'Financial Planning for Young Professionals',
            excerpt: 'Start building wealth early with these practical financial strategies designed for career starters.',
            content: 'Lorem ipsum dolor sit amet...',
            coverImage: 'https://source.unsplash.com/random/800x600/?finance,money',
            category: 'Business',
            author: {
              _id: '104',
              name: 'Michael Brown',
              email: 'michael@example.com'
            },
            createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: '6',
            title: 'Mindfulness Practices for Busy People',
            excerpt: 'Incorporate these simple mindfulness techniques into your daily routine to reduce stress and improve focus.',
            content: 'Lorem ipsum dolor sit amet...',
            coverImage: 'https://source.unsplash.com/random/800x600/?mindfulness,meditation',
            category: 'Lifestyle',
            author: {
              _id: '105',
              name: 'Lisa Wong',
              email: 'lisa@example.com'
            },
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: '7',
            title: 'The Rise of E-sports: A New Era of Competition',
            excerpt: 'How video game competitions have evolved into professional sports with massive audiences and opportunities.',
            content: 'Lorem ipsum dolor sit amet...',
            coverImage: 'https://source.unsplash.com/random/800x600/?esports,gaming',
            category: 'Sports',
            author: {
              _id: '106',
              name: 'Ryan Park',
              email: 'ryan@example.com'
            },
            createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];

        setFeaturedPosts(mockFeaturedPosts);
        setLatestPosts(mockLatestPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
        toast({
          title: "Error loading posts",
          description: "There was a problem loading the posts. Please try refreshing the page.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [toast]);

  // Popular categories with mock data
  const categories = [
    { name: 'Technology', count: 24, image: 'https://source.unsplash.com/random/600x400/?technology' },
    { name: 'Health', count: 18, image: 'https://source.unsplash.com/random/600x400/?health' },
    { name: 'Travel', count: 16, image: 'https://source.unsplash.com/random/600x400/?travel' },
    { name: 'Food', count: 12, image: 'https://source.unsplash.com/random/600x400/?food' }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold font-serif mb-6 animate-fadeIn">
                Share Your <span className="text-primary">Ideas</span>, Connect with <span className="text-secondary">Others</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-slideUp">
                A platform for creators to publish their thoughts, stories, and expertise with a passionate community.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/signup">
                  <Button size="lg" className="w-full sm:w-auto">Get Started</Button>
                </Link>
                <Link to="/about">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">Learn More</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* Featured Posts */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold font-serif mb-8">Featured Posts</h2>
            
            {isLoading ? (
              <div className="grid grid-cols-1 gap-8 h-[400px]">
                <div className="animate-pulse bg-muted rounded-xl h-full"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {featuredPosts.map((post) => (
                  <FeaturedPost key={post._id} post={post} />
                ))}
              </div>
            )}
          </div>
        </section>
        
        {/* Latest Posts and Categories */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
              {/* Latest Posts */}
              <div className="col-span-2">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold font-serif">Latest Posts</h2>
                  <Link to="/posts" className="text-primary font-medium hover:underline">
                    View All
                  </Link>
                </div>
                
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="animate-pulse bg-white rounded-xl h-80"></div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {latestPosts.map((post) => (
                      <PostCard key={post._id} post={post} />
                    ))}
                  </div>
                )}
              </div>
              
              {/* Sidebar with Categories and Newsletter */}
              <div className="space-y-8">
                {/* Categories */}
                <div>
                  <h3 className="text-xl font-bold font-serif mb-6">Popular Categories</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
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
