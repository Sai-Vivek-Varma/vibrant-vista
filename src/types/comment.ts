
export interface CommentType {
  _id: string;
  content: string;
  author: {
    _id: string;
    name: string;
    email: string;
  };
  post: string;
  createdAt: string;
  updatedAt: string;
}
