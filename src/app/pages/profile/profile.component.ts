import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ActionSheetController, IonicModule } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { addIcons } from 'ionicons';
import {
  bookOutline,
  cameraOutline,
  calendarOutline,
  chevronForwardOutline,
  createOutline,
  closeOutline,
  expandOutline,
  imagesOutline,
  logOutOutline,
  moonOutline,
  notificationsOutline,
  personOutline,
  schoolOutline,
} from 'ionicons/icons';

import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { AuthService } from '../../core/auth/auth.service';
import { EventService } from '../../core/services/event.service';
import { ThemeService } from '../../core/services/theme.service';
import { Note, NotesSummary } from '../../models/note.model';
import { NotesService } from '../../core/services/notes.service';
import { ProfileService } from '../../core/services/profile.service';
import { CampusEvent } from '../../models/campus-event.model';
import { UserProfile } from '../../models/user-profile.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  imports: [IonicModule, CommonModule, RouterLink],
})
export class ProfileComponent implements OnInit {
  private readonly profileService = inject(ProfileService);
  private readonly authService = inject(AuthService);
  private readonly actionSheetController = inject(ActionSheetController);
  private readonly notesService = inject(NotesService);
  private readonly eventService = inject(EventService);
  private readonly themeService = inject(ThemeService);

  @ViewChild('avatarInput') private avatarInput?: ElementRef<HTMLInputElement>;
  @ViewChild('cameraInput') private cameraInput?: ElementRef<HTMLInputElement>;

  public currentUser: UserProfile | undefined;
  public uploadingAvatar = false;
  public showingAvatarPreview = false;
  public notesSummary: NotesSummary = {
    totalSubjects: 0,
    averageScore: 0,
  };
  public accumulatedAverage: number | null = null;
  public notes: Note[] = [];
  public showingNotesModal = false;
  public eventCount = 0;
  public darkModeEnabled = false;

  constructor() {
    addIcons({
      bookOutline,
      cameraOutline,
      calendarOutline,
      chevronForwardOutline,
      closeOutline,
      createOutline,
      expandOutline,
      imagesOutline,
      logOutOutline,
      moonOutline,
      notificationsOutline,
      personOutline,
      schoolOutline,
    });
  }

  ngOnInit(): void {
    this.profileService.getCurrentProfile().subscribe((profile) => {
      this.currentUser = profile;
      this.accumulatedAverage =
        typeof profile?.accumulatedAverage === 'number' ? profile.accumulatedAverage : null;
    });

    this.notesService.getCurrentUserNotesSummary().subscribe((summary) => {
      this.notesSummary = summary;
    });

    this.notesService.getCurrentUserNotes().subscribe((notes) => {
      this.notes = notes;
    });

    this.authService.user$
      .pipe(switchMap((user) => (user ? this.eventService.getUserEvents(user.uid) : of([] as CampusEvent[]))))
      .subscribe((events) => {
        this.eventCount = events.length;
      });

    this.themeService.darkMode$.subscribe((enabled) => {
      this.darkModeEnabled = enabled;
    });
  }

  async abrirSelectorAvatar(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      await this.cargarFotoDesdeDispositivo(CameraSource.Prompt);
      return;
    }

    const actionSheet = await this.actionSheetController.create({
      header: 'Foto de perfil',
      buttons: [
        {
          text: 'Tomar foto',
          icon: 'camera-outline',
          handler: () => {
            void this.tomarFoto();
          },
        },
        {
          text: 'Elegir de galeria',
          icon: 'images-outline',
          handler: () => {
            void this.elegirDesdeGaleria();
          },
        },
        {
          text: 'Cancelar',
          role: 'cancel',
        },
      ],
    });

    await actionSheet.present();
  }

  async onAvatarSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    await this.subirAvatar(file);
    input.value = '';
  }

  async onCameraSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    await this.subirAvatar(file);
    input.value = '';
  }

  private async tomarFoto(): Promise<void> {
    this.cameraInput?.nativeElement.click();
  }

  private async elegirDesdeGaleria(): Promise<void> {
    this.avatarInput?.nativeElement.click();
  }

  private async cargarFotoDesdeDispositivo(source: CameraSource): Promise<void> {
    try {
      const photo = await Camera.getPhoto({
        quality: 85,
        resultType: CameraResultType.Uri,
        source,
      });

      if (!photo.webPath) {
        return;
      }

      const response = await fetch(photo.webPath);
      const blob = await response.blob();
      const extension = blob.type.split('/')[1] || 'jpg';
      const file = new File([blob], `avatar-${Date.now()}.${extension}`, {
        type: blob.type || 'image/jpeg',
      });

      await this.subirAvatar(file);
    } catch (error) {
      console.error(error);
    }
  }

  private async subirAvatar(file?: File): Promise<void> {

    if (!file) {
      return;
    }

    this.uploadingAvatar = true;

    try {
      const avatarUrl = await this.profileService.uploadAvatar(file);

      if (this.currentUser) {
        this.currentUser = { ...this.currentUser, avatarUrl };
      }
    } catch (error) {
      console.error(error);
    } finally {
      this.uploadingAvatar = false;
    }
  }

  abrirVistaAvatar(): void {
    this.showingAvatarPreview = true;
  }

  cerrarVistaAvatar(): void {
    this.showingAvatarPreview = false;
  }

  abrirMaterias(): void {
    this.showingNotesModal = true;
  }

  cerrarMaterias(): void {
    this.showingNotesModal = false;
  }

  onDarkModeChange(enabled: boolean): void {
    this.themeService.setDarkMode(enabled);
  }

  toggleDarkMode(): void {
    this.themeService.setDarkMode(!this.darkModeEnabled);
  }

  protected getRoleBadgeLabel(role?: string): string {
    if (role === 'developer') {
      return 'Developer';
    }

    if (role === 'teacher') {
      return 'Profesor';
    }

    return '';
  }

  protected getRoleBadgeClass(role?: string): string {
    if (role === 'developer') {
      return 'developer-badge';
    }

    if (role === 'teacher') {
      return 'teacher-badge';
    }

    return '';
  }

  protected shouldShowRoleBadge(role?: string): boolean {
    return role === 'developer' || role === 'teacher';
  }

  async cerrarSesion(): Promise<void> {
    await this.authService.logout();
  }
}
