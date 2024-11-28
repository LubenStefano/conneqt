import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, updateProfile, User, signOut, onAuthStateChanged, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Observable, BehaviorSubject, from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  constructor(private auth: Auth) {}

  
  register(userData: { email: string, username: string, password: string, img: string }): Observable<void> {
    const { email, username, password, img } = userData;

    const promise = createUserWithEmailAndPassword(this.auth, email, password).then((credential) => {
      const user = credential.user;
      return updateProfile(user, { displayName: username, photoURL: img })
    });

    return from(promise);
  }

  
  login(email: string, password: string): Observable<void> {
    const promise = signInWithEmailAndPassword(this.auth, email, password).then(() => {});
    return from(promise);
  }

  
  logout(): Observable<void> {
    const promise = signOut(this.auth);
    return from(promise);
  }

 
  getUser(): Observable<User | null> {
    return new Observable((subscriber) => {
      const unsubscribe = onAuthStateChanged(this.auth, (user) => {
        this.currentUserSubject.next(user);
        subscriber.next(user);
      });
      return unsubscribe;
    });

  }
}
