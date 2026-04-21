import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewsService } from 'src/app/core/services/news.service';

import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonSpinner
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-news',
  standalone: true,
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss'],
  imports: [
  CommonModule,
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonSpinner
  ],
})
export class NewsComponent implements OnInit {

  private newsService = inject(NewsService);

  noticias: any[] = [];
  cargando = false;

  ngOnInit() {
    console.log('ejecutando');
    this.cargarNoticias();
  }

    onImgError(event: any) {
    event.target.src = 'assets/no-image.png';}

  cargarNoticias() {
    this.cargando = true;

    this.newsService.getNoticias().subscribe({
      next: (res) => {
        console.log('NOTICIAS:', res); 
        this.noticias = res?.articles ?? [];
        this.cargando = false;
      },
      error: (err) => {
        console.error('ERROR NEWS:', err);
        this.cargando = false;
      }
    });
  }



}
