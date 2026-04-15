import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  Auth,
  authState,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from '@angular/fire/auth';
import { Firestore, doc, serverTimestamp, setDoc } from '@angular/fire/firestore';
import { map, shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly auth = inject(Auth);
  private readonly firestore = inject(Firestore);
  private readonly router = inject(Router);

  readonly user$ = authState(this.auth).pipe(shareReplay(1));
  readonly isAuthenticated$ = this.user$.pipe(map((user) => !!user));

  async login(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(this.auth, email, password);
  }

  async register(email: string, password: string, displayName: string): Promise<void> {
    const credentials = await createUserWithEmailAndPassword(this.auth, email, password);

    await updateProfile(credentials.user, { displayName });

    const profileRef = doc(this.firestore, 'profiles', credentials.user.uid);

    await setDoc(profileRef, {
      uid: credentials.user.uid,
      email,
      displayName,
      bio: '',
      avatarUrl: '',
      faculty: '',
      studyMode: '',
      academicProgram: '',
      interests: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(this.auth, email);
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    await this.router.navigateByUrl('/login');
  }

  getErrorMessage(error: unknown): string {
    const code = this.getFirebaseErrorCode(error);

    switch (code) {
      case 'auth/email-already-in-use':
        return 'Ese correo ya esta registrado.';
      case 'auth/invalid-email':
        return 'El correo no tiene un formato valido.';
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Correo o contrasena incorrectos.';
      case 'auth/weak-password':
        return 'La contrasena debe tener al menos 6 caracteres.';
      case 'auth/missing-password':
        return 'Debes ingresar una contrasena.';
      case 'auth/missing-email':
        return 'Debes ingresar un correo.';
      case 'auth/too-many-requests':
        return 'Demasiados intentos. Intenta mas tarde.';
      case 'auth/network-request-failed':
        return 'No hay conexion disponible para autenticar.';
      default:
        return 'Ocurrio un error con Firebase. Revisa la configuracion del proyecto.';
    }
  }

  private getFirebaseErrorCode(error: unknown): string | undefined {
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const code = (error as { code?: unknown }).code;
      return typeof code === 'string' ? code : undefined;
    }

    return undefined;
  }
}
