
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Post } from '@/types/post';

interface PostHeroProps {
  post: Post;
}

const PostHero = ({ post }: PostHeroProps) => {
  const formattedDate = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });
  
  return (
    <section className="relative h-[60vh] min-h-[400px]">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${post.coverImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/50"></div>
      </div>
      
      <div className="relative container mx-auto px-4 h-full flex flex-col justify-end pb-12">
        <Link to={`/categories/${post.category}`} className="inline-block px-3 py-1 mb-4 text-xs font-medium bg-secondary text-secondary-foreground rounded-full backdrop-blur-sm">
          {post.category}
        </Link>
        <h1 className="text-3xl md:text-5xl font-bold text-white font-serif max-w-4xl animate-fade-in">
          {post.title}
        </h1>
        
        <div className="flex items-center mt-6">
          <div className="w-12 h-12 rounded-full bg-primary/30 flex items-center justify-center text-white text-lg">
            {post.author.name.charAt(0).toUpperCase()}
          </div>
          <div className="ml-4">
            <Link to={`/profile/${post.author._id}`} className="text-white font-medium hover:text-secondary transition-colors">
              {post.author.name}
            </Link>
            <div className="flex items-center text-white/70 text-sm">
              <span>{formattedDate}</span>
              <span className="mx-2">•</span>
              <span>{Math.ceil(post.content.length / 1000)} min read</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PostHero;
