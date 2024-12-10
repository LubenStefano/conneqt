import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  doc,
  where,
  query,
  getDocs,
  orderBy,
  docData,
  deleteDoc,
} from '@angular/fire/firestore';
import {
  getStorage,
  ref,
  uploadString,
  getDownloadURL,
} from 'firebase/storage';
import { catchError, filter, map, switchMap, take, tap } from 'rxjs/operators';
import { combineLatest, from, Observable, of, throwError } from 'rxjs';
import { Post } from '../types/post';
import {
  arrayRemove,
  arrayUnion,
  deleteField,
  limit,
  updateDoc,
} from 'firebase/firestore';
import { Comment } from '../types/comment';
import { UserService } from '../user/user.service';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  constructor(private firestore: Firestore, private userService: UserService) {}

  getPosts(): Observable<Post[]> {
    const postsCollection = collection(this.firestore, 'post');
    const postsQuery = query(
      postsCollection,
      orderBy('createdAt', 'desc'),
      limit(100)
    );
    return collectionData(postsQuery, { idField: '_id' }).pipe(
      map((posts) => posts as Post[])
    );
  }

  getPost(postId: string): Observable<Post> {
    const postRef = doc(this.firestore, `post/${postId}`);
    return docData(postRef, { idField: '_id' }).pipe(
      filter((post): post is Post => post !== null)
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
        catchError((error) => {
          console.error('Upload failed:', error);
          return throwError(() => new Error('Failed to upload image'));
        })
      );
    } catch (error) {
      console.error('Image processing failed:', error);
      return throwError(() => new Error('Failed to process image'));
    }
  }

  createPost(
    content: string,
    creatorId: string,
    img?: string
  ): Observable<Post> {
    const postsCollection = collection(this.firestore, 'post');
    const creatorDocRef = doc(this.firestore, `users/${creatorId}`);
    const date = this.formatDate(new Date());

    const newPost: Post = {
      content,
      creator: creatorDocRef,
      date,
      likes: [],
      createdAt: new Date(),
      _id: '',
      uid: creatorId,
      commentAmount: 0,
    };

    if (img) {
      newPost.img = img;
    }

    return from(addDoc(postsCollection, newPost)).pipe(
      map((docRef) => ({
        ...newPost,
        _id: docRef.id,
      }))
    );
  }
  updatePost(
    postId: string,
    content: string,
    img?: string | null
  ): Observable<void> {
    const postRef = doc(this.firestore, `post/${postId}`);
    const updateData: Partial<Post> = { content };

    if (img === null) {
      return from(
        updateDoc(postRef, {
          content,
          img: deleteField(),
        })
      );
    } else if (img !== undefined) {
      updateData.img = img;
    }

    return from(updateDoc(postRef, updateData));
  }

  deletePost(postId: string): Observable<void> {
    const postRef = doc(this.firestore, `post/${postId}`);
    return from(deleteDoc(postRef));
  }

  getPostsByUser(userId: string): Observable<Post[]> {
    const postsCollection = collection(this.firestore, 'post');
    const userDocRef = doc(this.firestore, `users/${userId}`);
    const postsQuery = query(
      postsCollection,
      where('creator', '==', userDocRef)
    );

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
  getPostById(postId: string): Observable<Post> {
    const postRef = doc(this.firestore, `post/${postId}`);
    return docData(postRef, { idField: '_id' }).pipe(
      take(1),
      map((post) => {
        if (!post) {
          throw new Error('Post not found');
        }
        return {
          ...post,
          _id: postId,
        } as Post;
      }),
      catchError((error) => {
        console.error('Error fetching post:', error);
        return throwError(() => new Error('Failed to fetch post'));
      })
    );
  }

  likePost(postId: string, userId: string): Observable<void> {
    return this.getPostById(postId).pipe(
      switchMap((postData) => {
        const postRef = doc(this.firestore, `post/${postId}`);
        const likes = postData?.likes || [];

        if (likes.includes(userId)) {
          return from(updateDoc(postRef, { likes: arrayRemove(userId) }));
        } else {
          return from(updateDoc(postRef, { likes: arrayUnion(userId) }));
        }
      }),
      catchError((error) => {
        console.error('Error updating likes:', error);
        throw error;
      })
    );
  }

  getSavedPosts(savedPostIds: string[]): Observable<Post[]> {
    if (!savedPostIds || savedPostIds.length === 0) {
      return of([]);
    }

    const posts: Observable<Post>[] = savedPostIds.map((postId) => {
      return this.getPost(postId).pipe(
        filter((post) => post !== null),
        switchMap((post) => {
          return this.userService.getUserByReference(post.creator).pipe(
            map((user) => ({
              ...post,
              creatorName: user.displayName,
              creatorPfp: user.photoURL,
              uid: user.uid,
            }))
          );
        })
      );
    });

    return combineLatest(posts).pipe(
      map((posts) => posts.filter((post) => post !== null))
    );
  }

  addComment(
    postId: string,
    content: string,
    userId: string,
    displayName: string,
    userPfp: string
  ): Observable<Comment> {
    const postCommentsCollection = collection(
      this.firestore,
      `post/${postId}/comments`
    );
    const date = this.formatDate(new Date());
    const creatorRef = doc(this.firestore, `users/${userId}`);

    const commentData = {
      _id: '',
      content: content,
      creator: creatorRef,
      uid: userId,
      createdAt: new Date(),
      date: date,
    };

    return from(addDoc(postCommentsCollection, commentData)).pipe(
      switchMap((docRef) => {
        return this.getComments(postId).pipe(
          tap((comments) => {
            const commentAmount = comments.length;
            this.updateCommentAmount(postId, commentAmount).subscribe();
          }),
          map(() => ({
            ...commentData,
            _id: docRef.id,
          }))
        );
      })
    );
  }
  deleteComment(postId: string, commentId: string): Observable<void> {
    const postCommentRef = doc(
      this.firestore,
      `post/${postId}/comments/${commentId}`
    );
    return from(deleteDoc(postCommentRef));
  }
  updateComment(
    postId: string,
    commentId: string,
    content: string
  ): Observable<void> {
    const commentRef = doc(
      this.firestore,
      `post/${postId}/comments/${commentId}`
    );
    return from(updateDoc(commentRef, { content }));
  }
  getComments(postId: string): Observable<Comment[]> {
    const postCommentsCollection = collection(
      this.firestore,
      `post/${postId}/comments`
    );
    const postCommentsQuery = query(
      postCommentsCollection,
      orderBy('createdAt', 'desc')
    );

    return collectionData(postCommentsQuery, { idField: '_id' }).pipe(
      switchMap((comments: any[]) => {
        const commentWithUserData = comments.map((comment) =>
          this.userService.getUserByReference(comment.creator).pipe(
            map((user) => ({
              ...comment,
              createdAt: comment.createdAt.toDate(),
              _id: comment._id || '',
              displayName: user.displayName || 'Unknown User',
              userPfp: user.photoURL || '',
            }))
          )
        );
        return combineLatest(commentWithUserData);
      }),
      tap((comments: Comment[]) => {
        this.updateCommentAmount(postId, comments.length).subscribe();
      })
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

  updateCommentAmount(postId: string, amount: number): Observable<void> {
    const postRef = doc(this.firestore, `post/${postId}`);
    return from(updateDoc(postRef, { commentAmount: amount }));
  }
}
