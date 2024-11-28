import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, addDoc} from '@angular/fire/firestore';
import { from, map, Observable, tap } from 'rxjs';
import { Post } from '../types/post';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  constructor(private firestore: Firestore) {}

  getPosts(): Observable<Post[]> {
    const postsCollection = collection(this.firestore, 'post');
    return collectionData(postsCollection, { idField: '_id' }) as Observable<Post[]>
  }
  
  createPost(content: string, userId: string, img?: string): Observable<Post> {
    const postsCollection = collection(this.firestore, 'post');
    const date =this.formatDate(new Date());
    const newPost: Post = {
      content,
      creator: userId,
      date,
      likes: [],
      comments: [],
    };

    if (img) {
      newPost.img = img;
    }

    return from(addDoc(postsCollection, newPost)).pipe(
      tap((docRef) => {
        console.log('Post created successfully with ID:', docRef.id);
      }),
      map((docRef) => ({
        ...newPost, 
        _id: docRef.id,
      }))
    );
  }
  formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0'); 
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); 
    const year = date.getFullYear().toString().slice(-2);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
  
    return `${day}.${month}.${year} at ${hours}:${minutes}`;
  }
}
