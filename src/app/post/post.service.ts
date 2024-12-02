import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, where, query, getDocs, orderBy } from '@angular/fire/firestore';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { from, Observable, throwError } from 'rxjs';
import { Post } from '../types/post';
import { limit } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  constructor(private firestore: Firestore) {}

  getPosts(): Observable<Post[]> {
    const postsCollection = collection(this.firestore, 'post');
    const postsQuery = query(
      postsCollection,
      orderBy('createdAt', 'desc'),  // Order by 'createdAt' in descending order (newest first)
      limit(100)  // Limit the results to 100 posts
    );
    return collectionData(postsQuery, { idField: '_id' }).pipe(
      map((posts) => posts as Post[])
    );
  }

  uploadImageToFirebase(base64Image: string): Observable<string> {
    if (!base64Image) {
      return throwError(() => new Error('No image provided'));
    }

    try {
      const storage = getStorage();
      const fileName = `images/${Date.now()}.png`;
      const storageRef = ref(storage, fileName);

      return from(uploadString(storageRef, base64Image, 'data_url')).pipe(
        switchMap(() => getDownloadURL(storageRef)),
        catchError(error => {
          console.error('Upload failed:', error);
          return throwError(() => new Error('Failed to upload image'));
        })
      );
    } catch (error) {
      console.error('Image processing failed:', error);
      return throwError(() => new Error('Failed to process image'));
    }
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
      createdAt: new Date(),
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
    const userDocRef = doc(this.firestore, `users/${userId}`);
    const postsQuery = query(postsCollection, where('creator', '==', userDocRef));

    return new Observable<Post[]>((observer) => {
      getDocs(postsQuery)
        .then((querySnapshot) => {
          const posts: Post[] = querySnapshot.docs.map((doc) => {
            const data = doc.data() as Post;
            return {
              ...data,
              _id: doc.id,
            };
          });
          observer.next(posts);
          observer.complete();
        })
        .catch((error) => {
          console.error('Error fetching posts for user:', error);
          observer.next([]);
          observer.complete();
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