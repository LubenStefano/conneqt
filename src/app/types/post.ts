import { DocumentReference } from '@angular/fire/firestore';

export interface Post {
  _id: string; 
  content: string; 
  creator: DocumentReference;
  creatorName?: string; 
  creatorPfp?: string; 
  uid: string;
  date: string; 
  img?: string; 
  likes: string[]; 
  createdAt: Date; 
  commentAmount: number;
}
