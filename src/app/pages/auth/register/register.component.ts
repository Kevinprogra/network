import { Component } from '@angular/core';
import { FormsModule} from '@angular/forms';
import { IonicModule, } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
 

@Component({
  standalone: true,
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  imports: [IonicModule, FormsModule,RouterModule]
})


export class RegisterComponent {

  Username: string = '';
  Password: string = '';
  ConfirmPassword: string = '';


  captura() {
    console.log('Register:', this.Username, this.Password, this.ConfirmPassword);
  }



  constructor( private router: Router) { }

  



}
