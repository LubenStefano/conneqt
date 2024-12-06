import { DocumentReference } from '@angular/fire/firestore';

export interface Comment {
  _id: string;
  content: string;
  creator: DocumentReference;
  displayName: string;
  userPfp: string;
  uid: string;
  createdAt: Date;
  date: string;
}