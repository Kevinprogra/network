import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Auth } from '@angular/fire/auth';
import {
  AlertController,
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  calendarOutline,
  createOutline,
  locationOutline,
  trashOutline,
} from 'ionicons/icons';
import { BehaviorSubject, combineLatest, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { AuthService } from '../../core/auth/auth.service';
import { EventService } from '../../core/services/event.service';
import { CampusEvent, CampusEventVisibility } from '../../models/campus-event.model';

@Component({
  selector: 'app-events',
  standalone: true,
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonBackButton,
    IonButton,
    IonButtons,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonModal,
    IonSegment,
    IonSegmentButton,
    IonSpinner,
    IonText,
    IonTitle,
    IonToolbar,
  ],
})
export class EventsComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly auth = inject(Auth);
  private readonly authService = inject(AuthService);
  private readonly eventService = inject(EventService);
  private readonly toastController = inject(ToastController);
  private readonly alertController = inject(AlertController);

  private readonly feedScope$ = new BehaviorSubject<'campus' | 'mine'>('campus');

  events: CampusEvent[] = [];
  loading = true;
  feedScope: 'campus' | 'mine' = 'campus';
  currentUid: string | null = null;

  createOpen = false;
  saving = false;
  editingEventId: string | null = null;
  draftAsunto = '';
  draftLugar = '';
  draftFechaIso = '';
  draftVisibility: CampusEventVisibility = 'public';

  constructor() {
    addIcons({
      addOutline,
      calendarOutline,
      createOutline,
      locationOutline,
      trashOutline,
    });
  }

  ngOnInit(): void {
    this.authService.user$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => {
        this.currentUid = user?.uid ?? null;
      });

    combineLatest([this.feedScope$, this.authService.user$])
      .pipe(
        tap(() => {
          this.loading = true;
        }),
        switchMap(([scope, user]) =>
          scope === 'campus'
            ? this.eventService.getPublicEvents()
            : user
              ? this.eventService.getUserEvents(user.uid)
              : of([] as CampusEvent[]),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (list) => {
          this.events = list;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          void this.presentToast('No se pudieron cargar los eventos.', 'danger');
        },
      });
  }

  onFeedScopeChange(ev: CustomEvent): void {
    const value = ev.detail.value;
    if (value === 'campus' || value === 'mine') {
      this.feedScope = value;
      this.feedScope$.next(value);
    }
  }

  openCreate(): void {
    this.editingEventId = null;
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    this.draftFechaIso = now.toISOString().slice(0, 16);
    this.draftAsunto = '';
    this.draftLugar = '';
    this.draftVisibility = 'public';
    this.createOpen = true;
  }

  openEdit(event: CampusEvent): void {
    if (!event.id || !this.isMine(event)) {
      return;
    }

    this.editingEventId = event.id;
    this.draftAsunto = event.asunto;
    this.draftLugar = event.lugar;
    this.draftVisibility = event.visibility;
    this.draftFechaIso = this.dateToDatetimeLocalInput(event.fecha);
    this.createOpen = true;
  }

  closeCreate(): void {
    this.createOpen = false;
    this.editingEventId = null;
  }

  canEdit(event: CampusEvent): boolean {
    return this.isMine(event) && !!event.id;
  }

  async confirmDelete(event: CampusEvent): Promise<void> {
    if (!event.id || !this.isMine(event)) {
      return;
    }

    const alert = await this.alertController.create({
      header: 'Eliminar evento',
      message: `¿Seguro que quieres eliminar "${event.asunto}"? Esta accion no se puede deshacer.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            void this.performDelete(event.id!);
          },
        },
      ],
    });

    await alert.present();
  }

  private async performDelete(id: string): Promise<void> {
    try {
      await this.eventService.deleteEvent(id);
      void this.presentToast('Evento eliminado.', 'success');
    } catch {
      void this.presentToast('No se pudo eliminar el evento.', 'danger');
    }
  }

  private dateToDatetimeLocalInput(d: Date): string {
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  }

  async saveEvent(): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) {
      void this.presentToast('Debes iniciar sesion para publicar.', 'warning');
      return;
    }

    const asunto = this.draftAsunto.trim();
    const lugar = this.draftLugar.trim();
    if (!asunto || !lugar || !this.draftFechaIso) {
      void this.presentToast('Completa asunto, lugar y fecha.', 'warning');
      return;
    }

    const fecha = new Date(this.draftFechaIso);
    if (Number.isNaN(fecha.getTime())) {
      void this.presentToast('La fecha no es valida.', 'warning');
      return;
    }

    this.saving = true;
    try {
      if (this.editingEventId) {
        await this.eventService.updateEvent(this.editingEventId, {
          asunto,
          lugar,
          fecha,
          visibility: this.draftVisibility,
        });
        this.closeCreate();
        void this.presentToast('Evento actualizado.', 'success');
      } else {
        await this.eventService.addEvent({
          asunto,
          lugar,
          fecha,
          userId: user.uid,
          visibility: this.draftVisibility,
        });
        this.closeCreate();
        const msg =
          this.draftVisibility === 'private'
            ? 'Evento guardado (solo visible en Mis eventos).'
            : 'Evento publicado en el campus.';
        void this.presentToast(msg, 'success');
      }
    } catch {
      void this.presentToast(
        this.editingEventId ? 'No se pudo actualizar el evento.' : 'No se pudo guardar el evento.',
        'danger',
      );
    } finally {
      this.saving = false;
    }
  }

  isMine(event: CampusEvent): boolean {
    return !!this.currentUid && event.userId === this.currentUid;
  }

  private async presentToast(message: string, color: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      color,
      position: 'bottom',
    });
    await toast.present();
  }
}
