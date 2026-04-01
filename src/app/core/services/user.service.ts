// ----- IMPORTACIONES NATIVA-----
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

// ----- IMPORTACIONES DE DOMINIO -----
import { UserProfile } from '../models/user.models';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor() { }

  // Datos mockeados para simular la carga de un perfil de usuario// Posteriormente realizar la implementación real con backend

    /**Flujo de datos con la información del estudiante.*/
  getMockUserProfile(): Observable<UserProfile> {
    const mockUser: UserProfile = {
      uid: '12345-abc',
      displayName: 'Juan José Moreno',
      email: 'juan@uniremington.edu.co',
      academicProgram: 'Ingeniería de Sistemas',
      semester: 9,
      role: 'estudiante',
      avatarUrl: 'https://ionicframework.com/docs/img/demos/avatar.svg',
      createdAt: new Date()
    };
    
    return of(mockUser);
  }
}