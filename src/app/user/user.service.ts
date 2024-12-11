import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  updateProfile,
  User,
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from '@angular/fire/auth';
import {
  arrayRemove,
  arrayUnion,
  doc,
  docData,
  DocumentReference,
  Firestore,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { Observable, BehaviorSubject, from, of, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { ErrorHandlerService } from '../error/error-handling.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private errorHandler: ErrorHandlerService
  ) { }

  register(userData: {
    email: string;
    username: string;
    password: string;
    img: string;
  }): Observable<void> {
    const { email, username, password, img } = userData;

    return from(
      createUserWithEmailAndPassword(this.auth, email, password)
    ).pipe(
      switchMap((credential) => {
        const user = credential.user;
        return updateProfile(user, {
          displayName: username,
          photoURL: img,
        }).then(() => {
          const userDocRef = doc(this.firestore, `users/${user.uid}`);
          const userDocData = {
            uid: user.uid,
            email: user.email,
            displayName: username,
            photoURL: img,
            createdAt: new Date().toISOString(),
            savedPosts: [],
          };
          return setDoc(userDocRef, userDocData);
        });
      }),
      catchError((error) => {
        console.error('Error during registration:', error);
        throw new Error(error.code);
      })
    );
  }

  login(
    email: string,
    password: string
  ): Observable<{ uid: string; displayName: string }> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap((credential) => {
        const user = credential.user;
        return of({
          uid: user.uid,
          displayName: user.displayName || 'No Name',
        });
      }),
      catchError((error) => {
        console.error(error.code);

        throw new Error(error.code);
      })
    );
  }

  logout(): Observable<void> {
    return from(signOut(this.auth)).pipe(
      catchError((error) => {
        console.error('Error during logout:', error);
        throw new Error('Logout failed');
      })
    );
  }

  getUser(): Observable<User | null> {
    return new Observable((subscriber) => {
      onAuthStateChanged(this.auth, (user) => {
        if (user) {
          this.getUserFromFirestore(user.uid)
            .pipe(
              catchError((error) => {
                console.error('Error fetching user from Firestore:', error);
                return of(null);
              })
            )
            .subscribe((firestoreUser) => {
              this.currentUserSubject.next(firestoreUser);
              subscriber.next(firestoreUser);
            });
        } else {
          this.currentUserSubject.next(null);
          subscriber.next(null);
        }
      });
    });
  }
  getUserById(uid: string): Observable<User | null> {
    return new Observable((subscriber) => {
      this.getUserFromFirestore(uid)
        .pipe(
          catchError((error) => {
            console.error('Error fetching user by ID:', error);
            return of(null);
          })
        )
        .subscribe((firestoreUser) => {
          subscriber.next(firestoreUser);
          subscriber.complete();
        });
    });
  }

  private getUserFromFirestore(uid: string): Observable<User | null> {
    const userDocRef = doc(this.firestore, `users/${uid}`);
    return docData(userDocRef, { idField: 'uid' }).pipe(
      catchError((error) => {
        console.error('Error fetching user from Firestore:', error);
        return of(null);
      })
    );
  }

  getUserByReference(userRef: DocumentReference): Observable<any> {
    return docData(userRef, { idField: 'uid' }).pipe(
      catchError((error) => {
        console.error('Error fetching user by reference:', error);
        return of(null);
      })
    );
  }

  savePost(userId: string, postId: string): Observable<void> {
    const userDocRef = doc(this.firestore, `users/${userId}`);
    return from(updateDoc(userDocRef, { savedPosts: arrayUnion(postId) })).pipe(
      catchError((error) => {
        console.error('Error saving post:', error);
        throw new Error('Failed to save post');
      })
    );
  }

  unsavePost(userId: string, postId: string): Observable<void> {
    const userDocRef = doc(this.firestore, `users/${userId}`);
    return from(
      updateDoc(userDocRef, { savedPosts: arrayRemove(postId) })
    ).pipe(
      catchError((error) => {
        console.error('Error unsaving post:', error);
        throw new Error('Failed to unsave post');
      })
    );
  }
  updateProfile(
    userId: string,
    updates: { displayName?: string; photoURL?: string }
  ): Observable<void> {
    const userRef = doc(this.firestore, `users/${userId}`);
    return from(updateDoc(userRef, updates)).pipe(
      catchError((error) => {
        console.error('Error updating profile:', error);
        return throwError(() => new Error('Failed to update profile'));
      })
    );
  }
}
