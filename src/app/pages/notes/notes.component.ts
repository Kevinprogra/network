import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController, IonicModule, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  addOutline,
  bookOutline,
  createOutline,
  syncOutline,
  pencilOutline,
  schoolOutline,
  trashOutline,
} from 'ionicons/icons';

import { Note, NotesSyncState } from '../../models/note.model';
import { NotesService } from '../../core/services/notes.service';
import { NotesSyncService } from '../../core/services/notes-sync.service';
import { PortalNotesSyncService } from '../../core/services/portal-notes-sync.service';

type NoteForm = {
  subject: string;
  score: number | null;
  teacherName: string;
  classroom: string;
  schedule: string;
  semester: number | null;
};

@Component({
  selector: 'app-notes',
  standalone: true,
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss'],
  imports: [IonicModule, CommonModule, FormsModule],
})
export class NotesComponent implements OnInit {
  private readonly notesService = inject(NotesService);
  private readonly notesSyncService = inject(NotesSyncService);
  private readonly portalNotesSyncService = inject(PortalNotesSyncService);
  private readonly toastController = inject(ToastController);
  private readonly alertController = inject(AlertController);

  public notes: Note[] = [];
  public syncState: NotesSyncState = {
    enabled: false,
    lastStatus: 'idle',
    source: 'Portal institucional',
  };
  public form: NoteForm = this.createEmptyForm();
  public editingNoteId: string | null = null;
  public saving = false;
  public requestingSync = false;

  constructor() {
    addIcons({
      addOutline,
      bookOutline,
      createOutline,
      syncOutline,
      pencilOutline,
      schoolOutline,
      trashOutline,
    });
  }

  ngOnInit(): void {
    this.notesService.getCurrentUserNotes().subscribe((notes) => {
      this.notes = notes;
    });

    this.notesSyncService.getCurrentSyncState().subscribe((state) => {
      this.syncState = state;
    });
  }

  get averageScore(): string {
    const validScores = this.notes
      .map((note) => Number(note.score))
      .filter((score) => Number.isFinite(score) && score > 0);

    if (!validScores.length) {
      return '0.0';
    }

    const total = validScores.reduce((sum, score) => sum + score, 0);
    return (total / validScores.length).toFixed(1);
  }

  async saveNote(): Promise<void> {
    if (!this.isFormValid) {
      await this.presentToast('Completa una materia valida y una nota entre 0.0 y 5.0.');
      return;
    }

    this.saving = true;

    try {
      const notePayload = {
        subject: this.form.subject.trim(),
        score: Number(this.form.score),
        teacherName: this.form.teacherName.trim(),
        classroom: this.form.classroom.trim(),
        schedule: this.form.schedule.trim(),
        semester:
          typeof this.form.semester === 'number' && this.form.semester >= 1
            ? Math.floor(this.form.semester)
            : null,
      };

      if (this.editingNoteId) {
        await this.notesService.updateNote(this.editingNoteId, notePayload);
        await this.presentToast('Nota actualizada correctamente.');
      } else {
        await this.notesService.createNote(notePayload);
        await this.presentToast('Nota registrada correctamente.');
      }

      this.resetForm();
    } catch (error) {
      console.error(error);
      await this.presentToast('No fue posible guardar la nota.');
    } finally {
      this.saving = false;
    }
  }

  editNote(note: Note): void {
    this.editingNoteId = note.id ?? null;
    this.form = {
      subject: note.subject,
      score: note.score,
      teacherName: note.teacherName ?? '',
      classroom: note.classroom ?? '',
      schedule: note.schedule ?? '',
      semester: note.semester ?? null,
    };
  }

  async deleteNote(note: Note): Promise<void> {
    if (!note.id) {
      return;
    }

    try {
      await this.notesService.deleteNote(note.id);

      if (this.editingNoteId === note.id) {
        this.resetForm();
      }

      await this.presentToast('Nota eliminada.');
    } catch (error) {
      console.error(error);
      await this.presentToast('No fue posible eliminar la nota.');
    }
  }

