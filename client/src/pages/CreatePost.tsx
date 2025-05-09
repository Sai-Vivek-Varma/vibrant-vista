
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PostEditor from '@/components/PostEditor';
import { useAuthContext } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CreatePost = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect unauthenticated users to login
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return null; // Don't render anything if not authenticated
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold font-serif mb-8">Create a New Post</h1>
          
          <PostEditor />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CreatePost;
