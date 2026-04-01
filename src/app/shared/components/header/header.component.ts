// IMPORTACIONES NATIVAS (Angular Core)
import { Component, Input, OnInit } from '@angular/core';

//  FRAMEWORK UI (Ionic)
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

//  RECURSOS GRÁFICOS (Iconos Standalone)
import { addIcons } from 'ionicons';
import { settingsOutline } from 'ionicons/icons';


//componentes que se usaran en toda la app
/**
 * COMPONENTE COMPARTIDO: HeaderComponent ("Dumb Component")
 * Componente visual reutilizable en toda la app. 
 * Es "tonto" porque no contiene lógica de negocio; solo renderiza lo que recibe del Padre.
 */
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class HeaderComponent implements OnInit {

  @Input() titulo: string = '';

  constructor() { 
    // 2. Lo registramos para que el Header lo pueda usar
    addIcons({ settingsOutline });
  }

  ngOnInit() {}

}