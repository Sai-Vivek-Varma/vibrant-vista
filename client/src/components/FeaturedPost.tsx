import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Post } from "@/types/post";

interface FeaturedPostProps {
  post: Post;
}

const FeaturedPost = ({ post }: FeaturedPostProps) => {
  const formattedDate = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
  });

  return (
    <div className='relative h-[500px] rounded-xl overflow-hidden group'>
      <div
        className='absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105'
        style={{ backgroundImage: `url(${post.coverImage})` }}
      >
        {/* Gradient overlay */}
        <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent'></div>
      </div>

      <div className='absolute bottom-0 left-0 right-0 p-6 md:p-8'>
        <Link
          to={`/categories/${post.category}`}
          className='inline-block px-3 py-1 mb-4 text-xs font-medium bg-secondary text-secondary-foreground rounded-full'
        >
          {post.category}
        </Link>
        <Link to={`/posts/${post._id}`}>
          <h2 className='text-2xl md:text-4xl font-bold mb-4 text-white font-serif line-clamp-3'>
            {post.title}
          </h2>
        </Link>
        <p className='text-white/80 line-clamp-2 mb-4'>{post.excerpt}</p>
        <div className='flex items-center'>
          <div className='w-10 h-10 rounded-full bg-primary/30 flex items-center justify-center text-white'>
            {post.author.name.charAt(0).toUpperCase()}
          </div>
          <div className='ml-3'>
            <Link
              to={`/profile/${post.author._id}`}
              className='text-white font-medium hover:text-secondary transition-colors'
            >
              {post.author.name}
            </Link>
            <p className='text-white/70 text-sm'>{formattedDate}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedPost;
