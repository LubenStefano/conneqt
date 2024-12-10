import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideFirebaseApp(() =>
      initializeApp({
        projectId: 'conneqt-9ade2',
        appId: '1:984817012255:web:eb44e2b45cf499b5880f2a',
        storageBucket: 'conneqt-9ade2.firebasestorage.app',
        apiKey: 'AIzaSyCi7kvv3bpINYbrbtJPl4Jtml-_GRSURAg',
        authDomain: 'conneqt-9ade2.firebaseapp.com',
        messagingSenderId: '984817012255',
        measurementId: 'G-0S7CZ2MHCV',
      })
    ),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()), 
  ],
};
