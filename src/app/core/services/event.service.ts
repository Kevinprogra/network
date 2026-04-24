import { EnvironmentInjector, Injectable, inject, runInInjectionContext } from '@angular/core';
import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Timestamp } from 'firebase/firestore';
import { Observable, defer } from 'rxjs';
import { map } from 'rxjs/operators';

import { CampusEvent, CampusEventVisibility } from '../../models/campus-event.model';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private readonly firestore = inject(Firestore);
  private readonly envInjector = inject(EnvironmentInjector);

  addEvent(event: CampusEvent) {
    return runInInjectionContext(this.envInjector, () => {
      const eventRef = collection(this.firestore, 'eventos');
      return addDoc(eventRef, {
        asunto: event.asunto,
        fecha: event.fecha,
        lugar: event.lugar,
        userId: event.userId,
        visibility: event.visibility,
      });
    });
  }

  updateEvent(
    id: string,
    data: Pick<CampusEvent, 'asunto' | 'fecha' | 'lugar' | 'visibility'>,
  ): Promise<void> {
    return runInInjectionContext(this.envInjector, () => {
      const ref = doc(this.firestore, 'eventos', id);
      return updateDoc(ref, {
        asunto: data.asunto,
        fecha: data.fecha,
        lugar: data.lugar,
        visibility: data.visibility,
      });
    });
  }

  deleteEvent(id: string): Promise<void> {
    return runInInjectionContext(this.envInjector, () => {
      const ref = doc(this.firestore, 'eventos', id);
      return deleteDoc(ref);
    });
  }

  getUserEvents(userId: string): Observable<CampusEvent[]> {
    return defer(() =>
      runInInjectionContext(this.envInjector, () => {
        const eventRef = collection(this.firestore, 'eventos');
        const q = query(eventRef, where('userId', '==', userId));
        return this.mapCollectionToEvents(collectionData(q, { idField: 'id' })).pipe(
          map((events) => this.sortByFechaDesc(events)),
        );
      }),
    );
  }

  getPublicEvents(): Observable<CampusEvent[]> {
    return defer(() =>
      runInInjectionContext(this.envInjector, () => {
        const eventRef = collection(this.firestore, 'eventos');
        const q = query(eventRef, where('visibility', '==', 'public'));
        return this.mapCollectionToEvents(collectionData(q, { idField: 'id' })).pipe(
          map((events) => this.sortByFechaDesc(events)),
        );
      }),
    );
  }

  private sortByFechaDesc(events: CampusEvent[]): CampusEvent[] {
    return [...events].sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
  }

  private mapCollectionToEvents(
    source: ReturnType<typeof collectionData>,
  ): Observable<CampusEvent[]> {
    return source.pipe(
      map((rows) =>
        (rows as Record<string, unknown>[]).map((row) => this.mapDocToCampusEvent(row)),
      ),
    );
  }

  private mapDocToCampusEvent(raw: Record<string, unknown>): CampusEvent {
    const fechaRaw = raw['fecha'];
    let fecha: Date;

    if (fechaRaw instanceof Timestamp) {
      fecha = fechaRaw.toDate();
    } else if (fechaRaw instanceof Date) {
      fecha = fechaRaw;
    } else {
      fecha = new Date(0);
    }

    const visibilityRaw = raw['visibility'];
    const visibility: CampusEventVisibility =
      visibilityRaw === 'private' ? 'private' : 'public';

    return {
      id: typeof raw['id'] === 'string' ? raw['id'] : undefined,
      asunto: String(raw['asunto'] ?? ''),
      fecha,
      lugar: String(raw['lugar'] ?? ''),
      userId: String(raw['userId'] ?? ''),
      visibility,
    };
  }
}
