
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface AuthorBioProps {
  author: {
    _id: string;
    name: string;
    bio?: string;
  };
  category: string;
}

const AuthorBio = ({ author, category }: AuthorBioProps) => {
  return (
    <div className="bg-secondary/10 rounded-lg p-6 my-8">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
          {author.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-xl font-semibold">About {author.name}</h3>
          <p className="mt-2 text-muted-foreground">
            {author.bio || `${author.name} is a content creator who shares insights on ${category}.`}
          </p>
          <div className="mt-4">
            <Link to={`/profile/${author._id}`}>
              <Button variant="outline" size="sm">View Profile</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorBio;
