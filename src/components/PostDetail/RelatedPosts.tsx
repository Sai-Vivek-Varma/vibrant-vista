
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Post } from '@/types/post';

interface RelatedPostsProps {
  posts: Post[];
}

const RelatedPosts = ({ posts }: RelatedPostsProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-border shadow-sm">
      <h3 className="text-lg font-bold font-serif mb-4">Related Posts</h3>
      <div className="space-y-4">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div key={post._id} className="group bg-secondary/5 rounded-lg overflow-hidden border border-border hover:border-primary/30 transition-all duration-300">
              <Link to={`/posts/${post._id}`}>
                <div className="h-40 overflow-hidden">
                  <img 
                    src={post.coverImage} 
                    alt={post.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </Link>
              <div className="p-4">
                <Link to={`/posts/${post._id}`}>
                  <h4 className="font-bold hover:text-primary transition-colors line-clamp-2 group-hover:text-primary">
                    {post.title}
                  </h4>
                </Link>
                <div className="flex items-center mt-2">
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground text-sm">No related posts found</p>
        )}
      </div>
    </div>
  );
};

export default RelatedPosts;
