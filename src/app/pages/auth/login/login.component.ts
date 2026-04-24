import { Component, ViewChild, inject } from '@angular/core';
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

  @ViewChild('emailInput', { read: IonInput }) private emailInput?: IonInput;
  @ViewChild('passwordInput', { read: IonInput }) private passwordInput?: IonInput;

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
    await this.syncAutofilledValues();

    if (!this.email.trim() || !this.password.trim()) {
      this.errorMessage = 'Ingresa tu correo y contrasena para continuar.';
      this.infoMessage = '';
      return;
    }

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

  private async syncAutofilledValues(): Promise<void> {
    const [emailValue, passwordValue] = await Promise.all([
      this.readIonInputValue(this.emailInput),
      this.readIonInputValue(this.passwordInput),
    ]);

    if (emailValue) {
      this.email = emailValue;
    }

    if (passwordValue) {
      this.password = passwordValue;
    }
  }

  private async readIonInputValue(input?: IonInput): Promise<string> {
    if (!input) {
      return '';
    }

    const nativeInput = await input.getInputElement();
    return nativeInput?.value?.trim() ?? '';
  }
}
