
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Post } from '@/types/post';

interface PostCardProps {
  post: Post;
}

const PostCard = ({ post }: PostCardProps) => {
  const formattedDate = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });
  
  return (
    <div className="post-card flex flex-col h-full">
      <div className="relative overflow-hidden h-56 rounded-t-xl">
        <Link to={`/posts/${post._id}`}>
          <img 
            src={post.coverImage} 
            alt={post.title} 
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </Link>
        <Link to={`/categories/${post.category}`} className="absolute top-4 left-4 px-3 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded-full">
          {post.category}
        </Link>
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <Link to={`/posts/${post._id}`}>
          <h3 className="text-xl font-bold mb-2 font-serif hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h3>
        </Link>
        <p className="text-muted-foreground mb-4 line-clamp-3">{post.excerpt}</p>
        
        <div className="flex items-center mt-auto">
          <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center text-primary">
            {post.author.name.charAt(0).toUpperCase()}
          </div>
          <div className="ml-3">
            <Link to={`/profile/${post.author._id}`} className="text-sm font-medium hover:text-primary transition-colors">
              {post.author.name}
            </Link>
            <p className="text-muted-foreground text-xs">{formattedDate}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
