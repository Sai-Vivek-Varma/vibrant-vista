
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PostEditor from '@/components/PostEditor';
import { useAuthContext } from '@/contexts/AuthContext';

const EditPost = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthContext();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect unauthenticated users to login
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user || !id) {
    return null; // Don't render anything if not authenticated or no post ID
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold font-serif mb-8">Edit Post</h1>
          
          <PostEditor postId={id} />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default EditPost;
