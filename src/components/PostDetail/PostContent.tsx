
import { ReactNode } from 'react';
import { renderPostContent } from '@/utils/postUtils';

interface PostContentProps {
  content: string;
  coverImage: string;
  title: string;
}

const PostContent = ({ content, coverImage, title }: PostContentProps) => {
  const parsedContent = renderPostContent(content);
  
  return (
    <article className="prose prose-lg max-w-none">
      {/* Featured image in content */}
      <div className="relative rounded-lg overflow-hidden mb-8 aspect-video">
        <img 
          src={coverImage} 
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      
      {parsedContent.map((item, index) => {
        if (item.type === 'heading') {
          return (
            <h2 
              id={item.id} 
              key={item.id} 
              className="text-2xl font-bold font-serif mt-8 mb-4"
            >
              {item.content}
            </h2>
          );
        }
        
        if (item.type === 'list') {
          return (
            <ul key={item.id} className="list-disc my-4">
              {item.items.map((listItem, itemIndex) => (
                <li key={`${item.id}-item-${itemIndex}`} className="ml-6 mb-2">
                  {listItem}
                </li>
              ))}
            </ul>
          );
        }
        
        return <p key={item.id} className="mb-4">{item.content}</p>;
      })}
    </article>
  );
};

export default PostContent;
