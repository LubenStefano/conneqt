import { DocumentReference } from '@angular/fire/firestore';

export interface Post {
  content: string;
  img?: string;
  creator: DocumentReference;  // Use DocumentReference to store Firestore reference to the user
  date: string;
  likes: string[];
  comments: string[];
}
