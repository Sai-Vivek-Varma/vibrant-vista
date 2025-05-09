
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface PostEditorProps {
  postId?: string; // If provided, we're editing an existing post
}

const PostEditor = ({ postId }: PostEditorProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPost, setIsLoadingPost] = useState(!!postId);
  const navigate = useNavigate();
  const { toast } = useToast();

  const categories = [
    'Technology',
    'Health',
    'Travel',
    'Food',
    'Lifestyle',
    'Business',
    'Sports',
    'Entertainment',
    'Education',
    'Personal'
  ];

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;
      
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${postId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch post');
        }
        
        const data = await response.json();
        
        setTitle(data.title);
        setContent(data.content);
        setExcerpt(data.excerpt);
        setCategory(data.category);
        setCoverImage(data.coverImage);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load post. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingPost(false);
      }
    };
    
    fetchPost();
  }, [postId, toast]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !content || !excerpt || !category) {
      toast({
        title: "Missing fields",
        description: "Please fill all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    const postData = {
      title,
      content,
      excerpt,
      category,
      coverImage: coverImage || 'https://source.unsplash.com/random/800x600/?blog'
    };
    
    try {
      const url = postId 
        ? `${import.meta.env.VITE_API_URL}/api/posts/${postId}` 
        : `${import.meta.env.VITE_API_URL}/api/posts`;
      
      const method = postId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(postData),
      });
      
      if (!response.ok) {
        throw new Error(postId ? 'Failed to update post' : 'Failed to create post');
      }
      
      const data = await response.json();
      
      toast({
        title: postId ? "Post Updated" : "Post Created",
        description: postId ? "Your post has been updated successfully." : "Your post has been created successfully.",
      });
      
      navigate(`/posts/${data._id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: postId ? "Failed to update post. Please try again." : "Failed to create post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingPost) {
    return <div className="flex justify-center items-center h-64">Loading post...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter post title"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea
          id="excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Brief summary of your post"
          rows={3}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select value={category} onValueChange={setCategory} required>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="coverImage">Cover Image URL (optional)</Label>
        <Input
          id="coverImage"
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
          placeholder="https://example.com/image.jpg"
        />
        <p className="text-xs text-muted-foreground">
          Leave blank for a random image.
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your post content here..."
          rows={15}
          required
        />
      </div>
      
      <div className="flex justify-end space-x-3">
        <Button 
          type="button" 
          variant="outline"
          onClick={() => navigate(-1)}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (postId ? 'Updating...' : 'Creating...') : (postId ? 'Update Post' : 'Create Post')}
        </Button>
      </div>
    </form>
  );
};

export default PostEditor;
