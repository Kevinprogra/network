import { Component } from '@angular/core';
import { FormsModule} from '@angular/forms';
import { IonicModule, } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
 



@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [FormsModule, IonicModule, RouterModule,]


})
export class LoginComponent {


  username: string = '';  
  password: string = '';

 

 register() {
  this.router.navigate(['/register']);
 }



 
  captura() {
    console.log('Login:', this.username, this.password);
  }


  

  





  constructor(private router: Router,) { }
}