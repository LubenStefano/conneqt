import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, where, query, getDocs } from '@angular/fire/firestore';
import { from, map, Observable, tap } from 'rxjs';
import { Post } from '../types/post';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  constructor(private firestore: Firestore) {}

  getPosts(): Observable<Post[]> {
    const postsCollection = collection(this.firestore, 'post');
    return collectionData(postsCollection, { idField: '_id' }) as Observable<Post[]>;
  }

  createPost(content: string, creatorId: string, img?: string): Observable<Post> {
    const postsCollection = collection(this.firestore, 'post');
    const creatorDocRef = doc(this.firestore, `users/${creatorId}`);
    const date = this.formatDate(new Date());

    const newPost: Post = {
      content,
      creator: creatorDocRef,
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

  getPostsByUser(userId: string): Observable<Post[]> {
    const postsCollection = collection(this.firestore, 'post');
    
    // Create a reference to the user's document in Firestore
    const userDocRef = doc(this.firestore, `users/${userId}`);
    
    // Query to fetch posts where the creator matches the user's reference
    const q = query(postsCollection, where('creator', '==', userDocRef));
    
    return new Observable<Post[]>((observer) => {
      getDocs(q)
        .then((querySnapshot) => {
          const posts: Post[] = querySnapshot.docs.map((doc) => {
            const data = doc.data() as Post;
            return {
              ...data,
              _id: doc.id, // add document ID to each post
            };
          });
          observer.next(posts); // Emit posts to the subscriber
          observer.complete(); // Complete the observable
        })
        .catch((error) => {
          console.error('Error fetching posts for user:', error);
          observer.next([]); // Emit empty array if error occurs
          observer.complete(); // Complete the observable
        });
    });
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
