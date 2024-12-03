import { DocumentReference } from '@angular/fire/firestore';

export interface Post {
  _id: string; 
  content: string; 
  creator: DocumentReference;
  creatorName?: string; 
  creatorPfp?: string; 
  date: string; 
  img?: string; 
  likes: string[]; 
  comments: string[]; 
  createdAt: Date; 
}
