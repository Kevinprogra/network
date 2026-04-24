export type CampusEventVisibility = 'public' | 'private';

export interface CampusEvent {
  id?: string;
  asunto: string;
  fecha: Date;
  lugar: string;
  userId: string;
  visibility: CampusEventVisibility;
}
