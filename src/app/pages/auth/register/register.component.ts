import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonSpinner,
  IonText,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowForwardOutline,
  lockClosedOutline,
  mailOutline,
  personOutline,
  schoolOutline,
} from 'ionicons/icons';

import { AuthService } from '../../../core/auth/auth.service';

@Component({
  standalone: true,
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  imports: [
    FormsModule,
    RouterModule,
    IonButton,
    IonContent,
    IonIcon,
    IonInput,
    IonItem,
    IonSpinner,
    IonText,
  ],
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  displayName = '';
  email = '';
  password = '';
  confirmPassword = '';
  loading = false;
  errorMessage = '';
  infoMessage = '';

  constructor() {
    addIcons({
      arrowForwardOutline,
      lockClosedOutline,
      mailOutline,
      personOutline,
      schoolOutline,
    });
  }

  async submit(): Promise<void> {
    this.errorMessage = '';
    this.infoMessage = '';

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Las contrasenas no coinciden.';
      return;
    }

    this.loading = true;

    try {
      await this.authService.register(this.email, this.password, this.displayName);
      this.infoMessage = 'Cuenta creada correctamente.';
      await this.router.navigateByUrl('/main');
    } catch (error) {
      this.errorMessage = this.authService.getErrorMessage(error);
      console.error(error);
    } finally {
      this.loading = false;
    }
  }

  goToLogin(): void {
    void this.router.navigate(['/login']);
  }
}
