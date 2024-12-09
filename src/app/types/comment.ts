import { DocumentReference } from '@angular/fire/firestore';

export interface Comment {
  _id: string;
  content: string;
  creator: DocumentReference;
  uid: string;
  createdAt: Date;
  date: string;
  displayName?: string;
  userPfp?: string;
}