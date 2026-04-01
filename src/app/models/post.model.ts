export interface Post {
  id?: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  content: string;
  likesCount: number;
  commentsCount: number;
  createdAt?: unknown;
}
