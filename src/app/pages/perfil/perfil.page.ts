// ==========================================
// IMPORTACIONES NATIVAS (Angular Core)
// ==========================================
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

// ==========================================
// FRAMEWORK UI (Ionic)
// ==========================================
import { FormsModule } from '@angular/forms'; // <-- IMPORTANTE para editar datos

// ==========================================
// Capa y dominio de datos
// ==========================================
import { UserProfile } from '../../core/models/user.models';
import { UserService } from '../../core/services/user.service';

// ==========================================
//  RECURSOS GRÁFICOS (Iconos Standalone)
// ==========================================
import { addIcons } from 'ionicons';
import { 
  bookOutline, calendarOutline, moonOutline, notificationsOutline, 
  logOutOutline, settingsOutline, createOutline,
  shieldCheckmarkOutline, chevronForwardOutline, personOutline 
} from 'ionicons/icons';

/**
 * COMPONENTE DE PRESENTACIÓN: PerfilPage
 * Maneja la visualización de los datos del estudiante y la lógica de edición local.
 * Arquitectura Standalone: No depende de un módulo externo para declarar sus dependencias.
 */

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule] // <-- Añadido aquí
})

export class PerfilPage implements OnInit {
  
  public currentUser: UserProfile | undefined;
  
  // Variables para controlar el Modal de edición
  public isModalOpen = false;
  public userDataEdit: Partial<UserProfile> = {}; 

  // Registro estricto de iconos (Tree-shaking) para optimizar el peso de la app
  constructor(private userService: UserService) { 
    addIcons({ 
      bookOutline, calendarOutline, moonOutline, 
      notificationsOutline, logOutOutline, settingsOutline, createOutline,
      shieldCheckmarkOutline, chevronForwardOutline, personOutline 
    });
  }
  // --- LÓGICA DE CARGA DE DATOS --- 
  // en este caso, como no tenemos backend, vamos a simular la carga de datos con un método del UserService que devuelve un Observable con datos mockeados.
  // nota: Simula la espera asíncrona de una petición HTTP/Firebase. 
  ngOnInit() {
    this.userService.getMockUserProfile().subscribe( datos => {
      this.currentUser = datos;
    });
  }

  // --- LÓGICA DEL MODAL ---
  abrirModal() {
    if(this.currentUser) {
      // Hacemos una copia exacta para no modificar la vista hasta darle "Guardar"
      this.userDataEdit = { ...this.currentUser };
      this.isModalOpen = true;
    }
  }

  cerrarModal() {
    this.isModalOpen = false;
  }

  guardarCambios() {
    // Actualizamos el usuario actual con los datos editados
    this.currentUser = { ...this.currentUser, ...this.userDataEdit } as UserProfile;
    this.isModalOpen = false;
  }

  cerrarSesion() {
    console.log('Botón de cerrar sesión presionado');
  }
}