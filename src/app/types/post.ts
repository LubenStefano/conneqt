import { DocumentReference } from '@angular/fire/firestore';

export interface Post {
  content: string;
  img?: string;
  creator: DocumentReference; 
  date: string
  likes: string[];
  comments: string[];
}
