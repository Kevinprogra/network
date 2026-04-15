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
  eyeOffOutline,
  eyeOutline,
  lockClosedOutline,
  mailOutline,
  schoolOutline,
} from 'ionicons/icons';

import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
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
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  password = '';
  showPassword = false;
  loading = false;
  errorMessage = '';
  infoMessage = '';

  constructor() {
    addIcons({
      arrowForwardOutline,
      eyeOffOutline,
      eyeOutline,
      lockClosedOutline,
      mailOutline,
      schoolOutline,
    });
  }

  async submit(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';
    this.infoMessage = '';

    try {
      await this.authService.login(this.email, this.password);
      await this.router.navigateByUrl('/main');
    } catch (error) {
      this.errorMessage = this.authService.getErrorMessage(error);
      console.error(error);
    } finally {
      this.loading = false;
    }
  }

  goToRegister(): void {
    void this.router.navigate(['/register']);
  }

  async forgotPassword(): Promise<void> {
    this.errorMessage = '';
    this.infoMessage = '';

    if (!this.email.trim()) {
      this.errorMessage = 'Ingresa primero tu correo institucional para recuperar la contrasena.';
      return;
    }

    try {
      await this.authService.resetPassword(this.email.trim());
      this.infoMessage = 'Se envio un correo para restablecer la contrasena.';
    } catch (error) {
      this.errorMessage = this.authService.getErrorMessage(error);
      console.error(error);
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
