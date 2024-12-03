export interface User {
  uid: string;
  username: string;
  userPfp: string;
  savedPosts: string[];
  displayName?: string;
  photoURL?: string;
  email?: string;
  createdAt?: string | Date;
}