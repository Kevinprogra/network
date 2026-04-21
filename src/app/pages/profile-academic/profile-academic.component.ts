import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonList,
  IonNote,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

import { ProfileService } from '../../core/services/profile.service';
import { UserProfile } from '../../models/user-profile.model';

type AcademicCatalog = Record<string, Record<string, string[]>>;

const ACADEMIC_CATALOG: AcademicCatalog = {
  'Ciencias Empresariales': {
    Distancia: [
      'Administracion de Negocios',
      'Especializacion en Alta Gerencia',
    ],
    Virtual: [
      'Administracion de Empresas',
      'Administracion de Negocios',
      'Especializacion en Gerencia de Proyectos',
      'Especializacion en Gerencia de Desarrollo Humano',
      'Especializacion en Gerencia del Turismo',
      'Maestria en Administracion',
      'Mercadeo y Estrategia Comercial',
    ],
  },
  'Ciencias Contables': {
    Distancia: ['Contaduria Publica'],
    Virtual: [
      'Contaduria Publica',
      'Especializacion en Auditoria y Control',
      'Especializacion en Cumplimiento Antilavado de Activos',
    ],
  },
  Ingenierias: {
    Distancia: [
      'Ingenieria de Sistemas',
      'Ingenieria de Seguridad y Salud en el Trabajo',
      'Ingenieria Industrial',
    ],
    Virtual: [
      'Especializacion en Analitica de Datos',
      'Especializacion en Direccion de Operaciones de Mejoramiento',
      'Especializacion en Transformacion Digital Productiva',
      'Ingenieria de Sistemas',
      'Ingenieria Industrial',
      'Tecnologia en Desarrollo de Software',
    ],
  },
  Diseno: {
    Virtual: [
      'Diseno de Espacios y Entornos Virtuales',
      'Profesional en Diseno Grafico',
    ],
  },
  'Ciencias Juridicas y Politicas': {
    Presencial: ['Derecho'],
    Virtual: ['Derecho', 'Tecnologia en Gestion de Derechos Humanos'],
  },
  'Medicina Veterinaria': {
    Virtual: ['Administracion de Empresas Agropecuarias'],
  },
};

@Component({
  selector: 'app-profile-academic',
  standalone: true,
  templateUrl: './profile-academic.component.html',
  styleUrls: ['./profile-academic.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonBackButton,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonInput,
    IonItem,
    IonList,
    IonNote,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    IonTitle,
    IonToolbar,
  ],
})
export class ProfileAcademicComponent implements OnInit {
  private static readonly MIN_SEMESTER = 1;
  private static readonly MAX_SEMESTER = 20;

  private readonly profileService = inject(ProfileService);
  private readonly router = inject(Router);

  protected currentUser: UserProfile | undefined;
  protected userDataEdit: Partial<UserProfile> = {};
  protected saving = false;
  protected semesterError = '';
  protected readonly faculties = Object.keys(ACADEMIC_CATALOG);

  ngOnInit(): void {
    this.profileService.getCurrentProfile().subscribe((profile) => {
      this.currentUser = profile;
      this.userDataEdit = profile ? { ...profile } : {};
      this.ensureAcademicSelectionConsistency();
    });
  }

  protected get availableStudyModes(): string[] {
    const faculty = this.userDataEdit.faculty;

    if (!faculty || !(faculty in ACADEMIC_CATALOG)) {
      return [];
    }

    return Object.keys(ACADEMIC_CATALOG[faculty]);
  }

  protected get availableAcademicPrograms(): string[] {
    const faculty = this.userDataEdit.faculty;
    const studyMode = this.userDataEdit.studyMode;

    if (!faculty || !studyMode) {
      return [];
    }

    return ACADEMIC_CATALOG[faculty]?.[studyMode] ?? [];
  }

  protected onFacultyChange(): void {
    this.userDataEdit.studyMode = '';
    this.userDataEdit.academicProgram = '';
  }

  protected onStudyModeChange(): void {
    this.userDataEdit.academicProgram = '';
  }

  async guardarCambios(): Promise<void> {
    const normalizedSemester = this.normalizeSemester(this.userDataEdit.semester);

    if (normalizedSemester === null) {
      this.semesterError = `El semestre actual debe estar entre ${ProfileAcademicComponent.MIN_SEMESTER} y ${ProfileAcademicComponent.MAX_SEMESTER}.`;
      return;
    }

    this.ensureAcademicSelectionConsistency();
    this.semesterError = '';
    this.saving = true;

    try {
      await this.profileService.updateCurrentProfile({
        ...this.userDataEdit,
        semester: normalizedSemester,
        displayName: this.userDataEdit.displayName?.trim() || 'Usuario',
        faculty: this.userDataEdit.faculty?.trim() || '',
        studyMode: this.userDataEdit.studyMode?.trim() || '',
        academicProgram: this.userDataEdit.academicProgram?.trim() || '',
      });
      await this.router.navigateByUrl('/profile');
    } catch (error) {
      console.error(error);
    } finally {
      this.saving = false;
    }
  }

  protected onSemesterInput(value: number | string | null | undefined): void {
    if (value === null || value === undefined || value === '') {
      this.userDataEdit.semester = null;
      this.semesterError = '';
      return;
    }

    const parsedValue = typeof value === 'number' ? value : Number(value);

    if (Number.isNaN(parsedValue)) {
      this.userDataEdit.semester = null;
      this.semesterError = 'Ingresa un numero de semestre valido.';
      return;
    }

    this.userDataEdit.semester = Math.trunc(parsedValue);
    this.semesterError =
      parsedValue < ProfileAcademicComponent.MIN_SEMESTER ||
      parsedValue > ProfileAcademicComponent.MAX_SEMESTER
        ? `El semestre actual debe estar entre ${ProfileAcademicComponent.MIN_SEMESTER} y ${ProfileAcademicComponent.MAX_SEMESTER}.`
        : '';
  }

  private ensureAcademicSelectionConsistency(): void {
    const faculty = this.userDataEdit.faculty;
    const studyMode = this.userDataEdit.studyMode;
    const program = this.userDataEdit.academicProgram;

    if (!faculty || !(faculty in ACADEMIC_CATALOG)) {
      this.userDataEdit.faculty = '';
      this.userDataEdit.studyMode = '';
      return;
    }

    if (!studyMode || !ACADEMIC_CATALOG[faculty][studyMode]) {
      this.userDataEdit.studyMode = '';
      this.userDataEdit.academicProgram = '';
      return;
    }

    if (!program || !ACADEMIC_CATALOG[faculty][studyMode].includes(program)) {
      this.userDataEdit.academicProgram = '';
    }
  }

  private normalizeSemester(value: number | null | undefined): number | null {
    if (value === null || value === undefined) {
      return null;
    }

    const semester = Math.trunc(value);

    if (
      semester < ProfileAcademicComponent.MIN_SEMESTER ||
      semester > ProfileAcademicComponent.MAX_SEMESTER
    ) {
      return null;
    }

    return semester;
  }
}
