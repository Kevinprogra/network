import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const THEME_STORAGE_KEY = 'socializa-theme';
const DARK_CLASS_NAME = 'ion-palette-dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly darkModeSubject = new BehaviorSubject<boolean>(false);

  readonly darkMode$ = this.darkModeSubject.asObservable();

  initializeTheme(): void {
    const stored = this.readStoredPreference();
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
    const isDark = stored ?? prefersDark;

    this.applyDarkMode(isDark, false);
  }

  setDarkMode(enabled: boolean): void {
    this.applyDarkMode(enabled, true);
  }

  private applyDarkMode(enabled: boolean, persist: boolean): void {
    const root = this.document.documentElement;
    root.classList.toggle(DARK_CLASS_NAME, enabled);
    this.darkModeSubject.next(enabled);

    if (persist) {
      window.localStorage.setItem(THEME_STORAGE_KEY, enabled ? 'dark' : 'light');
    }
  }

  private readStoredPreference(): boolean | null {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);

    if (stored === 'dark') {
      return true;
    }

    if (stored === 'light') {
      return false;
    }

    return null;
  }
}
