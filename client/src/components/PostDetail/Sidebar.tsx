
import { Post } from '@/types/post';
import { Link } from 'react-router-dom';
import NewsletterForm from '@/components/NewsletterForm';
import TableOfContents from './TableOfContents';
import RelatedPosts from './RelatedPosts';

interface SidebarProps {
  post: Post;
  relatedPosts: Post[];
}

const Sidebar = ({ post, relatedPosts }: SidebarProps) => {
  return (
    <div className="space-y-8">
      {/* Author Info */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-border shadow-sm">
        <h3 className="text-lg font-bold font-serif mb-4">About the Author</h3>
        <div className="flex items-center">
          <div className="w-14 h-14 rounded-full bg-primary/30 flex items-center justify-center text-primary text-xl">
            {post.author.name.charAt(0).toUpperCase()}
          </div>
          <div className="ml-4">
            <Link to={`/profile/${post.author._id}`} className="font-medium hover:text-primary transition-colors">
              {post.author.name}
            </Link>
          </div>
        </div>
        {post.author.bio && (
          <p className="mt-4 text-muted-foreground">{post.author.bio}</p>
        )}
        <Link to={`/profile/${post.author._id}`} className="mt-4 inline-block text-primary font-medium hover:text-primary/80">
          View all posts
        </Link>
      </div>
      
      {/* Table of Contents */}
      <TableOfContents content={post.content} />
      
      {/* Related Posts */}
      <RelatedPosts posts={relatedPosts} />
      
      {/* Newsletter */}
      <NewsletterForm />
    </div>
  );
};

export default Sidebar;
