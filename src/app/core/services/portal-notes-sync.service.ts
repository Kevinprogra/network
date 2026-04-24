import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';
import { PortalSyncCredentials, PortalSyncResponse } from '../../models/note.model';

@Injectable({
  providedIn: 'root',
})
export class PortalNotesSyncService {
  private readonly http = inject(HttpClient);

  async syncWithPortal(credentials: PortalSyncCredentials): Promise<PortalSyncResponse> {
    const endpointUrl = environment.notesSyncEndpointUrl?.trim();

    if (!endpointUrl) {
      throw new Error(
        'No hay endpoint de sincronizacion configurado. Define notesSyncEndpointUrl en environments.',
      );
    }

    return firstValueFrom(
      this.http.post<PortalSyncResponse>(endpointUrl, {
        username: credentials.username.trim(),
        password: credentials.password,
      }),
    );
  }
}
