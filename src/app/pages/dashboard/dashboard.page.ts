import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from '../../shared/components/header/header.component'; // 

//otras importaciones necesarias
import { addIcons } from 'ionicons';
import { personOutline } from 'ionicons/icons';
;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, HeaderComponent] // <-- Aquí inyectas el Header
})
export class DashboardPage implements OnInit {
  tituloActual: string = 'Mi Perfil';

  constructor() {
    addIcons({ personOutline });
   }

  ngOnInit() {
  }
}