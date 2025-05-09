
import { CommentType } from './comment';

export interface Post {
  _id: string;
  title: string;
  content: string;
  excerpt: string;
  coverImage: string;
  category: string;
  author: {
    _id: string;
    name: string;
    email: string;
    bio?: string;
  };
  createdAt: string;
  updatedAt: string;
  comments?: CommentType[];
}