  cancelEdit(): void {
    this.resetForm();
  }

  async openSyncInfo(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Sincronizar notas',
      message:
        'La app puede dejar lista la solicitud de sincronizacion, pero la lectura automatica del portal institucional debe hacerse desde un backend seguro. Asi evitamos guardar tu clave universitaria en el frontend.',
      buttons: ['Entendido'],
    });

    await alert.present();
  }

  async toggleSync(enabled: boolean): Promise<void> {
    try {
      await this.notesSyncService.setSyncEnabled(enabled);
      await this.presentToast(
        enabled
          ? 'Sincronizacion institucional activada.'
          : 'Sincronizacion institucional desactivada.',
      );
    } catch (error) {
      console.error(error);
      this.syncState = { ...this.syncState, enabled: !enabled };
      await this.presentToast('No fue posible actualizar la preferencia de sincronizacion.');
    }
  }

  async requestSync(): Promise<void> {
    const credentials = await this.promptForPortalCredentials();

    if (!credentials) {
      return;
    }

    this.requestingSync = true;

    try {
      await this.notesSyncService.requestPortalSync();
      const response = await this.portalNotesSyncService.syncWithPortal(credentials);
      await this.notesService.upsertSyncedNotes(response.notes ?? []);
      await this.notesSyncService.markSyncSuccess(
        response.notes?.length ?? 0,
        response.accumulatedAverage,
      );
      await this.presentToast(
        `Sincronizacion completada. ${response.notes?.length ?? 0} notas importadas.`,
      );
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : 'No fue posible sincronizar con el portal.';
      await this.notesSyncService.markSyncError(message);
      await this.presentToast(message);
    } finally {
      this.requestingSync = false;
    }
  }

  protected getSyncStatusLabel(): string {
    switch (this.syncState.lastStatus) {
      case 'pending':
        return 'Solicitud pendiente';
      case 'success':
        return `Ultima sincronizacion exitosa (${this.syncState.lastImportedCount ?? 0} notas)`;
      case 'error':
        return this.syncState.lastErrorMessage || 'Ultima sincronizacion con error';
      default:
        return 'Sin sincronizaciones aun';
    }
  }

  private async promptForPortalCredentials(): Promise<{ username: string; password: string } | null> {
    return new Promise((resolve) => {
      void this.alertController
        .create({
          header: 'Sincronizar desde portal',
          message:
            'Ingresa tus credenciales institucionales solo para esta sincronizacion. La app no las guarda.',
          inputs: [
            {
              name: 'username',
              type: 'text',
              placeholder: 'Usuario institucional',
            },
            {
              name: 'password',
              type: 'password',
              placeholder: 'Contrasena',
            },
          ],
          buttons: [
            {
              text: 'Cancelar',
              role: 'cancel',
              handler: () => resolve(null),
            },
            {
              text: 'Sincronizar',
              handler: (value) => {
                const username = String(value?.username ?? '').trim();
                const password = String(value?.password ?? '');

                if (!username || !password) {
                  void this.presentToast('Ingresa usuario y contrasena para sincronizar.');
                  return false;
                }

                resolve({ username, password });
                return true;
              },
            },
          ],
        })
        .then((alert) => alert.present());
    });
  }

  private get isFormValid(): boolean {
    const subject = this.form.subject.trim();
    const score = Number(this.form.score);

    return Boolean(subject) && Number.isFinite(score) && score >= 0 && score <= 5;
  }

  private resetForm(): void {
    this.editingNoteId = null;
    this.form = this.createEmptyForm();
  }

  private createEmptyForm(): NoteForm {
    return {
      subject: '',
      score: null,
      teacherName: '',
      classroom: '',
      schedule: '',
      semester: null,
    };
  }

  private async presentToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2200,
      position: 'bottom',
    });

    await toast.present();
  }
}
