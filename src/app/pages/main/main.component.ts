import { Component, OnInit } from '@angular/core';
import {RouterModule } from '@angular/router';
import { FormsModule} from '@angular/forms';
import { IonicModule, } from '@ionic/angular';
import { Router } from '@angular/router';
import { HeaderComponent } from 'src/app/shared/components/header/header.component';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  standalone: true,
  imports: [RouterModule, FormsModule,RouterModule, IonicModule,HeaderComponent]
})
export class MainComponent  implements OnInit {

  constructor(private router: RouterModule) { }

  ngOnInit() {}

}
